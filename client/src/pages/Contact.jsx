import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

function Contact() {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/contact')
            .then(response => {
                setMessage(response.data.message || response.data);
                setLoading(false);
                setError(null);
            })
            .catch(error => {
                console.error('Error fetching:', error);
                setError('Unable to connect to server. Please try again later.');
                setLoading(false);
            });
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Contact Us
                </h1>
                <p className="text-xl text-gray-600">
                    Have questions? We'd love to hear from you
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-10">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" text="Loading..." />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <p className="text-red-800">{error}</p>
                    </div>
                ) : (
                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-700 leading-relaxed text-lg mb-6">
                            {message || 'Get in touch with us for support, feedback, or inquiries. We\'re here to help!'}
                        </p>
                    </div>
                )}

                <div className="mt-8 pt-8 border-t border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        Ways to Reach Us
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="bg-blue-100 rounded-lg p-3 flex-shrink-0">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 mb-1">Email</p>
                                <p className="text-gray-600 text-sm">Contact via GitHub</p>
                                <p className="text-gray-500 text-xs mt-1">Check the repository for issues</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="bg-green-100 rounded-lg p-3 flex-shrink-0">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 mb-1">Support</p>
                                <p className="text-gray-600 text-sm">Available 24/7 for assistance</p>
                                <p className="text-gray-500 text-xs mt-1">Check our documentation first</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>💡 Tip:</strong> Found a bug or have a feature request? Check out our GitHub repository 
                            to report issues or contribute to the project!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;
