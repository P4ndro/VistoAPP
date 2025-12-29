import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

function About() {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/about')
            .then(res => {
                setMessage(res.data.message || res.data);
                setLoading(false);
                setError(null);
            })
            .catch(err => {
                console.error('Error fetching:', err);
                setError('Unable to connect to server. Please try again later.');
                setLoading(false);
            });
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    About Visto
                </h1>
                <p className="text-xl text-gray-600">
                    Transform your GitHub activity into a beautiful developer portfolio
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
                            {message || 'Welcome to Visto! This platform helps developers showcase their GitHub activity and create stunning portfolios.'}
                        </p>
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Project</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Visto is a MERN-stack application that transforms your GitHub activity into a beautiful, 
                                customizable developer portfolio. This is a personal project built by <strong>Sandro Iobidze</strong> 
                                as part of his learning journey to become a MERN stack developer.
                            </p>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                This is my <strong>first project</strong> that I built completely on my own, combining all the 
                                skills I've learned in React, Node.js, Express, and MongoDB. Whether you're looking to showcase 
                                your work to potential employers, clients, or the developer community, Visto makes it easy to 
                                create a professional portfolio that reflects your coding journey.
                            </p>
                            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Key Features</h3>
                            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                                <li>Connect with GitHub OAuth for secure authentication</li>
                                <li>Sync and display your repository statistics, commits, and languages</li>
                                <li>Customize your portfolio with multiple themes and layouts</li>
                                <li>Pin your favorite repositories and add custom text sections</li>
                                <li>Export your portfolio as PNG or PDF</li>
                                <li>Save multiple portfolio versions with tags</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed">
                                Built with modern technologies including React, Node.js, Express, and MongoDB, 
                                Visto is designed to be fast, responsive, and user-friendly.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                    <div className="text-3xl mb-3">🚀</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Setup</h3>
                    <p className="text-gray-600 text-sm">
                        Connect your GitHub account in seconds
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                    <div className="text-3xl mb-3">📊</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Statistics</h3>
                    <p className="text-gray-600 text-sm">
                        View your GitHub activity and contributions
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                    <div className="text-3xl mb-3">🎨</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Customize</h3>
                    <p className="text-gray-600 text-sm">
                        Design your portfolio to match your style
                    </p>
                </div>
            </div>
        </div>
    );
}

export default About;

