import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export function VisitorFlow() {
    const [tab, setTab] = useState<'walkin' | 'invited'>('walkin');
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ name: '', phone: '', otp: '' });
    const [error, setError] = useState('');
    const nav = useNavigate();

    const handleWalkinSignup = async () => {
        try {
            await apiFetch('/api/visitor/signup', { method: 'POST', body: JSON.stringify({ name: form.name, phone: form.phone }) });
            setStep(2); setError('');
        } catch (err: any) { setError(err.message); }
    };

    const handleGetOTP = async () => {
        try {
            await apiFetch('/api/visitor/getOTP', { method: 'POST', body: JSON.stringify({ phone: form.phone }) });
            setStep(tab === 'walkin' ? 3 : 2); setError('');
        } catch (err: any) { setError(err.message); }
    };

    const handleLogin = async () => {
        try {
            const data = await apiFetch('/api/visitor/login', { method: 'POST', body: JSON.stringify({ phone: form.phone, otp: form.otp }) });
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', JSON.parse(atob(data.token.split('.')[1])).role);
            nav('/visitor-dashboard');
        } catch (err: any) { setError(err.message); }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
            <div className="flex border-b mb-4">
                <button onClick={() => { setTab('walkin'); setStep(1); setError(''); }} className={`flex-1 py-2 ${tab === 'walkin' ? 'border-b-2 border-blue-600 font-bold' : ''}`}>Walk-in</button>
                <button onClick={() => { setTab('invited'); setStep(1); setError(''); }} className={`flex-1 py-2 ${tab === 'invited' ? 'border-b-2 border-blue-600 font-bold' : ''}`}>Invited</button>
            </div>

            <div className="space-y-3">
                {tab === 'walkin' && step === 1 && (
                    <>
                        <input placeholder="Name" className="w-full border p-2" onChange={e => setForm({ ...form, name: e.target.value })} />
                        <input placeholder="Phone" className="w-full border p-2" onChange={e => setForm({ ...form, phone: e.target.value })} />
                        <button onClick={handleWalkinSignup} className="w-full bg-blue-600 text-white p-2 rounded">Signup</button>
                    </>
                )}
                {((tab === 'walkin' && step === 2) || (tab === 'invited' && step === 1)) && (
                    <>
                        <input placeholder="Phone" className="w-full border p-2" onChange={e => setForm({ ...form, phone: e.target.value })} />
                        <button onClick={handleGetOTP} className="w-full bg-blue-600 text-white p-2 rounded">Get OTP</button>
                    </>
                )}
                {((tab === 'walkin' && step === 3) || (tab === 'invited' && step === 2)) && (
                    <>
                        <input placeholder="OTP" className="w-full border p-2" onChange={e => setForm({ ...form, otp: e.target.value })} />
                        <button onClick={handleLogin} className="w-full bg-green-600 text-white p-2 rounded">Login</button>
                    </>
                )}
                {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
        </div>
    );
}