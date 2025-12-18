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
                    About VistoAPP
                </h1>
                <p className="text-xl text-gray-600">
                    Transform your GitHub activity into a beautiful developer portfolio
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
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
                        <p className="text-gray-700 leading-relaxed">
                            {message || 'Welcome to VistoAPP! This platform helps developers showcase their GitHub activity and create stunning portfolios.'}
                        </p>
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

