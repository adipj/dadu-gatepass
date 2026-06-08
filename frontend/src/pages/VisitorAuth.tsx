import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VisitorAuth() {
    const [tab, setTab] = useState<'walkin' | 'invited'>('walkin');
    const [step, setStep] = useState<'details' | 'otp'>('details');
    const [form, setForm] = useState({ name: '', phone: '', otp: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleGetOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (tab === 'walkin') {
                const signupRes = await fetch('/api/visitor/signup', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, phone: form.phone })
                });
                if (!signupRes.ok) throw new Error('Signup failed');
            }

            const otpRes = await fetch('/api/visitor/getOTP', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: form.phone })
            });
            if (!otpRes.ok) throw new Error('Failed to send OTP');

            setStep('otp');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const res = await fetch('/api/visitor/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: form.phone, otp: form.otp })
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            navigate('/visitor/dashboard');
        } else {
            const data = await res.json();
            setError(data.message || 'Invalid OTP');
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-md shadow">
            <h2 className="text-2xl font-bold mb-4">Visitor Entry</h2>

            <div className="flex mb-6 border-b">
                <button className={`flex-1 py-2 ${tab === 'walkin' ? 'border-b-2 border-green-600 font-bold' : ''}`} onClick={() => { setTab('walkin'); setStep('details'); }}>Walk-in</button>
                <button className={`flex-1 py-2 ${tab === 'invited' ? 'border-b-2 border-green-600 font-bold' : ''}`} onClick={() => { setTab('invited'); setStep('details'); }}>Invited</button>
            </div>

            {step === 'details' ? (
                <form onSubmit={handleGetOTP} className="space-y-4">
                    {tab === 'walkin' && (
                        <input type="text" placeholder="Full Name" className="w-full border p-2 rounded" required onChange={e => setForm({ ...form, name: e.target.value })} />
                    )}
                    <input type="text" placeholder="Phone Number" className="w-full border p-2 rounded" required onChange={e => setForm({ ...form, phone: e.target.value })} />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Get OTP</button>
                </form>
            ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                    <p className="text-sm text-gray-600">Enter OTP sent to {form.phone}</p>
                    <input type="text" placeholder="OTP" className="w-full border p-2 rounded" required onChange={e => setForm({ ...form, otp: e.target.value })} />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Login</button>
                    <button type="button" onClick={() => setStep('details')} className="w-full text-sm text-gray-500 mt-2">Back</button>
                </form>
            )}
        </div>
    );
}