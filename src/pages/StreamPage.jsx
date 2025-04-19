import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../socket/socketConnection";

const emojis = ["👍", "😂", "❤️", "🔥", "👏"];

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

  // Fixed speech-to-text functions with better error handling and retry
  const startSpeechToText = React.useCallback(() => {
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
    if (retryAttemptsRef.current > 5) {
      console.log("Too many retry attempts, cooling down before next attempt");
      setError("Speech recognition failed after multiple attempts. Please check your connection and try again later.");
      
      // Reset retry counter after a cooldown period
      retryTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          retryAttemptsRef.current = 0;
          if (showLiveTranscript) {
            startSpeechToText();
          }
        }
      }, 30000); // 30 second cooling period
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
              setError("Speech recognition network error. Check your internet connection. Retrying...");
              
              // Check if network is actually offline now
              if (!navigator.onLine) {
                const reconnectHandler = () => {
                  if (isMountedRef.current && showLiveTranscript) {
                    window.removeEventListener('online', reconnectHandler);
                    // Small delay to ensure connection stability
                    setTimeout(() => startSpeechToText(), 1500);
                  }
                };
                window.addEventListener('online', reconnectHandler);
              } else {
                // Implement exponential backoff for network errors
                retryAttemptsRef.current += 1;
                const backoffDelay = Math.min(2000 * Math.pow(1.5, retryAttemptsRef.current), 15000);
                
                // Schedule retry with backoff
                console.log(`Network error, retry attempt ${retryAttemptsRef.current} in ${backoffDelay}ms`);
                retryTimeoutRef.current = setTimeout(() => {
                  if (isMountedRef.current && showLiveTranscript) {
                    console.log("Attempting to restart speech recognition after network error");
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
                }, backoffDelay);
              }
            } else {
              // Handle other error types
              setError(`Speech recognition error: ${event.error}. Retrying...`);
              retryTimeoutRef.current = setTimeout(() => {
                if (isMountedRef.current && showLiveTranscript) {
                  startSpeechToText();
                }
              }, 2000);
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

          // Auto-restart if it's supposed to be running (unless we're already retrying due to error)
          if (showLiveTranscript && !retryTimeoutRef.current) {
            console.log("Auto-restarting speech recognition after normal end");
            retryTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current && showLiveTranscript) {
                startSpeechToText();
              }
            }, 500);
          }
        };

        // Start recognition and keep reference
        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.error("Speech recognition setup failed:", err);
        setError(`Speech recognition not available: ${err.message}`);

        // Wait and retry
        retryAttemptsRef.current++;
        retryTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current && showLiveTranscript) {
            console.log("Retrying speech recognition after setup error");
            startSpeechToText();
          }
        }, 3000);
      }
    } else {
      setError("Speech recognition not supported in this browser");
    }
  }, [showLiveTranscript]);

  const stopSpeechToText = React.useCallback(() => {
    // Clear any retry timers first
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Stop recognition if active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log("Error stopping recognition:", e);
      }
      recognitionRef.current = null;
      setIsRecording(false);
      console.log("Speech recognition stopped");
    }

    // Reset retry counter
    retryAttemptsRef.current = 0;
  }, []);

  // Toggle transcript visibility AND start/stop speech recognition
  const toggleTranscript = React.useCallback(() => {
    setShowLiveTranscript(prev => {
      const newState = !prev;

      // If turning on transcript, start speech recognition
      if (newState) {
        if (navigator.onLine) {
          startSpeechToText();
        } else {
          setError("Network appears offline. Speech recognition will start when connection restores.");
          const checkOnline = () => {
            if (navigator.onLine && isMountedRef.current) {
              window.removeEventListener('online', checkOnline);
              startSpeechToText();
            }
          };
          window.addEventListener('online', checkOnline);
        }
      }
      // If turning off transcript, stop speech recognition
      else if (isRecording) {
        stopSpeechToText();
      }

      return newState;
    });
  }, [isRecording, startSpeechToText, stopSpeechToText]);

  // Initialize component and clean up on unmount
  useEffect(() => {
    console.log("StreamRoom useEffect executing for serverId:", serverId);
    isMountedRef.current = true;

    if (isInitializing.current) {
      console.log("Initializing component (first mount or serverId change)");
      isInitializing.current = false;

      // Socket connection status check
      if (!socket.connected) {
        console.log("Socket not connected, attempting to connect");
        socket.connect();
      } else {
        console.log("Socket already connected");
      }

      socket.on("connect", () => {
        console.log("Socket connected successfully");
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        setConnectionError("Socket connection failed: " + err.message);
      });

      const init = async () => {
        try {
          console.log("Attempting to get user media");
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          console.log("Media stream obtained successfully");

          cameraStreamRef.current = stream;

          if (localCamRef.current) {
            localCamRef.current.srcObject = stream;
            console.log("Stream assigned to video element");
          } else {
            console.error("localCamRef.current is null");
          }

          peerConnectionRef.current = new RTCPeerConnection();
          console.log("RTCPeerConnection created");

          stream.getTracks().forEach((track) => {
            console.log(`Adding ${track.kind} track to peer connection`);
            peerConnectionRef.current.addTrack(track, stream);
          });

          peerConnectionRef.current.ontrack = ({ streams: [remoteStream] }) => {
            console.log("Remote track received");
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          };

          peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
              console.log("ICE candidate generated");
              socket.emit("ice-candidate", { candidate: event.candidate, to: serverId });
            }
          };

          peerConnectionRef.current.oniceconnectionstatechange = () => {
            console.log("ICE connection state:", peerConnectionRef.current.iceConnectionState);
          };

          console.log("Emitting join-room for serverId:", serverId);
          socket.emit("join-room", serverId);

          socket.on("user-joined", async () => {
            console.log("User joined, creating offer");
            try {
              const offer = await peerConnectionRef.current.createOffer();
              await peerConnectionRef.current.setLocalDescription(offer);
              console.log("Local description set, sending offer");
              socket.emit("offer", { offer, roomId: serverId });
            } catch (err) {
              console.error("Error creating offer:", err);
              setConnectionError("Failed to create connection offer: " + err.message);
            }
          });

          socket.on("offer", async ({ offer, from }) => {
            console.log("Received offer from:", from);
            try {
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
              const answer = await peerConnectionRef.current.createAnswer();
              await peerConnectionRef.current.setLocalDescription(answer);
              console.log("Created and set answer, sending");
              socket.emit("answer", { answer, to: from });
            } catch (err) {
              console.error("Error handling offer:", err);
              setConnectionError("Failed to process connection offer: " + err.message);
            }
          });

          socket.on("answer", async ({ answer }) => {
            console.log("Received answer");
            try {
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
              console.log("Remote description set from answer");
            } catch (err) {
              console.error("Error setting remote description:", err);
              setConnectionError("Failed to set remote description: " + err.message);
            }
          });

          socket.on("ice-candidate", async ({ candidate }) => {
            try {
              console.log("Received ICE candidate");
              await peerConnectionRef.current.addIceCandidate(candidate);
              console.log("Added ICE candidate successfully");
            } catch (e) {
              console.error("Error adding ice candidate", e);
              setConnectionError("Failed to add ICE candidate: " + e.message);
            }
          });

          socket.on("chat-message", (msg) => {
            console.log("Received chat message:", msg);
            setMessages((prev) => [...prev, msg]);
          });

          // Add network status monitoring
          const handleOnline = () => {
            console.log("Network connection restored");
            setError(null);
            if (showLiveTranscript && !isRecording) {
              startSpeechToText();
            }
          };

          const handleOffline = () => {
            console.log("Network connection lost");
            setError("Network connection lost. Some features may be unavailable.");
            if (isRecording) {
              stopSpeechToText();
            }
          };

          window.addEventListener('online', handleOnline);
          window.addEventListener('offline', handleOffline);

          // Delay starting speech recognition to allow component to fully render
          setTimeout(() => {
            // Auto-start speech recognition if showLiveTranscript is true at initialization
            if (showLiveTranscript && isMountedRef.current) {
              startSpeechToText();
            }
          }, 1000);

          // Cleanup function for event listeners
          return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
          };
        } catch (err) {
          console.error("Error in init function:", err);
          setConnectionError("Initialization error: " + err.message);
        }
      };

      init();
    } else {
      console.log("Skipping initialization (not first mount)");
    }

    // Cleanup function
    return () => {
      console.log("StreamRoom component unmounting, cleaning up");
      isMountedRef.current = false;
      isInitializing.current = true; // Prevent auto-restart loops during unmount

      cameraStreamRef.current?.getTracks().forEach((track) => {
        console.log(`Stopping ${track.kind} track`);
        track.stop();
      });

      screenStreamRef.current?.getTracks().forEach((track) => {
        console.log(`Stopping screen share ${track.kind} track`);
        track.stop();
      });

      if (peerConnectionRef.current) {
        console.log("Closing peer connection");
        peerConnectionRef.current.close();
      }

      // Stop speech recognition if active
      stopSpeechToText();

      // Clear any pending timeouts
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      console.log("Leaving room:", serverId);
      socket.emit("leave-room", serverId);

      // Remove all socket listeners to prevent memory leaks
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("chat-message");
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [serverId, startSpeechToText, stopSpeechToText, showLiveTranscript]);

  // Handle changes to showLiveTranscript
  useEffect(() => {
    if (!isInitializing.current && isMountedRef.current) {
      if (showLiveTranscript && !isRecording) {
        startSpeechToText();
      } else if (!showLiveTranscript && isRecording) {
        stopSpeechToText();
      }
    }
  }, [showLiveTranscript, isRecording, startSpeechToText, stopSpeechToText]);

  const sendMessage = () => {
    if (input.trim()) {
      console.log("Sending message:", input);
      socket.emit("chat-message", input);
      setMessages((prev) => [...prev, input]);
      setInput("");
    }
  };

  const toggleMic = () => {
    const audioTrack = cameraStreamRef.current?.getAudioTracks?.()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicEnabled(audioTrack.enabled);
      console.log("Mic enabled:", audioTrack.enabled);
    } else {
      console.error("No audio track available");
    }
  };

  const toggleCam = () => {
    const videoTrack = cameraStreamRef.current?.getVideoTracks?.()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCamEnabled(videoTrack.enabled);
      console.log("Camera enabled:", videoTrack.enabled);
    } else {
      console.error("No video track available");
    }
  };

  const shareScreen = async () => {
    if (isSharingScreen) {
      console.log("Stopping screen sharing");
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      localScreenRef.current.srcObject = null;
      setIsSharingScreen(false);
      return;
    }

    try {
      console.log("Starting screen sharing");
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = screenStream;
      localScreenRef.current.srcObject = screenStream;

      screenStream.getTracks().forEach((track) => {
        console.log("Adding screen track to peer connection");
        peerConnectionRef.current.addTrack(track, screenStream);
      });

      screenStream.getVideoTracks()[0].onended = () => {
        console.log("Screen sharing ended by browser");
        shareScreen(); // Automatically stop screen sharing
      };

      setIsSharingScreen(true);
    } catch (err) {
      console.error("Screen share error:", err);
      setConnectionError("Screen sharing failed: " + err.message);
    }
  };

  const sendReaction = (emoji) => {
    console.log("Sending reaction:", emoji);
    const id = Math.random().toString(36).substring(2);
    setReactions((prev) => [...prev, { id, emoji }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2000);
  };

  const leaveRoom = () => {
    console.log("User initiated leave room");
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    
    // Stop speech recognition if active
    stopSpeechToText();
    
    socket.emit("leave-room", serverId);
    socket.off();
    navigate("/");
  };

  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      backgroundColor: "#1e1f22",
      color: "white",
      fontFamily: "Segoe UI, sans-serif",
    },
    videoSection: {
      flex: 3,
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: 10,
      padding: 10,
      backgroundColor: "#2b2d31",
    },
    video: {
      width: "100%",
      height: "auto",
      aspectRatio: "16/9",
      objectFit: "cover",
      backgroundColor: "black",
      borderRadius: "12px",
    },
    chatSection: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      padding: 10,
      backgroundColor: "#1a1a1a",
      borderLeft: "1px solid #444",
    },
    messages: {
      flex: 1,
      overflowY: "auto",
      marginBottom: 10,
    },
    message: {
      backgroundColor: "#333",
      padding: "6px 10px",
      borderRadius: 6,
      marginBottom: 6,
    },
    inputArea: {
      display: "flex",
      gap: 8,
      alignItems: "center",
    },
    input: {
      flex: 1,
      padding: 8,
      borderRadius: 6,
      border: "none",
      backgroundColor: "#40444b",
      color: "white",
    },
    sendButton: {
      backgroundColor: "#5865f2",
      color: "white",
      border: "none",
      padding: "8px 12px",
      borderRadius: 6,
      cursor: "pointer",
    },
    transcript: {
      color: "#0f0",
      fontStyle: "italic",
      fontSize: "0.9rem",
      marginTop: 5,
      backgroundColor: "#222",
      padding: "6px 10px",
      borderRadius: "6px",
    },
    toggleTranscript: {
      color: "#aaa",
      fontSize: "0.8rem",
      marginTop: 10,
      padding: "6px 10px",
      cursor: "pointer",
      userSelect: "none",
      backgroundColor: showLiveTranscript ? "rgba(0, 255, 0, 0.1)" : "rgba(255, 0, 0, 0.1)",
      borderRadius: "4px",
      textAlign: "center",
    },
    controls: {
      position: "absolute",
      bottom: 15,
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      gap: 15,
      backgroundColor: "#232428",
      padding: "10px 20px",
      borderRadius: "30px",
      zIndex: 99,
    },
    controlButton: {
      backgroundColor: "#40444b",
      color: "white",
      border: "none",
      padding: 10,
      fontSize: 20,
      borderRadius: "50%",
      cursor: "pointer",
      width: 45,
      height: 45,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    leaveButton: {
      backgroundColor: "#d9534f",
      color: "white",
      border: "none",
      padding: "8px 16px",
      borderRadius: "20px",
      fontWeight: "bold",
      cursor: "pointer",
    },
    errorMessage: {
      backgroundColor: "rgba(220, 53, 69, 0.8)",
      color: "white",
      padding: "10px",
      borderRadius: "6px",
      position: "absolute",
      top: "10px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 100,
      maxWidth: "80%",
    },
    networkStatus: {
      position: "absolute",
      top: "10px",
      right: "10px",
      padding: "5px 10px",
      borderRadius: "4px",
      fontSize: "12px",
      backgroundColor: navigator.onLine ? "rgba(40, 167, 69, 0.7)" : "rgba(220, 53, 69, 0.7)",
      color: "white",
    },
    emojiKeyframes: `
      @keyframes floatUp {
        0% { bottom: 50px; opacity: 1; }
        100% { bottom: 300px; opacity: 0; }
      }
    `,
    emojiStyle: (index) => ({
      position: "absolute",
      bottom: `${60 + index * 20}px`,
      fontSize: 36,
      left: "50%",
      transform: "translateX(-50%)",
      animation: "floatUp 2s ease-in-out forwards",
    }),
    statusBadge: {
      display: "inline-block",
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      marginRight: "5px",
      backgroundColor: isRecording ? "#0f0" : "#f00",
    }
  };

  return (
    <>
      <style>{styles.emojiKeyframes}</style>
      <div style={styles.container}>
        {connectionError && (
          <div style={styles.errorMessage}>
            {connectionError}
          </div>
        )}
        
        <div style={styles.networkStatus}>
          {navigator.onLine ? "Online" : "Offline"}
        </div>
        
        <div style={styles.videoSection}>
          <video ref={localCamRef} autoPlay muted style={styles.video} />
          <video ref={localScreenRef} autoPlay muted style={styles.video} />
          <video ref={remoteVideoRef} autoPlay style={styles.video} />
          {reactions.map((r, i) => (
            <div key={r.id} style={styles.emojiStyle(i)}>{r.emoji}</div>
          ))}
        </div>

        <div style={styles.chatSection}>
          <div style={styles.messages}>
            {messages.map((msg, idx) => (
              <div key={idx} style={styles.message}>{msg}</div>
            ))}
          </div>

          <div style={styles.inputArea}>
            <input
              style={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
            />
            <button style={styles.sendButton} onClick={sendMessage}>Send</button>
          </div>

          <div
            style={styles.toggleTranscript}
            onClick={toggleTranscript}
          >
            <span style={styles.statusBadge}></span>
            {showLiveTranscript ? "Live Speech On" : "Live Speech Off"}
          </div>

          {showLiveTranscript && interimResult && (
            <div style={styles.transcript}>🎤 {interimResult}</div>
          )}

          {error && <p style={{ color: "red", fontSize: "0.8rem", margin: "5px 0" }}>{error}</p>}
        </div>

        <div style={styles.controls}>
          <button style={styles.controlButton} onClick={toggleCam}>
            {camEnabled ? "🎥" : "🚫"}
          </button>
          <button style={styles.controlButton} onClick={toggleMic}>
            {micEnabled ? "🎙️" : "🔇"}
          </button>
          <button style={styles.controlButton} onClick={shareScreen}>
            {isSharingScreen ? "❌" : "🖥️"}
          </button>
          {emojis.map((e, i) => (
            <button key={i} style={styles.controlButton} onClick={() => sendReaction(e)}>
              {e}
            </button>
          ))}
          <button
            style={{
              ...styles.controlButton,
              backgroundColor: isRecording ? "#d9534f" : "#40444b"
            }}
            onClick={isRecording ? stopSpeechToText : startSpeechToText}
            title="Toggle Voice-to-Text"
          >
            {isRecording ? "🛑🎤" : "🗣️"}
          </button>
          <button style={styles.leaveButton} onClick={leaveRoom}>Leave</button>
        </div>
      </div>
    </>
  );
};

export default StreamRoom;