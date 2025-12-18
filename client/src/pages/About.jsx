import { useEffect, useState } from 'react';
import { api } from '../utils/api';

function About() {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/about')
            .then(res => {
                setMessage(res.data.message || res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching:', err);
                setMessage('Error connecting to server');
                setLoading(false);
            });
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">About Page</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <p className="text-lg">{message}</p>
            )}
        </div>
    );
}

export default About;

