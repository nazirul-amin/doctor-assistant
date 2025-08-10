import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Doctor Assistant - AI-Powered Medical Diagnosis">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
                {/* Header Navigation */}
                <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-md">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-green-500">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xl font-semibold">Doctor Assistant</span>
                            </div>
                            <nav className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
                                        >
                                            Log in
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden">
                    <div className="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h1 className="text-5xl leading-tight font-bold text-gray-900 lg:text-6xl">
                                        AI-Powered
                                        <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                                            {' '}
                                            Medical Assistant
                                        </span>
                                    </h1>
                                    <p className="text-xl leading-relaxed text-gray-600">
                                        Empowering doctors with intelligent AI tools to enhance patient diagnosis and improve healthcare outcomes.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <Link
                                        href={route('consultations.index')}
                                        className="transform rounded-xl bg-gradient-to-r from-blue-600 to-green-600 px-8 py-4 text-center text-lg font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                                    >
                                        Get Started
                                    </Link>
                                    <button className="rounded-xl border-2 border-gray-300 px-8 py-4 text-lg font-semibold text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-600">
                                        Learn More
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="rounded-3xl bg-gradient-to-br from-blue-100 to-green-100 p-8 shadow-2xl">
                                    <div className="rounded-2xl bg-white p-6 shadow-lg">
                                        <div className="mb-4 flex items-center space-x-3">
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
                                                    <p className="text-sm">AI Analysis suggests:</p>
                                                    <ul className="mt-2 space-y-1 text-sm">
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

                {/* Features Section */}
                <section className="bg-white py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-4xl font-bold text-gray-900">Key Features</h2>
                            <p className="mx-auto max-w-3xl text-xl text-gray-600">
                                Our AI-powered platform is designed to enhance medical practice and improve patient care.
                            </p>
                        </div>

                        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
                            <div className="rounded-2xl bg-gray-50 p-8 transition-shadow hover:shadow-lg">
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 shadow-sm">
                                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-gray-900">AI-Powered Diagnosis Assistance</h3>
                                <p className="leading-relaxed text-gray-600">
                                    Our AI will assist doctors in diagnosing patient symptoms by analyzing medical data, providing insights, and
                                    suggesting potential diagnoses to enhance clinical decision-making.
                                </p>
                            </div>

                            <div className="rounded-2xl bg-gray-50 p-8 transition-shadow hover:shadow-lg">
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 shadow-sm">
                                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-gray-900">More Features Coming Soon</h3>
                                <p className="leading-relaxed text-gray-600">
                                    We're continuously developing new features to improve the Doctor Assistant platform. Stay tuned for exciting
                                    updates and enhanced capabilities.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-blue-600 to-green-600 py-20">
                    <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                        <h2 className="mb-6 text-4xl font-bold text-white">Ready to Enhance Your Medical Practice?</h2>
                        <p className="mb-8 text-xl text-blue-100">Join the future of healthcare with AI-powered diagnostic assistance.</p>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 py-12 text-white">
                    <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                        <div className="mb-4 flex items-center justify-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-green-500">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <span className="text-xl font-semibold">Doctor Assistant</span>
                        </div>
                        <p className="mx-auto mb-4 max-w-md text-gray-400">
                            AI-powered medical assistant helping doctors provide better patient care through intelligent diagnosis support.
                        </p>
                        <div className="mt-8 border-t border-gray-800 pt-8 text-gray-400">
                            <p>&copy; 2024 Doctor Assistant. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
