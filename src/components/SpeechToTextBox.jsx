// components/SpeechToTextBox.jsx
import React from 'react';
import useSpeechToText from 'react-hook-speech-to-text';

const SpeechToTextBox = () => {
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  if (error) return <p>Web Speech API is not available in this browser.</p>;

  return (
    <div style={{ padding: '1rem', backgroundColor: '#2b2d31', borderRadius: '8px', color: 'white' }}>
      <p>Microphone: {isRecording ? 'On' : 'Off'}</p>
      <button onClick={isRecording ? stopSpeechToText : startSpeechToText}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <ul>
        {results.map((result) => (
          <li key={result.timestamp}>{result.transcript}</li>
        ))}
        {interimResult && <li>{interimResult}</li>}
      </ul>
    </div>
  );
};

export default SpeechToTextBox;
