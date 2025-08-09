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
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="text-xl font-semibold">Doctor Assistant</span>
                            </div>
                            <nav className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                        AI-Powered
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600"> Medical Assistant</span>
                                    </h1>
                                    <p className="text-xl text-gray-600 leading-relaxed">
                                        Empowering doctors with intelligent AI tools to enhance patient diagnosis and improve healthcare outcomes.
                                    </p>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link
                                        href={route('consultations.index')}
                                        className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-center"
                                    >
                                        Get Started
                                    </Link>
                                    <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition-colors">
                                        Learn More
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-3xl p-8 shadow-2xl">
                                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="bg-gray-100 rounded-2xl px-4 py-2 max-w-xs">
                                                    <p className="text-sm text-gray-700">Patient shows symptoms of fever, headache, and fatigue</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3 justify-end">
                                                <div className="bg-blue-600 text-white rounded-2xl px-4 py-2 max-w-xs">
                                                    <p className="text-sm">AI Analysis suggests:</p>
                                                    <ul className="text-sm mt-2 space-y-1">
                                                        <li>• Possible viral infection</li>
                                                        <li>• Consider blood tests</li>
                                                        <li>• Monitor temperature</li>
                                                    </ul>
                                                </div>
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
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
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Key Features
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Our AI-powered platform is designed to enhance medical practice and improve patient care.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shadow-sm mb-6">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    AI-Powered Diagnosis Assistance
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Our AI will assist doctors in diagnosing patient symptoms by analyzing medical data, 
                                    providing insights, and suggesting potential diagnoses to enhance clinical decision-making.
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center shadow-sm mb-6">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    More Features Coming Soon
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    We're continuously developing new features to improve the Doctor Assistant platform. 
                                    Stay tuned for exciting updates and enhanced capabilities.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
                    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Ready to Enhance Your Medical Practice?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Join the future of healthcare with AI-powered diagnostic assistance.
                        </p>
                        <Link
                            href={route('register')}
                            className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
                        >
                            Get Started Today
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-xl font-semibold">Doctor Assistant</span>
                        </div>
                        <p className="text-gray-400 mb-4 max-w-md mx-auto">
                            AI-powered medical assistant helping doctors provide better patient care through intelligent diagnosis support.
                        </p>
                        <div className="border-t border-gray-800 mt-8 pt-8 text-gray-400">
                            <p>&copy; 2024 Doctor Assistant. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
