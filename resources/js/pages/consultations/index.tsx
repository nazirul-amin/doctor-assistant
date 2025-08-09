import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import VoiceRecorder from '@/components/VoiceRecorder';

interface VoiceDemoProps {
  success?: string;
  error?: string;
  transcription?: string;
  model_used?: string;
  transcription_data?: any;
}

export default function VoiceDemo() {
  const { props } = usePage<VoiceDemoProps>();
  const [transcription, setTranscription] = useState<string>(props.transcription || '');
  const [error, setError] = useState<string>(props.error || '');

  const handleTranscription = (text: string) => {
    setTranscription(text);
    setError('');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTranscription('');
  };

  // Handle Inertia flash messages
  React.useEffect(() => {
    if (props.success) {
      setError('');
    }
    if (props.error) {
      setTranscription('');
    }
    if (props.transcription_data?.transcription) {
      setTranscription(props.transcription_data.transcription);
      setError('');
    }
  }, [props.success, props.error, props.transcription_data]);

  return (
    <>
      <Head title="Voice Recognition Demo" />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Voice Recognition Demo</h1>
        
        <div className="grid gap-6 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            <VoiceRecorder 
              onTranscription={handleTranscription}
              onError={handleError}
            />
          </div>

          {/* Transcription Result */}
          {transcription && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Transcription Result:
              </h3>
              <p className="text-green-700">{transcription}</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Error:
              </h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* API Information */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              API Information:
            </h3>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• Auto-converts to MP3 format using LameJS</li>
              <li>• Endpoint: <code>/api/voice/transcribe</code></li>
              <li>• Supported input: MP3, WAV, FLAC, MP4, M4A, OGG, WEBM</li>
              <li>• Maximum file size: 25MB</li>
              <li>• Model: Whisper Large V3 Turbo (Groq)</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
