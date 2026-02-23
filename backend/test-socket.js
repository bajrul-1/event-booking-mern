import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('connect', async () => {
    console.log('Connected to socket!');

    // Trigger a message
    const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Socket Test',
            email: 'test@socket.com',
            subject: 'Socket Routing',
            message: 'Checking the link payload',
            ipAddress: '127.0.0.1'
        })
    });

    console.log('Post status:', res.status);
});

socket.on('new_message', (payload) => {
    console.log('RECEIVED NEW MESSAGE PAYLOAD:');
    console.dir(payload);
    process.exit(0);
});

setTimeout(() => {
    console.log('Timeout waiting for socket');
    process.exit(1);
}, 5000);
