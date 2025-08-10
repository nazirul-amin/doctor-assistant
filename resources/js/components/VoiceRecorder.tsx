import { Button } from '@/components/ui/button';
import { Mic, MicOff, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';

// Import lamejs for MP3 conversion
declare global {
    interface Window {
        lamejs: any;
    }
}

// Load lamejs dynamically
const loadLameJS = async () => {
    if (typeof window !== 'undefined' && !window.lamejs) {
        const lamejs = await import('lamejs');
        window.lamejs = lamejs;
    }
    return window.lamejs;
};

interface VoiceRecorderProps {
    consultationId?: number;
    onTranscription?: (text: string) => void;
    onError?: (error: string) => void;
    autoTranscribe?: boolean;
}

export default function VoiceRecorder({ consultationId, onTranscription, onError, autoTranscribe = true }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

                try {
                    // Convert to MP3 format
                    const mp3File = await convertToMp3(blob);
                    setAudioFile(mp3File);

                    // Auto-transcribe if enabled
                    if (autoTranscribe) {
                        await transcribeAudio(mp3File);
                    }
                } catch (error) {
                    console.error('Audio conversion failed:', error);
                    // Fallback: use original blob with MP3 extension
                    const fallbackFile = new File([blob], 'recording.mp3', {
                        type: 'audio/mp3',
                        lastModified: Date.now(),
                    });
                    setAudioFile(fallbackFile);

                    // Auto-transcribe the fallback file if enabled
                    if (autoTranscribe) {
                        await transcribeAudio(fallbackFile);
                    }
                }

                // Stop all tracks to release microphone
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            onError?.('Failed to access microphone: ' + (error as Error).message);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Convert audio blob to MP3 format using lamejs
    const convertToMp3 = async (audioBlob: Blob): Promise<File> => {
        try {
            // Load lamejs library
            const lamejs = await loadLameJS();

            // Convert blob to ArrayBuffer
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioContext = new AudioContext();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            // Get audio data
            const samples = audioBuffer.getChannelData(0);
            const sampleRate = audioBuffer.sampleRate;

            // Convert Float32Array to Int16Array
            const int16Array = new Int16Array(samples.length);
            for (let i = 0; i < samples.length; i++) {
                int16Array[i] = Math.max(-32768, Math.min(32767, samples[i] * 32768));
            }

            // Initialize MP3 encoder
            const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, 128); // mono, sampleRate, bitrate

            // Encode to MP3
            const mp3Data = [];
            const blockSize = 1152; // MP3 frame size

            for (let i = 0; i < int16Array.length; i += blockSize) {
                const sampleBlock = int16Array.subarray(i, i + blockSize);
                const mp3buf = mp3encoder.encodeBuffer(sampleBlock);
                if (mp3buf.length > 0) {
                    mp3Data.push(mp3buf);
                }
            }

            // Flush encoder
            const mp3buf = mp3encoder.flush();
            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf);
            }

            // Create MP3 blob
            const mp3Blob = new Blob(mp3Data, { type: 'audio/mp3' });
            const mp3File = new File([mp3Blob], 'recording.mp3', {
                type: 'audio/mp3',
                lastModified: Date.now(),
            });

            return mp3File;
        } catch (error) {
            console.error('MP3 conversion failed:', error);
            // Fallback: just rename the file to .mp3 (Groq accepts various formats anyway)
            const fallbackFile = new File([audioBlob], 'recording.mp3', {
                type: 'audio/mp3',
                lastModified: Date.now(),
            });
            return fallbackFile;
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // If the uploaded file is not MP3, convert it
            if (file.type !== 'audio/mp3' && file.type !== 'audio/mpeg') {
                try {
                    const mp3File = await convertToMp3(file);
                    setAudioFile(mp3File);
                } catch (error) {
                    onError?.('Failed to convert audio to MP3 format');
                    return;
                }
            } else {
                setAudioFile(file);
            }
        }
    };

    const transcribeAudio = async (file: File): Promise<boolean> => {
        setIsProcessing(true);

        try {
            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                onError?.('CSRF token not found');
                return false;
            }

            // Step 1: Upload the MP3 file first
            const uploadFormData = new FormData();
            uploadFormData.append('audio', file);

            const uploadResponse = await fetch('/api/voice/upload', {
                method: 'POST',
                body: uploadFormData,
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            if (!uploadResponse.ok) {
                throw new Error(`Upload failed with status: ${uploadResponse.status}`);
            }

            const uploadResult = await uploadResponse.json();

            if (!uploadResult.success) {
                onError?.(uploadResult.message || 'File upload failed');
                return false;
            }

            // Step 2: Send the file path for transcription
            const transcribeFormData = new FormData();
            transcribeFormData.append('file_path', uploadResult.data.path);
            transcribeFormData.append('model', 'whisper-large-v3-turbo');
            transcribeFormData.append('response_format', 'json');
            if (consultationId) {
                transcribeFormData.append('consultation_id', String(consultationId));
            }

            const transcribeResponse = await fetch('/api/voice/transcribe', {
                method: 'POST',
                body: transcribeFormData,
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            if (!transcribeResponse.ok) {
                throw new Error(`Transcription failed with status: ${transcribeResponse.status}`);
            }

            const transcribeResult = await transcribeResponse.json();

            if (transcribeResult.success) {
                onTranscription?.(transcribeResult.data.transcription);
                return true;
            } else {
                const errorMsg = transcribeResult.message || 'Transcription failed';
                onError?.(errorMsg);
                return false;
            }
        } catch (error) {
            const errorMsg = 'Error during transcription: ' + (error as Error).message;
            onError?.(errorMsg);
            console.error('Transcription error:', error);
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    const handleTranscribe = () => {
        if (audioFile) {
            transcribeAudio(audioFile);
        }
    };

    const clearAudio = () => {
        setAudioFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col gap-4 rounded-lg border p-4">
            <h3 className="text-lg font-semibold">Voice Recorder</h3>

            {/* Recording Controls */}
            <div className="flex gap-2">
                {!isRecording ? (
                    <Button onClick={startRecording} variant="outline" className="flex items-center gap-2">
                        <Mic className="h-4 w-4" />
                        Start Recording
                    </Button>
                ) : (
                    <Button onClick={stopRecording} variant="destructive" className="flex items-center gap-2">
                        <MicOff className="h-4 w-4" />
                        Stop Recording
                    </Button>
                )}
            </div>

            {/* File Upload */}
            <div className="flex gap-2">
                <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Audio File
                </Button>
            </div>

            {/* Audio File Info */}
            {audioFile && (
                <div className="rounded border bg-gray-50 p-3">
                    <p className="text-sm text-gray-600">
                        Selected file: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                    <div className="mt-2 flex gap-2">
                        <Button onClick={handleTranscribe} disabled={isProcessing} className="flex items-center gap-2">
                            {isProcessing ? 'Processing...' : 'Transcribe Audio'}
                        </Button>
                        <Button onClick={clearAudio} variant="outline" disabled={isProcessing}>
                            Clear
                        </Button>
                    </div>
                </div>
            )}

            {/* Recording Indicator */}
            {isRecording && (
                <div className="flex items-center gap-2 text-red-600">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-red-600"></div>
                    Recording in progress...
                </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
                <div className="flex items-center gap-2 text-blue-600">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-blue-600"></div>
                    Processing audio...
                </div>
            )}
        </div>
    );
}
