import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { apiFetch } from '../utils/api';

export function QRDisplay() {
    const { pass_id } = useParams();
    const [searchParams] = useSearchParams();
    const source = searchParams.get('source');

    const [qrValue, setQrValue] = useState<string>('');
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(18);

    const fetchQR = async () => {
        try {
            const endpoint = source === 'resident'
                ? `/api/resident/getQR/${pass_id}`
                : `/api/visitor/getQR/${pass_id}`;
            const data = await apiFetch(endpoint);
            setQrValue(JSON.stringify(data));
            setError('');
            setTimer(18);
        } catch (err: any) {
            if (err === 'Unauthorized') return;
            setError('Pass not approved yet or has expired');
        }
    };

    useEffect(() => {
        fetchQR();
        const fetchInterval = setInterval(fetchQR, 18000);
        const tickInterval = setInterval(() => setTimer(t => (t > 0 ? t - 1 : 18)), 1000);
        return () => { clearInterval(fetchInterval); clearInterval(tickInterval); };
    }, [pass_id, source]);

    if (error) return <div className="text-center mt-20 text-red-600 text-xl font-bold">{error}</div>;

    return (
        <div className="flex flex-col items-center justify-center mt-20">
            <h2 className="text-2xl font-bold mb-6">Your Access QR Code</h2>
            {qrValue ? (
                <div className="bg-white p-4 shadow-lg rounded-xl">
                    <QRCodeSVG value={qrValue} size={256} />
                </div>
            ) : <p>Generating...</p>}
            <p className="mt-6 text-gray-500 font-mono text-lg">Refreshes in: {timer}s</p>
        </div>
    );
}