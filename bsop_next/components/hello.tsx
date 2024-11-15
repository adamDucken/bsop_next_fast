// bsop_next/components/Hello.tsx
"use client";

import { useEffect, useState } from 'react';

export default function Hello() {
    const [message, setMessage] = useState<string>('Loading...');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchMessage = async () => {
            try {
                // Using the FastAPI container's IP address
                const response = await fetch('http://172.21.0.2:8000/api/hello');
                const data = await response.json();
                setMessage(data.message);
            } catch (err) {
                setError('Failed to fetch message from API');
                console.error('Error fetching message:', err);
            }
        };

        fetchMessage();
    }, []);

    if (error) {
        return <h1 className="text-red-500 text-2xl">{error}</h1>;
    }

    return <h1 className="text-2xl font-bold">{message}</h1>;
}