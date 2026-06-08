import { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { StatusBadge } from '../../components/Badge';

export function ApproverDashboard({ role }: { role: string }) {
    const [passes, setPasses] = useState<any[]>([]);

    const fetchPasses = async () => {
        const data = await apiFetch('/api/passes');
        setPasses(data || []);
    };
    useEffect(() => { fetchPasses(); }, []);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        const suffix = role === 'HOSTEL_SUPERINTENDENT' ? 'hostel' : role === 'CONFERENCE_SUPERVISOR' ? 'conference' : 'admin';
        try {
            await apiFetch(`/api/passes/${id}/${action}-${suffix}`, { method: 'PUT' });
            fetchPasses();
        } catch (e) { alert(e); }
    };

    return (
        <table className="w-full text-left border bg-white shadow">
            <thead className="bg-gray-100"><tr><th>Holder</th><th>Phone</th><th>Applicant</th><th>Type</th><th>From</th><th>Until</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
                {passes.map((p, i) => (
                    <tr key={i} className="border-t">
                        <td className="p-2">{p.holder_name}</td><td className="p-2">{p.holder_phone}</td><td className="p-2">{p.applicant_name}</td>
                        <td className="p-2">{p.pass_type}</td><td className="p-2">{new Date(p.valid_from).toLocaleString()}</td><td className="p-2">{new Date(p.valid_until).toLocaleString()}</td>
                        <td className="p-2"><StatusBadge status={p.status} /></td>
                        <td className="p-2 flex gap-2">
                            <button onClick={() => handleAction(p.id, 'approve')} className="bg-green-500 text-white px-2 py-1 rounded text-sm">Approve</button>
                            <button onClick={() => handleAction(p.id, 'reject')} className="bg-red-500 text-white px-2 py-1 rounded text-sm">Reject</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}