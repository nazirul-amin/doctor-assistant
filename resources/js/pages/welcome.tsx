import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Activity, FileText, Mic } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    const navLinkClass =
        "relative px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-gradient-to-r from-blue-600 to-indigo-600 after:transition-all after:duration-300 hover:after:w-full";

    const steps = [
        {
            icon: <Mic className="h-7 w-7 text-blue-600" strokeWidth={2.2} />,
            bg: 'bg-blue-100',
            title: '1. Record Consultation',
            desc: 'AI listens during the consultation, capturing every detail without interrupting the conversation.',
        },
        {
            icon: <Activity className="h-7 w-7 text-green-600" strokeWidth={2.2} />,
            bg: 'bg-green-100',
            title: '2. Real-Time Analysis',
            desc: 'AI extracts key details — patient history, symptoms, and concerns — while spotting patterns and important clues.',
        },
        {
            icon: <FileText className="h-7 w-7 text-purple-600" strokeWidth={2.2} />,
            bg: 'bg-purple-100',
            title: '3. Structured Summary',
            desc: 'Receive a concise, structured summary that highlights relevant findings, enabling faster, more accurate diagnoses.',
        },
    ];

    return (
        <>
            <Head title="Welcome" />

            <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-blue-50">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-md">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            {/* Logo */}
                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                        />
                                    </svg>
                                </div>
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent">
                                    DocuScribe AI
                                </span>
                            </div>

                            {/* Navigation */}
                            <nav className="flex items-center space-x-6">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform duration-200 hover:scale-[1.03]"
                                    >
                                        Go to Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={route('login')} className={navLinkClass}>
                                            Log in
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <section className="relative flex-1">
                    <div className="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div className="animate-fadeIn space-y-6">
                                <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 shadow-sm">
                                    <span className="mr-2 h-2 w-2 rounded-full bg-blue-600"></span>
                                    AI-Powered Medical Documentation
                                </div>
                                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                                    Focus on Your Patients,{' '}
                                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Not Paperwork</span>
                                </h1>
                                <p className="max-w-xl text-lg text-gray-600">
                                    Save time, reduce admin work, and improve patient care with AI-driven documentation during consultations.
                                </p>
                            </div>

                            {/* Illustration */}
                            <div className="animate-slideUp relative">
                                <div className="rounded-3xl bg-gradient-to-br from-blue-100 to-green-100 p-6 shadow-lg transition-shadow hover:shadow-2xl">
                                    <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                    <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="max-w-xs rounded-2xl bg-gray-100 px-4 py-2">
                                                    <p className="text-sm text-gray-700">Patient shows symptoms of fever, headache, and fatigue</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start justify-end space-x-3">
                                                <div className="max-w-xs rounded-2xl bg-blue-600 px-4 py-2 text-white">
                                                    <p className="text-sm font-medium">AI Analysis suggests:</p>
                                                    <ul className="mt-1 space-y-1 text-sm">
                                                        <li>• Possible viral infection</li>
                                                        <li>• Consider blood tests</li>
                                                        <li>• Monitor temperature</li>
                                                    </ul>
                                                </div>
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                                    <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="bg-white py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">How It Works</h2>
                            <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
                                Doctors often face time constraints during patient consultations. Our AI streamlines the process by transcribing,
                                analyzing, and summarizing conversations in real time, helping you focus on the patient instead of paperwork.
                            </p>
                        </div>

                        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                            {steps.map((step, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col items-center space-y-4 rounded-xl border border-gray-100 p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
                                    style={{
                                        animation: `fadeUp 0.6s ease ${i * 0.15}s forwards`,
                                        opacity: 0,
                                    }}
                                >
                                    <div
                                        className={`flex h-14 w-14 items-center justify-center rounded-full ${step.bg} transition-transform duration-300 hover:scale-110 hover:rotate-6`}
                                    >
                                        {step.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold">{step.title}</h3>
                                    <p className="text-sm text-gray-600">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Animations */}
                <style>{`
                    @keyframes fadeUp {
                        0% { transform: translateY(20px); opacity: 0; }
                        100% { transform: translateY(0); opacity: 1; }
                    }
                `}</style>
            </div>
        </>
    );
}
