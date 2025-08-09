import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Calendar, Plus, Stethoscope, User, Users } from 'lucide-react';
import { useMemo } from 'react';

interface Patient {
    id: number;
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    consultations_count: number;
    created_at: string;
    updated_at: string;
}

interface PageProps {
    patients: Patient[];
    success?: string;
    error?: string;
}

export default function PatientsIndex() {
    const { patients, success, error } = usePage<PageProps>().props;

    const breadcrumbs = useMemo(() => [{ title: 'Patients', href: '/patients' }], []);

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patients" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-6 w-6" />
                        <h1 className="text-2xl font-semibold">Patients</h1>
                    </div>
                    <Button asChild>
                        <Link href={route('patients.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Patient & Consultation
                        </Link>
                    </Button>
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

                <div className="grid gap-4">
                    {patients && patients.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {patients.map((patient) => (
                                <Card key={patient.id} className="transition-shadow hover:shadow-md">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <User className="h-5 w-5 text-muted-foreground" />
                                                <CardTitle className="text-lg">{patient.name}</CardTitle>
                                            </div>
                                            <Badge className={getGenderColor(patient.gender)} variant="secondary">
                                                {patient.gender}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Age:</span>
                                            <span className="font-medium">{patient.age} years</span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-1 text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                Consultations:
                                            </span>
                                            <Badge variant="outline">{patient.consultations_count}</Badge>
                                        </div>

                                        <div className="space-y-2 pt-2">
                                            <Button
                                                className="w-full"
                                                size="sm"
                                                onClick={() => {
                                                    router.post(route('consultations.createForPatient', patient.id));
                                                }}
                                            >
                                                <Stethoscope className="mr-2 h-3 w-3" />
                                                Start Consultation
                                            </Button>
                                            <Button asChild variant="outline" className="w-full" size="sm">
                                                <Link href={route('patients.show', patient.id)}>View Details</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-6 text-center">
                                <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-medium">No patients registered</h3>
                                <p className="mb-4 text-muted-foreground">Get started by registering your first patient.</p>
                                <Button asChild>
                                    <Link href={route('patients.create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Patient & Consultation
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
