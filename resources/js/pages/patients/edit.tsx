import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useMemo } from 'react';
import { ArrowLeft, UserCheck, Trash2 } from 'lucide-react';

interface Patient {
    id: number;
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
}

interface PageProps {
    patient: Patient;
}

export default function PatientEdit() {
    const { patient } = usePage<PageProps>().props;

    const breadcrumbs = useMemo(() => [
        { title: 'Patients', href: '/patients' },
        { title: patient.name, href: `/patients/${patient.id}` },
        { title: 'Edit', href: `/patients/${patient.id}/edit` },
    ], [patient]);

    const { data, setData, put, processing, errors } = useForm({
        name: patient.name || '',
        age: patient.age?.toString() || '',
        gender: patient.gender || 'male' as 'male' | 'female' | 'other',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('patients.update', patient.id));
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
            router.delete(route('patients.destroy', patient.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Patient: ${patient.name}`} />
            
            <div className="p-4">
                <div className="max-w-lg mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <UserCheck className="h-6 w-6" />
                            <h1 className="text-2xl font-semibold">Edit Patient</h1>
                        </div>
                        <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={handleDelete}
                            className="flex items-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Patient
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Patient Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Full Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input 
                                        id="name" 
                                        value={data.name} 
                                        onChange={(e) => setData('name', e.target.value)} 
                                        placeholder="Enter patient's full name"
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="age">
                                        Age <span className="text-red-500">*</span>
                                    </Label>
                                    <Input 
                                        id="age" 
                                        type="number" 
                                        min="0" 
                                        max="130"
                                        value={data.age} 
                                        onChange={(e) => setData('age', e.target.value)} 
                                        placeholder="Enter age"
                                        required
                                    />
                                    {errors.age && <p className="text-sm text-red-600">{errors.age}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gender">
                                        Gender <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={data.gender} onValueChange={(value: 'male' | 'female' | 'other') => setData('gender', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gender && <p className="text-sm text-red-600">{errors.gender}</p>}
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <Button type="submit" disabled={processing} className="flex-1">
                                        {processing ? 'Updating...' : 'Update Patient'}
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => window.history.back()}
                                        className="flex items-center gap-2"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}