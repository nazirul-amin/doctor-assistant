import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import React from 'react';

interface VoiceInertiaFormProps {
    onSuccess?: (transcription: string) => void;
    onError?: (error: string) => void;
}

export default function VoiceInertiaForm({ onSuccess, onError }: VoiceInertiaFormProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        audio: null as File | null,
        model: 'whisper-large-v3-turbo',
        response_format: 'json',
        language: '',
        prompt: '',
        temperature: 0.7,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.audio) {
            onError?.('Please select an audio file');
            return;
        }

        post(route('consultations.store'), {
            onSuccess: (page) => {
                reset('audio');
                onSuccess?.('Transcription completed via Inertia form');
            },
            onError: (errors) => {
                onError?.(Object.values(errors).join(', '));
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('audio', file);
        }
    };

    return (
        <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="mb-4 text-lg font-semibold">Inertia Form Upload</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* File Upload */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Audio File</label>
                    <input
                        type="file"
                        accept="audio/mp3,audio/mpeg,audio/wav,audio/flac,audio/mp4,audio/m4a,audio/ogg,audio/webm"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {errors.audio && <p className="mt-1 text-sm text-red-600">{errors.audio}</p>}
                </div>

                {/* Model Selection */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Model</label>
                    <select
                        value={data.model}
                        onChange={(e) => setData('model', e.target.value)}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="whisper-large-v3-turbo">Whisper Large V3 Turbo</option>
                        <option value="whisper-large-v3">Whisper Large V3</option>
                    </select>
                </div>

                {/* Optional Parameters */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Language (optional)</label>
                        <input
                            type="text"
                            value={data.language}
                            onChange={(e) => setData('language', e.target.value)}
                            placeholder="e.g., en, es, fr"
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Temperature</label>
                        <input
                            type="number"
                            value={data.temperature}
                            onChange={(e) => setData('temperature', parseFloat(e.target.value))}
                            min="0"
                            max="1"
                            step="0.1"
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Prompt (optional)</label>
                    <textarea
                        value={data.prompt}
                        onChange={(e) => setData('prompt', e.target.value)}
                        placeholder="Optional context to improve transcription"
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                    />
                </div>

                {/* Submit Button */}
                <Button type="submit" disabled={processing || !data.audio} className="flex w-full items-center justify-center gap-2">
                    <Upload className="h-4 w-4" />
                    {processing ? 'Processing...' : 'Upload & Transcribe'}
                </Button>
            </form>

            {data.audio && (
                <div className="mt-4 rounded border bg-blue-50 p-3">
                    <p className="text-sm text-blue-700">
                        Selected: {data.audio.name} ({(data.audio.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                </div>
            )}
        </div>
    );
}
