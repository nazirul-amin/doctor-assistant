import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import { ArrowLeft, UserPlus, Clock } from 'lucide-react';

export default function QueueCreate() {
    const breadcrumbs = useMemo(() => [
        { title: 'Registration Queue', href: '/queue' },
        { title: 'Add to Queue', href: '/queue/create' },
    ], []);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        age: '',
        gender: 'male' as 'male' | 'female' | 'other',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('queue.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add to Registration Queue" />
            
            <div className="p-4">
                <div className="max-w-lg mx-auto">
                    <div className="flex items-center gap-2 mb-6">
                        <UserPlus className="h-6 w-6" />
                        <h1 className="text-2xl font-semibold">Add Patient to Queue</h1>
                    </div>
                    
                    <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <p className="text-sm font-medium text-blue-800">Queue System</p>
                        </div>
                        <p className="text-sm text-blue-700">
                            Patients will be added to today's registration queue and can be processed in order. 
                            Each patient will receive a queue number and can be called when ready for consultation.
                        </p>
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
                                        {processing ? 'Adding to Queue...' : 'Add to Queue'}
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
