import { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';

export function GateSecurityDashboard() {
    const [walkins, setWalkins] = useState<any[]>([]);
    const [scanTab, setScanTab] = useState<'QR' | 'RFID'>('QR');
    const [qrInput, setQrInput] = useState('');
    const [rfidInput, setRfidInput] = useState('');
    const [scanResult, setScanResult] = useState<{ status: string, msg: string } | null>(null);

    const fetchWalkins = async () => {
        try {
            const data = await apiFetch('/api/passes');
            setWalkins(data || []);
        } catch (e) { }
    };

    useEffect(() => {
        fetchWalkins();
        const interval = setInterval(fetchWalkins, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        await apiFetch(`/api/passes/${id}/${action}-security`, { method: 'PUT' });
        fetchWalkins();
    };

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let endpoint = '';
            let body = {};
            if (scanTab === 'QR') {
                const parsed = JSON.parse(qrInput);
                endpoint = '/api/gate/scan-qr';
                body = { pass_id: parsed.pass_id, time: parsed.time, sig: parsed.sig };
            } else {
                endpoint = '/api/gate/scan-rfid';
                body = { tag_id: rfidInput };
            }
            const data = await apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) });
            setScanResult({ status: data.status || 'ENTRY', msg: data.message });
            setQrInput(''); setRfidInput('');
        } catch (err: any) {
            setScanResult({ status: 'DENIED', msg: err.message });
        }
    };

    const resultColors: Record<string, string> = {
        ENTRY: 'bg-green-600', EXIT: 'bg-blue-600', DENIED: 'bg-red-600'
    };
    const resultText: Record<string, string> = {
        ENTRY: 'ENTRY GRANTED', EXIT: 'EXIT GRANTED', DENIED: 'ACCESS DENIED'
    };

    return (
        <div className="flex gap-6">
            <div className="w-1/2 bg-white p-4 shadow rounded">
                <h2 className="text-xl font-bold mb-4">Pending Walk-ins</h2>
                <table className="w-full text-left">
                    <tbody>
                        {walkins.map((w, i) => (
                            <tr key={i} className="border-b">
                                <td className="py-2">{w.holder_name}<br /><span className="text-xs text-gray-500">{w.holder_phone}</span></td>
                                <td>{new Date(w.valid_until).toLocaleTimeString()}</td>
                                <td className="flex gap-2">
                                    <button onClick={() => handleAction(w.id, 'approve')} className="bg-green-500 text-white px-2 py-1 rounded">Approve</button>
                                    <button onClick={() => handleAction(w.id, 'reject')} className="bg-red-500 text-white px-2 py-1 rounded">Reject</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="w-1/2 bg-white p-4 shadow rounded">
                <h2 className="text-xl font-bold mb-4">Scanner Simulation</h2>
                <div className="flex border-b mb-4">
                    <button onClick={() => setScanTab('QR')} className={`flex-1 py-2 ${scanTab === 'QR' ? 'border-b-2 border-blue-600 font-bold' : ''}`}>QR</button>
                    <button onClick={() => setScanTab('RFID')} className={`flex-1 py-2 ${scanTab === 'RFID' ? 'border-b-2 border-blue-600 font-bold' : ''}`}>RFID</button>
                </div>

                <form onSubmit={handleScan} className="space-y-4">
                    {scanTab === 'QR' ? (
                        <textarea className="w-full border p-2 h-32 font-mono text-sm" placeholder="Paste QR JSON here" value={qrInput} onChange={e => setQrInput(e.target.value)} required />
                    ) : (
                        <input className="w-full border p-2" placeholder="Enter tag_id" value={rfidInput} onChange={e => setRfidInput(e.target.value)} required />
                    )}
                    <button className="w-full bg-indigo-600 text-white py-2 rounded">Simulate Scan</button>
                </form>

                {scanResult && (
                    <div className={`mt-6 p-6 text-center text-white font-bold text-2xl rounded ${resultColors[scanResult.status]}`}>
                        {resultText[scanResult.status] || scanResult.status}
                        <p className="text-sm font-normal mt-2">{scanResult.msg}</p>
                    </div>
                )}
            </div>
        </div>
    );
}