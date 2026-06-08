import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, clearAuth } from '../utils/api';

export function VisitorDashboard() {
    const [error, setError] = useState('');
    const [passId, setPassId] = useState<string | null>(localStorage.getItem('visitor_pass_id'));
    const nav = useNavigate();

    const handleApplyWalkin = async () => {
        try {
            const valid_from = new Date().toISOString();
            const valid_until = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();

            const data = await apiFetch('/api/visitor/getPass', {
                method: 'POST',
                body: JSON.stringify({ type: 'VISITOR', valid_from, valid_until })
            });

            localStorage.setItem('visitor_pass_id', data.pass_id);
            setPassId(data.pass_id);
            setError('');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 space-y-8">
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="text-2xl font-bold">Visitor Dashboard</h1>
                <button onClick={clearAuth} className="bg-red-500 text-white px-4 py-2 rounded text-sm">Logout</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="bg-white p-6 shadow rounded">
                    <h2 className="text-xl font-bold mb-4">Apply for Walk-in Pass</h2>
                    <p className="text-sm text-gray-600 mb-4">Valid for today only.</p>
                    <button
                        onClick={handleApplyWalkin}
                        className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700"
                    >
                        Apply for Walk-in Pass
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </section>

                <section className="bg-white p-6 shadow rounded">
                    <h2 className="text-xl font-bold mb-4">My Active Pass</h2>
                    {passId ? (
                        <button
                            onClick={() => nav(`/qr/${passId}?source=visitor`)}
                            className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700"
                        >
                            View My QR
                        </button>
                    ) : (
                        <p className="text-sm text-gray-500 italic text-center mt-4">No active pass found.</p>
                    )}
                </section>
            </div>
        </div>
    );
}