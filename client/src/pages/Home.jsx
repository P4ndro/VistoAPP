import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';

function Home() {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/')
            .then(res => {
                setMessage(res.data.message || res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching:', err);
                setMessage('Error connecting to server. Make sure backend is running on port 3000.');
                setLoading(false);
            });
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Welcome to VistoAPP
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    Transform your GitHub activity into a beautiful developer portfolio
                </p>
                <div className="flex justify-center gap-4">
                    <Link
                        to="/login"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Get Started
                    </Link>
                    <Link
                        to="/about"
                        className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Learn More
                    </Link>
                </div>
            </div>

            {/* Backend connection status (for debugging) */}
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Server Status</h2>
                {loading ? (
                    <p className="text-gray-600">Checking connection...</p>
                ) : (
                    <p className={`text-lg ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}

export default Home;

