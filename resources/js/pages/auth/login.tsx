import { Head, useForm } from '@inertiajs/react';
import { ChevronDown, ChevronUp, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

const testUsers = [
    {
        role: 'Clinic Assistant',
        email: 'assistant@clinic.com',
        password: 'password',
        permissions: ['View queue', 'Add to queue'],
        description: 'Basic access to manage patient queue',
        buttonText: 'Login as Clinic Assistant'
    },
    {
        role: 'Doctor',
        email: 'doctor@clinic.com',
        password: 'password',
        permissions: ['View queue', 'Process queue', 'Cancel queue', 'View consultations'],
        description: 'Full access to consultations and patient management',
        buttonText: 'Login as Doctor'
    }
];

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showTestUsers, setShowTestUsers] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Welcome Back" description="Enter your credentials to access your account">
            <Head title="Sign In" />

            <div className="w-full max-w-md space-y-6">
                <form className="space-y-6" onSubmit={submit}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="you@example.com"
                            />
                            <InputError message={errors.email} className="mt-1 text-sm text-red-600" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                                {canResetPassword && (
                                    <TextLink 
                                        href={route('password.request')} 
                                        className="text-xs font-medium text-blue-600 hover:text-blue-500"
                                        tabIndex={5}
                                    >
                                        Forgot password?
                                    </TextLink>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="••••••••"
                            />
                            <InputError message={errors.password} className="mt-1 text-sm text-red-600" />
                        </div>

                        <div className="flex items-center">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onClick={() => setData('remember', !data.remember)}
                                tabIndex={3}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                                Remember me
                            </Label>
                        </div>
                    </div>

                    <div>
                        <Button 
                            type="submit" 
                            className="flex w-full justify-center rounded-md border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            tabIndex={4} 
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : 'Sign in'}
                        </Button>
                    </div>
                </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
            
                <div className="mt-8 border-t border-gray-200 pt-6">
                    <Collapsible open={showTestUsers} onOpenChange={setShowTestUsers}>
                        <CollapsibleTrigger className="group flex w-full items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            <span>Need test credentials?</span>
                            {showTestUsers ? (
                                <ChevronUp className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                            )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-4 space-y-4">
                            <p className="text-center text-sm text-gray-600">
                                Use these test accounts to explore the application.
                            </p>
                            
                            <div className="space-y-4">
                                {testUsers.map((user, index) => (
                                    <div key={index} className="overflow-hidden rounded-lg bg-white shadow">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                                            <h3 className="text-lg font-medium text-gray-900">{user.role}</h3>
                                            <p className="mt-1 text-sm text-gray-600">{user.description}</p>
                                        </div>
                                        <div className="p-4">
                                            <div className="space-y-3 text-sm">
                                                <div className="flex items-start">
                                                    <span className="w-20 font-medium text-gray-700">Email:</span>
                                                    <span className="flex-1 font-mono text-sm text-gray-800">{user.email}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="w-20 font-medium text-gray-700">Password:</span>
                                                    <span className="flex-1 font-mono text-sm text-gray-800">{user.password}</span>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-medium text-gray-600">Permissions:</div>
                                                    <div className="mt-1 flex flex-wrap gap-1.5">
                                                        {user.permissions.map((permission, i) => (
                                                            <span 
                                                                key={i} 
                                                                className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-100"
                                                            >
                                                                {permission}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setData({
                                                        email: user.email,
                                                        password: user.password,
                                                        remember: false
                                                    });
                                                    const form = document.querySelector('form');
                                                    if (form) {
                                                        const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
                                                        if (submitButton) {
                                                            submitButton.click();
                                                        }
                                                    }
                                                }}
                                                className="mt-4 flex w-full justify-center rounded-md border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                            >
                                                {user.buttonText}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </div>
        </AuthLayout>
    );
}
