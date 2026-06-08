import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchApi, getRole } from '../utils/api';

export default function ResidentLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const res = await fetchApi('/api/resident/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', getRole() || data.role);
            navigate('/dashboard');
        } else {
            setError(data.message || 'Login failed');
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-md shadow">
            <h2 className="text-2xl font-bold mb-4">Resident Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" placeholder="Email" className="w-full border p-2 rounded" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" className="w-full border p-2 rounded" value={password} onChange={e => setPassword(e.target.value)} required />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
            </form>
            <p className="mt-4 text-sm text-center">Faculty? <Link to="/resident/signup" className="text-blue-600 underline">Register here</Link></p>
        </div>
    );
}