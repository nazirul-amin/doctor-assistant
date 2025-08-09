import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

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
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Inertia Form Upload</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Audio File
          </label>
          <input
            type="file"
            accept="audio/mp3,audio/mpeg,audio/wav,audio/flac,audio/mp4,audio/m4a,audio/ogg,audio/webm"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {errors.audio && (
            <p className="mt-1 text-sm text-red-600">{errors.audio}</p>
          )}
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model
          </label>
          <select
            value={data.model}
            onChange={(e) => setData('model', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="whisper-large-v3-turbo">Whisper Large V3 Turbo</option>
            <option value="whisper-large-v3">Whisper Large V3</option>
          </select>
        </div>

        {/* Optional Parameters */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language (optional)
            </label>
            <input
              type="text"
              value={data.language}
              onChange={(e) => setData('language', e.target.value)}
              placeholder="e.g., en, es, fr"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature
            </label>
            <input
              type="number"
              value={data.temperature}
              onChange={(e) => setData('temperature', parseFloat(e.target.value))}
              min="0"
              max="1"
              step="0.1"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prompt (optional)
          </label>
          <textarea
            value={data.prompt}
            onChange={(e) => setData('prompt', e.target.value)}
            placeholder="Optional context to improve transcription"
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={processing || !data.audio}
          className="w-full flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {processing ? 'Processing...' : 'Upload & Transcribe'}
        </Button>
      </form>

      {data.audio && (
        <div className="mt-4 p-3 bg-blue-50 rounded border">
          <p className="text-sm text-blue-700">
            Selected: {data.audio.name} ({(data.audio.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        </div>
      )}
    </div>
  );
}
