import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VoiceRecorder from '@/components/VoiceRecorder';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

interface ConsultationPageProps {
    consultation: {
        id: number;
        status: string;
        transcript?: string | null;
        patient: { id: number; name: string; age: number; gender: string };
    };
    [key: string]: unknown;
}

export default function ConsultationShow() {
    const { props } = usePage<ConsultationPageProps>();
    const [transcript, setTranscript] = useState(props.consultation.transcript || '');
    const [error, setError] = useState('');

    const breadcrumbs = useMemo(
        () => [
            { title: 'Consultations', href: '/consultations' },
            { title: props.consultation.patient.name, href: `/consultations/${props.consultation.id}` },
        ],
        [props.consultation.id, props.consultation.patient.name],
    );

    const handleTranscription = async (text: string) => {
        setTranscript(text);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Consultation - ${props.consultation.patient.name}`} />

            <div className="grid gap-6 p-4 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Patient</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="font-medium">{props.consultation.patient.name}</div>
                        <div className="text-muted-foreground">Age: {props.consultation.patient.age}</div>
                        <div className="text-muted-foreground capitalize">Gender: {props.consultation.patient.gender}</div>
                    </CardContent>
                </Card>

                <div className="space-y-4 md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Record Consultation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <VoiceRecorder
                                consultationId={props.consultation.id}
                                onTranscription={(text) => setTranscript(text)}
                                onError={(err) => setError(err)}
                            />
                            {error && <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>}
                        </CardContent>
                    </Card>

                    {transcript && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Transcribed Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose max-w-none whitespace-pre-wrap">{transcript}</div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
