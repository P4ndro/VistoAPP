import { useState, useEffect } from 'react';
import { api } from '../utils/api';




function Contact() {
   const [message, setMessage] = useState('');
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
    api.get('/contact').then(response => {
        setMessage(response.data.message || response.data);
        setLoading(false);
    }).catch(error => {
        setError(error);
        setLoading(false);
    });
   }, []);

   return (
    <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Contact Page</h1>
        {loading ? (
            <p>Loading...</p>
        ) : (
            <p className="text-lg">{message}</p>
        )}
        {error && <p className="text-red-500">{error.message}</p>}
    </div>
   );
}

export default Contact;
