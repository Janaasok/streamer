import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../socket/socketConnection";

const emojis = ["👍", "😂", "❤️", "🔥", "👏"];
const MAX_RETRY_ATTEMPTS = 5;
const BASE_RETRY_DELAY = 2000; // 2 seconds
const COOLDOWN_PERIOD = 30000; // 30 seconds

const StreamRoom = () => {
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current += 1;
    console.log(`Render count: ${renderCountRef.current}`);
  }, []);

  const { serverId } = useParams();
  console.log("Current serverId:", serverId);

  const navigate = useNavigate();
  const localCamRef = useRef(null);
  const localScreenRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [reactions, setReactions] = useState([]);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [showLiveTranscript, setShowLiveTranscript] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [interimResult, setInterimResult] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const cameraStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const [connectionError, setConnectionError] = useState(null);
  const recognitionRef = useRef(null);
  const isInitializing = useRef(true);
  const retryTimeoutRef = useRef(null);
  const retryAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);
  const cooldownActiveRef = useRef(false);

  // Improved speech-to-text functions with better error handling and retry
  const startSpeechToText = React.useCallback(() => {
    // Don't start if in cooldown period
    if (cooldownActiveRef.current) {
      console.log("In cooldown period, not starting speech recognition");
      return;
    }
    
    // Set a flag to prevent multiple concurrent operations
    if (recognitionRef.current) {
      console.log("Speech recognition already running, not starting a new instance");
      return;
    }

    // Clear any existing timeouts
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // First, check network status
    if (!navigator.onLine) {
      console.log("Network is offline, waiting for connection before starting speech recognition");
      setError("Network connection is offline. Speech recognition requires internet access.");
      
      // Try again when online
      const checkOnline = () => {
        if (navigator.onLine && showLiveTranscript && isMountedRef.current) {
          window.removeEventListener('online', checkOnline);
          console.log("Network is back online, restarting speech recognition");
          setTimeout(() => startSpeechToText(), 1000); // Short delay to ensure stable connection
        }
      };

      window.addEventListener('online', checkOnline);
      return;
    }

    // Add retry attempt limiting with longer cooldown after max attempts
    if (retryAttemptsRef.current >= MAX_RETRY_ATTEMPTS) {
      console.log("Too many retry attempts, entering cooldown period");
      setError("Speech recognition failed after multiple attempts. Will try again after cooldown period.");
      
      // Enter cooldown period
      cooldownActiveRef.current = true;
      
      // Reset retry counter after a cooldown period
      retryTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          console.log("Cooldown period ended, resetting retry counter");
          retryAttemptsRef.current = 0;
          cooldownActiveRef.current = false;
          if (showLiveTranscript) {
            startSpeechToText();
          }
        }
      }, COOLDOWN_PERIOD);
      return;
    }

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          if (isMountedRef.current) {
            console.log("Speech recognition started successfully");
            setIsRecording(true);
            setError(null);
            // Reset retry counter when successfully started
            retryAttemptsRef.current = 0;
          }
        };

        recognition.onresult = (event) => {
          if (!isMountedRef.current) return;
          
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');

          setInterimResult(transcript);

          // If this is a final result
          if (event.results[0].isFinal) {
            setResults(prev => [...prev, { transcript }]);
            setInterimResult("");

            // Send the speech as a message
            socket.emit("chat-message", `[Voice] ${transcript}`);
            setMessages(prev => [...prev, `[Voice] ${transcript}`]);
          }
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          
          if (!isMountedRef.current) return;

          // Only process if component is still mounted
          if (event.error !== 'aborted') {
            // Handle different error types appropriately
            if (event.error === 'network') {
              setError("Speech recognition network error. Check your internet connection.");
              
              // Check if we've exceeded retry attempts
              if (retryAttemptsRef.current >= MAX_RETRY_ATTEMPTS) {
                console.log("Maximum retry attempts reached. Entering cooldown period.");
                setError("Speech recognition failed after multiple attempts. Will try again after cooldown period.");
                
                // Enter cooldown period
                cooldownActiveRef.current = true;
                
                // Reset recognition state
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.stop();
                  } catch (e) {
                    console.log("Error stopping recognition during cooldown:", e);
                  }
                }
                recognitionRef.current = null;
                setIsRecording(false);
                
                // Set up cooldown period
                retryTimeoutRef.current = setTimeout(() => {
                  if (isMountedRef.current && showLiveTranscript) {
                    console.log("Cooldown period ended, resetting retry counter");
                    retryAttemptsRef.current = 0;
                    cooldownActiveRef.current = false;
                    startSpeechToText();
                  }
                }, COOLDOWN_PERIOD);
                
                return;
              }
              
              // Ensure any previous retry timer is cleared
              if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
              }
              
              // Calculate exponential backoff with a maximum delay
              const backoffDelay = Math.min(
                BASE_RETRY_DELAY * Math.pow(1.5, retryAttemptsRef.current), 
                15000 // Max 15 seconds
              );
              
              retryAttemptsRef.current += 1;
              console.log(`Network error, retry attempt ${retryAttemptsRef.current} in ${backoffDelay}ms`);
              
              // Schedule retry with backoff
              retryTimeoutRef.current = setTimeout(() => {
                if (isMountedRef.current && showLiveTranscript) {
                  // Make sure old recognition is fully stopped
                  if (recognitionRef.current) {
                    try {
                      recognitionRef.current.stop();
                    } catch (e) {
                      console.log("Error stopping previous recognition:", e);
                    }
                    recognitionRef.current = null;
                  }
                  console.log("Attempting to restart speech recognition after network error");
                  startSpeechToText();
                }
              }, backoffDelay);
            } else {
              // Handle other error types with less aggressive retry
              setError(`Speech recognition error: ${event.error}`);
              
              // Clear any existing timeout
              if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
              }
              
              retryAttemptsRef.current += 1;
              retryTimeoutRef.current = setTimeout(() => {
                if (isMountedRef.current && showLiveTranscript) {
                  console.log("Retrying speech recognition after non-network error");
                  // Make sure old recognition is fully stopped
                  if (recognitionRef.current) {
                    try {
                      recognitionRef.current.stop();
                    } catch (e) {
                      console.log("Error stopping previous recognition:", e);
                    }
                    recognitionRef.current = null;
                  }
                  startSpeechToText();
                }
              }, 3000); // Fixed 3-second delay for non-network errors
            }
          }
        };

        recognition.onend = () => {
          console.log("Speech recognition ended");
          
          if (!isMountedRef.current) {
            // Component is unmounting, don't restart
            recognitionRef.current = null;
            return;
          }
          
          setIsRecording(false);
          recognitionRef.current = null;

          // Auto-restart if it's supposed to be running (unless we're already retrying due to error or in cooldown)
          if (showLiveTranscript && !retryTimeoutRef.current && !cooldownActiveRef.current) {
            console.log("Auto-restarting speech recognition after normal end");
            retryTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current && showLiveTranscript) {
                startSpeechToText();
              }
              retryTimeoutRef.current = null;
            }, 500);
          }
        };

        // Start recognition and keep reference
        recognition.start();
        recognitionRef.current = recognition;
