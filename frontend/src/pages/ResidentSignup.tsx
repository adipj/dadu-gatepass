import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function ResidentSignup() {
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'FACULTY' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const res = await fetch('/api/resident/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });

        if (res.ok) {
            navigate('/resident/login');
        } else {
            const data = await res.json();
            setError(data.message || 'Registration failed');
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-md shadow">
            <h2 className="text-2xl font-bold mb-4">Faculty Registration</h2>
            <form onSubmit={handleSignup} className="space-y-4">
                <input type="text" placeholder="Full Name" className="w-full border p-2 rounded" required onChange={e => setForm({ ...form, name: e.target.value })} />
                <input type="email" placeholder="Email" className="w-full border p-2 rounded" required onChange={e => setForm({ ...form, email: e.target.value })} />
                <input type="text" placeholder="Phone Number" className="w-full border p-2 rounded" required onChange={e => setForm({ ...form, phone: e.target.value })} />
                <input type="password" placeholder="Password" className="w-full border p-2 rounded" required onChange={e => setForm({ ...form, password: e.target.value })} />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Register</button>
            </form>
            <p className="mt-4 text-sm text-center">Already registered? <Link to="/resident/login" className="text-blue-600 underline">Login here</Link></p>
        </div>
    );
}