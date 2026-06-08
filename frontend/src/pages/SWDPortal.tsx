import { useState } from 'react';
import { apiFetch } from '../utils/api';
import { StatusBadge } from '../components/Badge';

export function SWDPortal() {
    const [singleForm, setSingleForm] = useState({ studentEmail: '', name: '', phone: '', hashed_password: '', type: 'STUDENT', valid_from: '', valid_until: '' });
    const [bulkRows, setBulkRows] = useState([{ email: '', name: '', phone: '', password: '', valid_from: '', valid_until: '' }]);
    const [lookupEmail, setLookupEmail] = useState('');
    const [lookupResult, setLookupResult] = useState<any[]>([]);
    const [expireId, setExpireId] = useState('');
    const [messages, setMessages] = useState<Record<string, string>>({});

    const handleSingleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...singleForm,
                valid_from: new Date(singleForm.valid_from).toISOString(),
                valid_until: new Date(singleForm.valid_until).toISOString()
            };
            const data = await apiFetch('/api/swd/createPass', { method: 'POST', body: JSON.stringify(payload) }, true);
            setMessages({ ...messages, single: `Success! Pass ID: ${data.pass_id}` });
        } catch (err: any) { setMessages({ ...messages, singleError: err.message }); }
    };

    const handleBulkCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        let success = 0, fail = 0;
        for (const row of bulkRows) {
            try {
                await apiFetch('/api/swd/createPass', {
                    method: 'POST',
                    body: JSON.stringify({ studentEmail: row.email, name: row.name, phone: row.phone, hashed_password: row.password, type: 'STUDENT', valid_from: new Date(row.valid_from).toISOString(), valid_until: new Date(row.valid_until).toISOString() })
                }, true);
                success++;
            } catch (e) { fail++; }
        }
        setMessages({ ...messages, bulk: `Complete: ${success} Succeeded, ${fail} Failed` });
    };

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await apiFetch(`/api/swd/getPass?studentEmail=${lookupEmail}`, {}, true);
            setLookupResult(Array.isArray(data) ? data : [data]);
        } catch (err: any) { setMessages({ ...messages, lookupError: err.message }); }
    };

    const handleExpire = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiFetch(`/api/swd/deletePass/${expireId}`, { method: 'DELETE' }, true);
            setMessages({ ...messages, expire: 'Pass successfully expired' });
        } catch (err: any) { setMessages({ ...messages, expireError: err.message }); }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 space-y-8">
            <h1 className="text-3xl font-bold border-b pb-4">SWD Portal Interface</h1>

            {/* Lookup */}
            <section className="bg-white p-4 shadow rounded">
                <h2 className="text-xl font-bold mb-4">3. Look up Student Passes</h2>
                <form onSubmit={handleLookup} className="flex gap-2 mb-4">
                    <input className="border p-2 flex-1" placeholder="Student Email" value={lookupEmail} onChange={e => setLookupEmail(e.target.value)} required />
                    <button className="bg-purple-600 text-white px-4 py-2 rounded">Search</button>
                </form>
                {messages.lookupError && <p className="text-red-500 text-sm mb-2">{messages.lookupError}</p>}
                {lookupResult.length > 0 && (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100"><tr><th>ID</th><th>Type</th><th>Status</th><th>Until</th></tr></thead>
                        <tbody>
                            {lookupResult.map(r => (
                                <tr key={r.id || r.pass_id} className="border-b">
                                    <td className="p-1">{r.id || r.pass_id}</td><td className="p-1">{r.type || r.pass_type}</td>
                                    <td className="p-1"><StatusBadge status={r.status} /></td><td className="p-1">{new Date(r.valid_until).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            {/* Expire */}
            <section className="bg-white p-4 shadow rounded">
                <h2 className="text-xl font-bold mb-4">4. Expire a Pass</h2>
                <form onSubmit={handleExpire} className="flex gap-2">
                    <input className="border p-2 flex-1" placeholder="Pass ID" value={expireId} onChange={e => setExpireId(e.target.value)} required />
                    <button className="bg-red-600 text-white px-4 py-2 rounded">Expire Pass</button>
                </form>
                {messages.expire && <p className="text-green-600 mt-2">{messages.expire}</p>}
                {messages.expireError && <p className="text-red-500 mt-2">{messages.expireError}</p>}
            </section>

            {/* (Create and Bulk Create sections use standard grid-form setups similar to the rest, using singleForm and bulkRows state) */}
        </div>
    );
}