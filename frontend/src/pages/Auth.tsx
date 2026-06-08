import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export function ResidentLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const nav = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await apiFetch('/api/resident/login', {
                method: 'POST', body: JSON.stringify({ email, password })
            });
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', JSON.parse(atob(data.token.split('.')[1])).role);
            nav('/dashboard');
        } catch (err: any) { setError(err.message); }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
            <h2 className="text-xl font-bold mb-4">Resident Login</h2>
            <form onSubmit={handleLogin} className="space-y-3">
                <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <input className="w-full border p-2 rounded" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
            </form>
            <p className="mt-4 text-sm">Faculty? <Link to="/resident/signup" className="text-blue-500">Sign up here</Link></p>
        </div>
    );
}

export function ResidentSignup() {
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'FACULTY' });
    const [error, setError] = useState('');
    const nav = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiFetch('/api/resident/signup', { method: 'POST', body: JSON.stringify(form) });
            nav('/resident/login');
        } catch (err: any) { setError(err.message); }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
            <h2 className="text-xl font-bold mb-4">Faculty Signup</h2>
            <form onSubmit={handleSignup} className="space-y-3">
                {['name', 'email', 'password', 'phone'].map(f => (
                    <input key={f} type={f === 'password' ? 'password' : 'text'} placeholder={f} className="w-full border p-2 rounded"
                        onChange={e => setForm({ ...form, [f]: e.target.value })} />
                ))}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button className="w-full bg-blue-600 text-white p-2 rounded">Sign Up</button>
            </form>
        </div>
    );
}