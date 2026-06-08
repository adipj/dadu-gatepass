import { useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';

export default function GateSecurityView() {
    const [passes, setPasses] = useState<any[]>([]);
    const [qrInput, setQrInput] = useState('');
    const [rfidInput, setRfidInput] = useState('');
    const [scanResult, setScanResult] = useState<{ status: string, message: string } | null>(null);

    const loadPendingWalkins = async () => {
        const res = await fetchApi('/api/passes');
        if (res.ok) setPasses(await res.json());
    };

    useEffect(() => { loadPendingWalkins(); }, []);

    const handleApproveReject = async (id: string, action: 'approve' | 'reject') => {
        await fetchApi(`/api/passes/${id}/${action}-security`, { method: 'PUT' });
        loadPendingWalkins();
    };

    const handleQRSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const parsed = JSON.parse(qrInput);
            const res = await fetchApi('/api/gate/scan-qr', {
                method: 'POST',
                body: JSON.stringify({ pass_id: parsed.pass_id, time: parsed.time, sig: parsed.sig })
            });
            const data = await res.json();
            setScanResult({ status: data.status || (res.ok ? 'ENTRY' : 'DENIED'), message: data.message });
            setQrInput('');
        } catch (err) {
            setScanResult({ status: 'DENIED', message: 'Invalid JSON string format' });
        }
    };

    const handleRFIDSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetchApi('/api/gate/scan-rfid', { method: 'POST', body: JSON.stringify({ tag_id: rfidInput }) });
        const data = await res.json();
        setScanResult({ status: data.status || (res.ok ? 'ENTRY' : 'DENIED'), message: data.message });
        setRfidInput('');
    };

    return (
        <div className="grid grid-cols-2 gap-8">
            {/* Left Panel */}
            <div className="bg-white p-6 shadow rounded">
                <h3 className="font-bold mb-4">Pending Walk-ins (VISITOR)</h3>
                <div className="space-y-4">
                    {passes.map(p => (
                        <div key={p.id} className="border p-4 rounded flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{p.holder_name}</p>
                                <p className="text-sm text-gray-500">From: {new Date(p.valid_from).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleApproveReject(p.pass_id, 'approve')} className="bg-green-500 text-white px-3 py-1 rounded">Approve</button>
                                <button onClick={() => handleApproveReject(p.pass_id, 'reject')} className="bg-red-500 text-white px-3 py-1 rounded">Reject</button>
                            </div>
                        </div>
                    ))}
                    {passes.length === 0 && <p className="text-gray-500">No pending passes.</p>}
                </div>
            </div>

            {/* Right Panel */}
            <div className="bg-white p-6 shadow rounded">
                <h3 className="font-bold mb-4">Scanner Simulation</h3>

                {scanResult && (
                    <div className={`mb-6 p-4 rounded font-bold text-lg text-white ${scanResult.status === 'ENTRY' ? 'bg-green-600' : scanResult.status === 'EXIT' ? 'bg-blue-600' : 'bg-red-600'}`}>
                        {scanResult.status}: {scanResult.message}
                    </div>
                )}

                <div className="mb-8">
                    <h4 className="font-semibold mb-2">QR Scanner</h4>
                    <form onSubmit={handleQRSubmit} className="flex flex-col gap-2">
                        <textarea className="border p-2 rounded h-24 font-mono text-sm" placeholder='Paste QR JSON here...' value={qrInput} onChange={e => setQrInput(e.target.value)} required />
                        <button type="submit" className="bg-gray-800 text-white p-2 rounded">Scan QR</button>
                    </form>
                </div>

                <div>
                    <h4 className="font-semibold mb-2">RFID Scanner</h4>
                    <form onSubmit={handleRFIDSubmit} className="flex gap-2">
                        <input type="text" className="border p-2 rounded flex-1" placeholder="Tag ID" value={rfidInput} onChange={e => setRfidInput(e.target.value)} required />
                        <button type="submit" className="bg-gray-800 text-white px-4 rounded">Scan</button>
                    </form>
                </div>
            </div>
        </div>
    );
}