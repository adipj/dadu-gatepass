import { useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';

export default function ApproverView({ role }: { role: string }) {
    const [passes, setPasses] = useState<any[]>([]);
    const [error, setError] = useState('');

    const loadPasses = async () => {
        const res = await fetchApi('/api/passes');
        if (res.ok) {
            setPasses(await res.json());
        } else {
            setError('Failed to load passes');
        }
    };

    useEffect(() => { loadPasses(); }, []);

    const getRoleSuffix = () => {
        if (role === 'HOSTEL_SUPERINTENDENT') return 'hostel';
        if (role === 'CONFERENCE_SUPERVISOR') return 'conference';
        if (role === 'ADMIN') return 'admin';
        return '';
    };

    const handleAction = async (passId: string, action: 'approve' | 'reject') => {
        const suffix = getRoleSuffix();
        const res = await fetchApi(`/api/passes/${passId}/${action}-${suffix}`, { method: 'PUT' });
        if (res.ok) {
            loadPasses(); // Reload list after action
        } else {
            const data = await res.json();
            alert(data.message || 'Action failed');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">{role.replace('_', ' ')} Dashboard</h2>
            <div className="bg-white p-6 shadow rounded overflow-x-auto">
                <h3 className="font-bold mb-4">Pending Approvals</h3>
                {error && <p className="text-red-500 mb-4">{error}</p>}

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="p-2">Type</th>
                            <th className="p-2">Holder</th>
                            <th className="p-2">Applicant</th>
                            <th className="p-2">Valid From</th>
                            <th className="p-2">Valid Until</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {passes.map(p => (
                            <tr key={p.id} className="border-b">
                                <td className="p-2 text-sm">{p.type}</td>
                                <td className="p-2">{p.holder_name}</td>
                                <td className="p-2">{p.applicant_name || 'Self'}</td>
                                <td className="p-2 text-sm">{new Date(p.valid_from).toLocaleString()}</td>
                                <td className="p-2 text-sm">{new Date(p.valid_until).toLocaleString()}</td>
                                <td className="p-2">
                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">{p.status}</span>
                                </td>
                                <td className="p-2 flex gap-2">
                                    <button onClick={() => handleAction(p.pass_id, 'approve')} className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600">Approve</button>
                                    <button onClick={() => handleAction(p.pass_id, 'reject')} className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600">Reject</button>
                                </td>
                            </tr>
                        ))}
                        {passes.length === 0 && (
                            <tr><td colSpan={7} className="p-4 text-center text-gray-500">No pending passes found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}