import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../utils/api';

export default function StudentFacultyView({ role }: { role: string }) {
    const [passes, setPasses] = useState<any[]>([]);
    const [outpassForm, setOutpassForm] = useState({ valid_from: '', valid_until: '' });
    const [error, setError] = useState('');
    const [createdPassId, setCreatedPassId] = useState('');
    const navigate = useNavigate();

    const loadPasses = async () => {
        const res = await fetchApi('/api/resident/passes');
        if (res.ok) setPasses(await res.json());
    };

    useEffect(() => { loadPasses(); }, []);

    const handleApplyOutpass = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const res = await fetchApi('/api/resident/createPass', {
            method: 'POST',
            body: JSON.stringify({
                type: role,
                valid_from: new Date(outpassForm.valid_from).toISOString(),
                valid_until: new Date(outpassForm.valid_until).toISOString()
            })
        });
        const data = await res.json();
        if (res.ok) {
            setCreatedPassId(data.pass_id);
            loadPasses();
        } else setError(data.message || 'Failed to create pass');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'EXPIRED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold">{role} Dashboard</h2>

            <div className="bg-white p-6 shadow rounded">
                <h3 className="font-bold mb-4">Apply Outpass</h3>
                <form onSubmit={handleApplyOutpass} className="flex gap-4 items-end">
                    <div><label className="block text-sm">Valid From</label><input type="datetime-local" className="border p-2" required onChange={e => setOutpassForm({ ...outpassForm, valid_from: e.target.value })} /></div>
                    <div><label className="block text-sm">Valid Until</label><input type="datetime-local" className="border p-2" required onChange={e => setOutpassForm({ ...outpassForm, valid_until: e.target.value })} /></div>
                    <button type="submit" className="bg-blue-600 text-white p-2 rounded px-4">Apply</button>
                </form>
                {error && <p className="text-red-500 mt-2">{error}</p>}
                {createdPassId && (
                    <div className="mt-4 p-4 bg-green-50 flex justify-between items-center">
                        <span>Pass Created! ID: {createdPassId}</span>
                        <button onClick={() => navigate(`/qr/${createdPassId}?source=resident`)} className="bg-green-600 text-white px-4 py-2 rounded">View QR</button>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 shadow rounded">
                <h3 className="font-bold mb-4">My Passes</h3>
                <ul className="space-y-2">
                    {passes.map(p => (
                        <li key={p.pass_id || p.id} className="border p-3 flex justify-between items-center">
                            <div>
                                <span className="font-semibold">{p.type}</span> <br />
                                <span className="text-sm text-gray-500">{new Date(p.valid_from).toLocaleString()} - {new Date(p.valid_until).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(p.status)}`}>{p.status}</span>
                                {p.status === 'APPROVED' && (
                                    <button onClick={() => navigate(`/qr/${p.pass_id}?source=resident`)} className="text-blue-600 underline text-sm">QR</button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}