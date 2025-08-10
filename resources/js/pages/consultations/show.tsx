import VoiceRecorder from '@/components/VoiceRecorder';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { useMemo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import MarkdownIt from 'markdown-it';

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

    const handleTranscriptionComplete = useCallback(async (transcription: string) => {
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
    }, [props.consultation.id, router]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Consultation - ${props.consultation.patient.name}`} />

            <div className="space-y-6 p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Consultation Details</h1>
                    <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            props.consultation.status === 'completed' ? 'bg-green-100 text-green-800' :
                            props.consultation.status === 'summarized' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                            {props.consultation.status || 'in progress'}
                        </span>
                        {props.consultation.status !== 'completed' && (
                            <Button 
                                variant="default"
                                size="sm"
                                onClick={async () => {
                                    if (window.confirm('Are you sure you want to mark this consultation as complete? This action cannot be undone.')) {
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
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                Complete Consultation
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Patient Info */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Patient Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p><span className="font-medium">Name:</span> {props.consultation.patient.name}</p>
                                <p><span className="font-medium">Age:</span> {props.consultation.patient.age}</p>
                                <p><span className="font-medium">Gender:</span> {props.consultation.patient.gender}</p>
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
                    <div className="lg:col-span-2 space-y-4">
                        {/* Transcript */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Consultation Transcript</CardTitle>
                            </CardHeader>
                            <CardContent className="min-h-[200px] max-h-[400px] overflow-y-auto">
                                {transcript ? (
                                    <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded">{transcript}</div>
                                ) : (
                                    <p className="text-gray-500 italic">No transcript available. Start recording to transcribe.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Summary */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>AI-Powered Summary</CardTitle>
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
                                                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
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
                                    <div className="prose max-w-none" dangerouslySetInnerHTML={{
                                        __html: (() => {
                                            const md = new MarkdownIt();
                                            return md.render(props.consultation.summary || '');
                                        })()
                                    }} />
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
                    <div className="bg-red-50 border-l-4 border-red-500 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
