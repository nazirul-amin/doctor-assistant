import VoiceRecorder from '@/components/VoiceRecorder';
import { Head, usePage } from '@inertiajs/react';
import React, { useState } from 'react';

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
                <h1 className="mb-8 text-3xl font-bold">Voice Recognition Demo</h1>

                <div className="grid max-w-4xl gap-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <VoiceRecorder onTranscription={handleTranscription} onError={handleError} />
                    </div>

                    {/* Transcription Result */}
                    {transcription && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                            <h3 className="mb-2 text-lg font-semibold text-green-800">Transcription Result:</h3>
                            <p className="text-green-700">{transcription}</p>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <h3 className="mb-2 text-lg font-semibold text-red-800">Error:</h3>
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {/* API Information */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <h3 className="mb-2 text-lg font-semibold text-blue-800">API Information:</h3>
                        <ul className="space-y-1 text-sm text-blue-700">
                            <li>• Auto-converts to MP3 format using LameJS</li>
                            <li>
                                • Endpoint: <code>/api/voice/transcribe</code>
                            </li>
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
