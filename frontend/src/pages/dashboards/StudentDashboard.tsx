import { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { StatusBadge } from '../../components/Badge';
import { Link } from 'react-router-dom';

export function StudentDashboard() {
    const [passes, setPasses] = useState<any[]>([]);
    const [outpassUntil, setOutpassUntil] = useState('');
    const [invites, setInvites] = useState([{ name: '', phone: '' }]);
    const [error, setError] = useState('');

    const fetchPasses = async () => {
        const data = await apiFetch('/api/resident/passes');
        setPasses(data || []);
    };
    useEffect(() => { fetchPasses(); }, []);

    const handleOutpass = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiFetch('/api/resident/createPass', {
                method: 'POST',
                body: JSON.stringify({
                    type: 'STUDENT',
                    valid_from: new Date().toISOString(),
                    valid_until: new Date(outpassUntil).toISOString()
                })
            });
            fetchPasses(); setError('');
        } catch (err: any) { setError(err.message); }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        const valid_from = new Date().toISOString();
        const valid_until = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
        try {
            await apiFetch('/api/resident/visitorPass', {
                method: 'POST',
                body: JSON.stringify({
                    passes: invites.map(inv => ({ ...inv, type: 'INVITED_VISITOR', valid_from, valid_until }))
                })
            });
            setInvites([{ name: '', phone: '' }]); setError('');
            alert("Invites sent!");
        } catch (err: any) { setError(err.message); }
    };

    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-xl font-bold mb-2">My Passes</h2>
                <table className="w-full text-left border">
                    <thead className="bg-gray-100 border-b"><tr><th>Type</th><th>Status</th><th>From</th><th>Until</th><th>Action</th></tr></thead>
                    <tbody>
                        {passes.map((p, i) => (
                            <tr key={i} className="border-b">
                                <td className="p-2">{p.type}</td><td className="p-2"><StatusBadge status={p.status} /></td>
                                <td className="p-2">{new Date(p.valid_from).toLocaleString()}</td>
                                <td className="p-2">{new Date(p.valid_until).toLocaleString()}</td>
                                <td className="p-2">
                                    {p.status === 'APPROVED' && <Link to={`/qr/${p.id || p.pass_id}?source=resident`} className="text-blue-500">View QR</Link>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2">Apply Outpass</h2>
                <form onSubmit={handleOutpass} className="flex gap-2">
                    <input type="datetime-local" required className="border p-2" onChange={e => setOutpassUntil(e.target.value)} />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded">Apply</button>
                </form>
                {error && <p className="text-red-500 text-sm">{error}</p>}
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2">Invite Visitors</h2>
                <form onSubmit={handleInvite} className="space-y-2">
                    {invites.map((inv, i) => (
                        <div key={i} className="flex gap-2">
                            <input placeholder="Name" required className="border p-2" value={inv.name} onChange={e => { const newInv = [...invites]; newInv[i].name = e.target.value; setInvites(newInv); }} />
                            <input placeholder="Phone" required className="border p-2" value={inv.phone} onChange={e => { const newInv = [...invites]; newInv[i].phone = e.target.value; setInvites(newInv); }} />
                            {i > 0 && <button type="button" onClick={() => setInvites(invites.filter((_, idx) => idx !== i))} className="text-red-500 font-bold">X</button>}
                        </div>
                    ))}
                    <button type="button" onClick={() => setInvites([...invites, { name: '', phone: '' }])} className="text-sm bg-gray-200 px-2 py-1 rounded">+ Add Row</button>
                    <br /><button className="bg-green-600 text-white px-4 py-2 rounded mt-2">Send Invites</button>
                </form>
            </section>
        </div>
    );
}