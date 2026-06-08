import { useNavigate } from 'react-router-dom';

export function Landing() {
    const nav = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center h-screen space-y-4">
            <h1 className="text-3xl font-bold mb-6">Campus Gatepass System</h1>
            <button onClick={() => nav('/resident/login')} className="px-6 py-2 bg-blue-600 text-white rounded">Resident Login</button>
            <button onClick={() => nav('/visitor')} className="px-6 py-2 bg-green-600 text-white rounded">Visitor</button>
            <button onClick={() => nav('/swd')} className="px-6 py-2 bg-purple-600 text-white rounded">SWD Portal</button>
        </div>
    );
}