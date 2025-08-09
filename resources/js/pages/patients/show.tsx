import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, Plus, Stethoscope, User } from 'lucide-react';
import { useMemo } from 'react';

interface Patient {
    id: number;
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    created_at: string;
    updated_at: string;
    consultations: Array<{
        id: number;
        status: string;
        created_at: string;
        doctor: {
            id: number;
            name: string;
        };
    }>;
}

interface PageProps {
    patient: Patient;
    success?: string;
    error?: string;
}

export default function PatientShow() {
    const { patient, success, error } = usePage<PageProps>().props;

    const breadcrumbs = useMemo(
        () => [
            { title: 'Patients', href: '/patients' },
            { title: patient.name, href: `/patients/${patient.id}` },
        ],
        [patient],
    );

    const getGenderColor = (gender: string) => {
        switch (gender) {
            case 'male':
                return 'bg-blue-100 text-blue-800';
            case 'female':
                return 'bg-pink-100 text-pink-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Patient: ${patient.name}`} />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <User className="h-6 w-6" />
                        <h1 className="text-2xl font-semibold">{patient.name}</h1>
                        <Badge className={getGenderColor(patient.gender)} variant="secondary">
                            {patient.gender}
                        </Badge>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={route('patients.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Patients
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                router.post(route('consultations.createForPatient', patient.id));
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Start Consultation
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href={route('patients.edit', patient.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                {success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="text-sm text-green-800">{success}</div>
                    </div>
                )}

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-800">{error}</div>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Patient Information */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Patient Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Age</label>
                                        <p className="text-base">{patient.age} years old</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Gender</label>
                                        <p className="text-base capitalize">{patient.gender}</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                                        <div>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Registered: {new Date(patient.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Last updated: {new Date(patient.updated_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Consultations */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Stethoscope className="h-5 w-5" />
                                    Consultations ({patient.consultations.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {patient.consultations.length > 0 ? (
                                    <div className="space-y-3">
                                        {patient.consultations.map((consultation) => (
                                            <Link
                                                key={consultation.id}
                                                href={route('consultations.show', consultation.id)}
                                                className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                            >
                                                <div className="mb-2 flex items-center justify-between">
                                                    <Badge className={getStatusColor(consultation.status)} variant="secondary">
                                                        {consultation.status}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(consultation.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">Dr. {consultation.doctor.name}</p>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-6 text-center">
                                        <Stethoscope className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">No consultations yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
