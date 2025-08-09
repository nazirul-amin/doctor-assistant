import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';

interface PageProps {
    success?: string;
    error?: string;
    transcription?: string;
    model_used?: string;
    transcription_data?: any;
    consultations?: Array<{
        id: number;
        status: string;
        model_used?: string | null;
        created_at: string;
        patient: { id: number; name: string };
    }>;
}

export default function ConsultationsIndex() {
    const { props } = usePage<PageProps>();
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

    const breadcrumbs = useMemo(() => [{ title: 'Consultations', href: '/consultations' }], []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Consultations" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Consultations</h1>
                </div>

                <div className="grid gap-4">
                    {props.consultations && props.consultations.length > 0 ? (
                        <div className="divide-y rounded-lg border">
                            {props.consultations.map((c) => (
                                <Link key={c.id} href={route('consultations.show', c.id)} className="block p-4 hover:bg-muted/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">{c.patient.name}</div>
                                            <div className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</div>
                                        </div>
                                        <div className="text-sm capitalize">{c.status}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border p-6 text-center text-muted-foreground">No consultations yet.</div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
