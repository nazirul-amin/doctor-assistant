import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VoiceRecorder from '@/components/VoiceRecorder';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import MarkdownIt from 'markdown-it';
import { useCallback, useMemo, useState } from 'react';

// Custom markdown styles
const markdownStyles = `
  .markdown-body {
    font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    color: #1f2937;
  }
  .markdown-body h1, 
  .markdown-body h2, 
  .markdown-body h3, 
  .markdown-body h4, 
  .markdown-body h5, 
  .markdown-body h6 {
    margin-top: 1.5em;
    margin-bottom: 0.75em;
    font-weight: 600;
    line-height: 1.25;
  }
  .markdown-body h1 { font-size: 2em; }
  .markdown-body h2 { font-size: 1.5em; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3em; }
  .markdown-body h3 { font-size: 1.25em; }
  .markdown-body p { margin-bottom: 1em; }
  .markdown-body ul, 
  .markdown-body ol { 
    padding-left: 2em; 
    margin-bottom: 1em;
  }
  .markdown-body li {
    margin-bottom: 0.5em;
  }
  .markdown-body li > p { 
    margin-bottom: 0.5em; 
  }
  .markdown-body code {
    font-family: 'Fira Code', 'Menlo', monospace;
    background-color: #f3f4f6;
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-size: 0.9em;
  }
  .markdown-body pre {
    background-color: #1e293b;
    border-radius: 8px;
    padding: 1em;
    margin: 1em 0;
    overflow-x: auto;
  }
  .markdown-body pre code {
    background-color: transparent;
    color: #e2e8f0;
    padding: 0;
  }
  .markdown-body a {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
  }
  .markdown-body a:hover {
    text-decoration: underline;
  }
  .markdown-body blockquote {
    border-left: 4px solid #e5e7eb;
    padding-left: 1em;
    margin: 1em 0;
    color: #4b5563;
  }
  .markdown-body table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
  }
  .markdown-body th,
  .markdown-body td {
    border: 1px solid #e5e7eb;
    padding: 0.5em 1em;
    text-align: left;
  }
  .markdown-body th {
    background-color: #f9fafb;
    font-weight: 600;
  }
  .markdown-body img {
    max-width: 100%;
    border-radius: 4px;
    margin: 1em 0;
  }
`;

// Add styles to document head
const styleElement = document.createElement('style');
styleElement.textContent = markdownStyles;
document.head.appendChild(styleElement);

interface ConsultationPageProps {
    consultation: {
        id: number;
        status: string;
        transcript?: string | null;
        summary?: string | null;
        patient: { id: number; name: string; age: number; gender: string };
    };
    [key: string]: unknown;
}

export default function ConsultationShow() {
    const { props } = usePage<ConsultationPageProps>();
    const [transcript, setTranscript] = useState(props.consultation.transcript || '');
    const [summary, setSummary] = useState(props.consultation.summary || '');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [error, setError] = useState('');

    const breadcrumbs = useMemo(
        () => [
            { title: 'Consultations', href: '/consultations' },
            { title: props.consultation.patient.name, href: `/consultations/${props.consultation.id}` },
        ],
        [props.consultation.id, props.consultation.patient.name],
    );

    const handleTranscriptionComplete = useCallback(
        async (transcription: string) => {
            setTranscript(transcription);
            setError('');

            // Automatically trigger summarization after transcription
            try {
                setIsSummarizing(true);
                const response = await fetch(`/consultations/${props.consultation.id}/summarize`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });

                const data = await response.json();

                if (data.success) {
                    setSummary(data.summary);
                    // Refresh the page to get the latest data
                    router.reload();
                } else {
                    setError(data.message || 'Failed to generate summary');
                }
            } catch (err) {
                setError('Error during summarization');
                console.error('Summarization error:', err);
            } finally {
                setIsSummarizing(false);
            }
        },
        [props.consultation.id, router],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Consultation - ${props.consultation.patient.name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Consultation Details</h1>
                    <div className="flex items-center space-x-4">
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                props.consultation.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : props.consultation.status === 'summarized'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-yellow-100 text-yellow-800'
                            }`}
                        >
                            {props.consultation.status || 'in progress'}
                        </span>
                        {props.consultation.status !== 'completed' && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={async () => {
                                    if (
                                        window.confirm('Are you sure you want to mark this consultation as complete? This action cannot be undone.')
                                    ) {
                                        try {
                                            const response = await fetch(`/consultations/${props.consultation.id}/complete`, {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                                },
                                            });

                                            if (response.ok) {
                                                router.reload();
                                            } else {
                                                const data = await response.json();
                                                setError(data.message || 'Failed to complete consultation');
                                            }
                                        } catch (err) {
                                            setError('An error occurred while completing the consultation');
                                            console.error('Completion error:', err);
                                        }
                                    }
                                }}
                                className="bg-green-600 text-white hover:bg-green-700"
                            >
                                Complete Consultation
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Patient Info */}
                    <div className="space-y-4 lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Patient Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p>
                                    <span className="font-medium">Name:</span> {props.consultation.patient.name}
                                </p>
                                <p>
                                    <span className="font-medium">Age:</span> {props.consultation.patient.age}
                                </p>
                                <p>
                                    <span className="font-medium">Gender:</span> {props.consultation.patient.gender}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Voice Recorder</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <VoiceRecorder
                                    onTranscription={async (text) => {
                                        setTranscript(text);
                                        await handleTranscriptionComplete(text);
                                    }}
                                    onError={(error) => setError(error)}
                                    consultationId={props.consultation.id}
                                    autoTranscribe={true}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-4 lg:col-span-2">
                        {/* Transcript */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Consultation Transcript</CardTitle>
                            </CardHeader>
                            <CardContent className="max-h-[400px] min-h-[200px] overflow-y-auto">
                                {transcript ? (
                                    <div className="rounded bg-gray-50 p-4 whitespace-pre-wrap">{transcript}</div>
                                ) : (
                                    <p className="text-gray-500 italic">No transcript available. Start recording to transcribe.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Summary */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>AI Powered Summary</CardTitle>
                                {!summary && transcript && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            try {
                                                setIsSummarizing(true);
                                                const response = await fetch(`/consultations/${props.consultation.id}/summarize`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'X-CSRF-TOKEN':
                                                            document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                                    },
                                                });
                                                const data = await response.json();
                                                if (data.success) {
                                                    setSummary(data.summary);
                                                    router.reload();
                                                }
                                            } catch (err) {
                                                setError('Failed to generate summary');
                                            } finally {
                                                setIsSummarizing(false);
                                            }
                                        }}
                                        disabled={isSummarizing}
                                    >
                                        {isSummarizing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            'Generate Summary'
                                        )}
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                {isSummarizing ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                        <span>Generating summary...</span>
                                    </div>
                                ) : summary ? (
                                    <div
                                        className="markdown-body"
                                        dangerouslySetInnerHTML={{
                                            __html: (() => {
                                                const md = new MarkdownIt({
                                                    html: true,
                                                    linkify: true,
                                                    typographer: true,
                                                });
                                                return md.render(props.consultation.summary || '');
                                            })(),
                                        }}
                                    />
                                ) : (
                                    <p className="text-gray-500 italic">
                                        {transcript
                                            ? 'Click "Generate Summary" to analyze the transcript'
                                            : 'Transcript is required to generate a summary'}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {error && (
                    <div className="border-l-4 border-red-500 bg-red-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
