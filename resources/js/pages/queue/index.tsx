import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Activity, CheckCircle, Clock, Play, Plus, Timer, Trash2, User, Users, XCircle } from 'lucide-react';
import { useMemo } from 'react';

interface QueueItem {
    id: number;
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
    queue_number: number;
    created_at: string;
    processed_at?: string;
    patient?: {
        id: number;
        name: string;
    };
    consultation?: {
        id: number;
        status: string;
    };
    processed_by?: {
        id: number;
        name: string;
    };
}

interface Stats {
    waiting: number;
    in_progress: number;
    completed: number;
    total: number;
}

interface PageProps {
    queue: QueueItem[];
    stats: Stats;
    success?: string;
    error?: string;
    auth: {
        roles: string[];
    };
    [key: string]: any;
}

export default function QueueIndex() {
    const { queue, stats, success, error, auth } = usePage<PageProps & { auth: { roles: string[] } }>().props;
    const isDoctor = auth?.roles?.includes('doctor');

    const breadcrumbs = useMemo(() => [{ title: 'Registration Queue', href: '/queue' }], []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'waiting':
                return 'bg-yellow-100 text-yellow-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

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

    const handleProcess = (queueId: number) => {
        router.post(route('queue.process', queueId));
    };

    const handleComplete = (queueId: number) => {
        if (confirm('Mark this queue item as completed?')) {
            router.post(route('queue.complete', queueId));
        }
    };

    const handleCancel = (queueId: number) => {
        if (confirm('Cancel this queue item?')) {
            router.post(route('queue.cancel', queueId));
        }
    };

    const handleDelete = (queueId: number) => {
        if (confirm('Delete this queue item? This action cannot be undone.')) {
            router.delete(route('queue.destroy', queueId));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registration Queue" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="h-6 w-6" />
                        <h1 className="text-2xl font-semibold">Registration Queue</h1>
                    </div>
                    {!isDoctor && (
                        <Button asChild>
                            <Link href={route('queue.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add to Queue
                            </Link>
                        </Button>
                    )}
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

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Timer className="h-5 w-5 text-yellow-600" />
                                <div>
                                    <div className="text-2xl font-bold">{stats.waiting}</div>
                                    <div className="text-sm text-muted-foreground">Waiting</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-600" />
                                <div>
                                    <div className="text-2xl font-bold">{stats.in_progress}</div>
                                    <div className="text-sm text-muted-foreground">In Progress</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <div className="text-2xl font-bold">{stats.completed}</div>
                                    <div className="text-sm text-muted-foreground">Completed</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-gray-600" />
                                <div>
                                    <div className="text-2xl font-bold">{stats.total}</div>
                                    <div className="text-sm text-muted-foreground">Total Today</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Queue List */}
                <div className="grid gap-4">
                    {queue && queue.length > 0 ? (
                        <div className="space-y-4">
                            {queue.map((item) => (
                                <Card key={item.id} className="transition-shadow hover:shadow-md">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-800">
                                                    {item.queue_number}
                                                </div>
                                                <div>
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        <span className="font-medium">{item.name}</span>
                                                        <Badge className={getGenderColor(item.gender)} variant="secondary">
                                                            {item.gender}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Age: {item.age} • Registered: {new Date(item.created_at).toLocaleTimeString()}
                                                        {item.processed_at && <> • Processed: {new Date(item.processed_at).toLocaleTimeString()}</>}
                                                    </div>
                                                    {item.processed_by && (
                                                        <div className="text-sm text-muted-foreground">
                                                            Processed by: Dr. {item.processed_by.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge className={getStatusColor(item.status)} variant="secondary">
                                                    {item.status.replace('_', ' ')}
                                                </Badge>

                                                {isDoctor && (
                                                    <>
                                                        {item.status === 'waiting' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleProcess(item.id)}
                                                                className="flex items-center gap-1"
                                                            >
                                                                <Play className="h-3 w-3" />
                                                                Process
                                                            </Button>
                                                        )}

                                                        {item.status === 'in_progress' && item.consultation && (
                                                            <>
                                                                <Button asChild size="sm" variant="outline">
                                                                    <Link href={route('consultations.show', item.consultation.id)}>
                                                                        View Consultation
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleComplete(item.id)}
                                                                    className="flex items-center gap-1"
                                                                >
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    Complete
                                                                </Button>
                                                            </>
                                                        )}

                                                        {(item.status === 'waiting' || item.status === 'in_progress') && (
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleCancel(item.id)}
                                                                className="flex items-center gap-1"
                                                            >
                                                                <XCircle className="h-3 w-3" />
                                                                Cancel
                                                            </Button>
                                                        )}

                                                        {(item.status === 'completed' || item.status === 'cancelled') && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleDelete(item.id)}
                                                                className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                                Delete
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-6 text-center">
                                <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-medium">No patients in queue today</h3>
                                <p className="mb-4 text-muted-foreground">Start by adding patients to the registration queue.</p>
                                {!isDoctor && (
                                    <Button asChild>
                                        <Link href={route('queue.create')}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add to Queue
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
