import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { LogIn, UserPlus, Key, Shield, QrCode, Plus, Trash2, LogOut } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api';

// --- UTILS & API ---
const getAuthToken = () => localStorage.getItem('jwt');
const setAuthToken = (token: string) => localStorage.setItem('jwt', token);
const clearAuthToken = () => localStorage.removeItem('jwt');

const decodeJWT = (token: string) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

const fetchApi = async (endpoint: string, options: RequestInit = {}, isSWD = false) => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };

    if (isSWD) {
        headers['swd-api-key'] = 'test-swd-key';
    } else {
        const token = getAuthToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers: { ...headers, ...options.headers } });

    if (res.status === 401 || res.status === 403) {
        clearAuthToken();
        window.location.href = '/resident/login';
        throw new Error('Session expired, please login again');
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'API Error' }));
        throw new Error(err.message || `Error ${res.status}`);
    }

    return res.json();
};

// --- SHARED COMPONENTS ---
const Badge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        APPROVED: 'bg-green-100 text-green-800',
        REJECTED: 'bg-red-100 text-red-800',
        EXPIRED: 'bg-gray-100 text-gray-800'
    };
    return <span className={`px-2 py-1 rounded text-xs font-bold ${colors[status] || colors.EXPIRED}`}>{status}</span>;
};

// --- PAGES & DASHBOARDS ---

const Landing = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full space-y-4">
            <h1 className="text-3xl font-bold text-center mb-8">Campus Gatepass System</h1>
            <Link to="/resident/login" className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <span className="font-semibold">Resident Login</span> <LogIn size={20} />
            </Link>
            <Link to="/visitor" className="flex items-center justify-between p-4 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <span className="font-semibold">Visitor Access</span> <UserPlus size={20} />
            </Link>
            <Link to="/swd" className="flex items-center justify-between p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <span className="font-semibold">SWD Interface</span> <Key size={20} />
            </Link>
        </div>
    </div>
);

const ResidentLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await fetchApi('/resident/login', { method: 'POST', body: JSON.stringify({ email, password }) });
            setAuthToken(data.token);
            navigate('/dashboard');
        } catch (err: any) { setError(err.message); }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded">
            <h2 className="text-2xl font-bold mb-4">Resident Login</h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" placeholder="Email" className="w-full p-2 border rounded" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" className="w-full p-2 border rounded" value={password} onChange={e => setPassword(e.target.value)} required />
                <button className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
            </form>
            <p className="mt-4 text-sm">Faculty? <Link to="/resident/signup" className="text-blue-600">Sign up here</Link></p>
        </div>
    );
};

const ResidentSignup = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [error, setError] = useState('');

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetchApi('/resident/signup', { method: 'POST', body: JSON.stringify({ ...form, role: 'FACULTY' }) });
            navigate('/resident/login');
        } catch (err: any) { setError(err.message); }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded">
            <h2 className="text-2xl font-bold mb-4">Faculty Signup</h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleSignup} className="space-y-4">
                <input placeholder="Name" className="w-full p-2 border rounded" onChange={e => setForm({ ...form, name: e.target.value })} required />
                <input type="email" placeholder="Email" className="w-full p-2 border rounded" onChange={e => setForm({ ...form, email: e.target.value })} required />
                <input placeholder="Phone" className="w-full p-2 border rounded" onChange={e => setForm({ ...form, phone: e.target.value })} required />
                <input type="password" placeholder="Password" className="w-full p-2 border rounded" onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button className="w-full bg-blue-600 text-white p-2 rounded">Sign Up</button>
            </form>
        </div>
    );
};

const VisitorFlow = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isWalkIn, setIsWalkIn] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', otp: '' });
    const [error, setError] = useState('');

    const handleSignup = async () => {
        try { await fetchApi('/visitor/signup', { method: 'POST', body: JSON.stringify({ name: form.name, phone: form.phone }) }); setStep(2); }
        catch (err: any) { setError(err.message); }
    };
    const handleGetOTP = async () => {
        try { await fetchApi('/visitor/getOTP', { method: 'POST', body: JSON.stringify({ phone: form.phone }) }); setStep(3); }
        catch (err: any) { setError(err.message); }
    };
    const handleLogin = async () => {
        try {
            const res = await fetchApi('/visitor/login', { method: 'POST', body: JSON.stringify({ phone: form.phone, otp: form.otp }) });
            setAuthToken(res.token); navigate('/dashboard');
        } catch (err: any) { setError(err.message); }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded">
            <h2 className="text-2xl font-bold mb-4">Visitor Portal</h2>
            {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

            {step === 1 && (
                <div className="space-y-4">
                    <button onClick={() => { setIsWalkIn(true); setStep(1.5); }} className="w-full bg-gray-200 p-2 rounded">New Walk-In Registration</button>
                    <button onClick={() => { setIsWalkIn(false); setStep(2); }} className="w-full bg-blue-600 text-white p-2 rounded">I am an Invited Visitor</button>
                </div>
            )}
            {step === 1.5 && (
                <div className="space-y-4">
                    <input placeholder="Name" className="w-full p-2 border rounded" onChange={e => setForm({ ...form, name: e.target.value })} />
                    <input placeholder="Phone" className="w-full p-2 border rounded" onChange={e => setForm({ ...form, phone: e.target.value })} />
                    <button onClick={handleSignup} className="w-full bg-blue-600 text-white p-2 rounded">Register & Get OTP</button>
                </div>
            )}
            {step === 2 && (
                <div className="space-y-4">
                    <input placeholder="Phone" className="w-full p-2 border rounded" onChange={e => setForm({ ...form, phone: e.target.value })} />
                    <button onClick={handleGetOTP} className="w-full bg-blue-600 text-white p-2 rounded">Get OTP</button>
                </div>
            )}
            {step === 3 && (
                <div className="space-y-4">
                    <input placeholder="Enter OTP" className="w-full p-2 border rounded" onChange={e => setForm({ ...form, otp: e.target.value })} />
                    <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
                </div>
            )}
        </div>
    );
};

const QRViewer = () => {
    const { pass_id } = useParams();
    const [qrData, setQrData] = useState<string | null>(null);
    const [error, setError] = useState('');
    const endpoint = decodeJWT(getAuthToken() || '')?.role === 'VISITOR' ? '/visitor/getQR' : '/resident/getQR';

    useEffect(() => {
        const fetchQR = async () => {
            try {
                const data = await fetchApi(`${endpoint}/${pass_id}`);
                setQrData(JSON.stringify(data));
            } catch (err: any) { setError(err.message); }
        };
        fetchQR();
        const interval = setInterval(fetchQR, 18000);
        return () => clearInterval(interval);
    }, [pass_id, endpoint]);

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">Pass QR Code</h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {qrData ? <QRCodeSVG value={qrData} size={256} /> : <p>Loading QR...</p>}
            <p className="text-sm text-gray-500 mt-4">Refreshes every 18 seconds</p>
        </div>
    );
};

// --- DASHBOARD COMPONENTS ---

const ResidentBaseDashboard = ({ role }: { role: 'STUDENT' | 'FACULTY' }) => {
    const [passes, setPasses] = useState<any[]>([]);
    const [rfidForm, setRfidForm] = useState('');
    const [inviteType, setInviteType] = useState<'NONE' | 'OUTPASS' | 'BULK'>('NONE');
    const [outpassForm, setOutpassForm] = useState({ valid_from: '', valid_to: '', rfid_id: '' });
    const [bulkVisitors, setBulkVisitors] = useState([{ name: '', phone: '', valid_from: '', valid_to: '' }]);
    const visitorType = role === 'STUDENT' ? 'INVITED_VISITOR' : 'CONFERENCE_PARTICIPANT';

    useEffect(() => {
        fetchApi('/resident/passes').then(setPasses).catch(console.error);
    }, []);

    const handleApplyRFID = async () => {
        await fetchApi(`/resident/applyRFID/${rfidForm}`, { method: 'PUT' });
        alert('RFID Applied'); setRfidForm('');
    };

    const handleOutpass = async () => {
        await fetchApi('/resident/createPass', { method: 'POST', body: JSON.stringify({ type: role, ...outpassForm }) });
        alert('Applied'); setInviteType('NONE');
        fetchApi('/resident/passes').then(setPasses);
    };

    const handleBulkInvite = async () => {
        const payload = bulkVisitors.map(v => ({ ...v, type: visitorType }));
        await fetchApi('/resident/visitorPass', { method: 'POST', body: JSON.stringify({ passes: payload }) });
        alert('Invited'); setInviteType('NONE');
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <button onClick={() => setInviteType('OUTPASS')} className="bg-blue-600 text-white px-4 py-2 rounded">Apply Outpass</button>
                <button onClick={() => setInviteType('BULK')} className="bg-green-600 text-white px-4 py-2 rounded">
                    Invite {role === 'STUDENT' ? 'Visitors' : 'Conference Participants'}
                </button>
            </div>

            {role === 'FACULTY' && (
                <div className="flex gap-2">
                    <input placeholder="Vehicle Number" className="border p-2 rounded" value={rfidForm} onChange={e => setRfidForm(e.target.value)} />
                    <button onClick={handleApplyRFID} className="bg-purple-600 text-white px-4 py-2 rounded">Register RFID</button>
                </div>
            )}

            {inviteType === 'OUTPASS' && (
                <div className="p-4 bg-gray-50 border rounded space-y-2">
                    <h3 className="font-bold">Apply for Outpass</h3>
                    <input type="datetime-local" className="border p-2 w-full" onChange={e => setOutpassForm({ ...outpassForm, valid_from: e.target.value })} />
                    <input type="datetime-local" className="border p-2 w-full" onChange={e => setOutpassForm({ ...outpassForm, valid_to: e.target.value })} />
                    {role === 'FACULTY' && <input placeholder="RFID ID (Optional)" className="border p-2 w-full" onChange={e => setOutpassForm({ ...outpassForm, rfid_id: e.target.value })} />}
                    <button onClick={handleOutpass} className="bg-blue-600 text-white px-4 py-2 rounded w-full">Submit</button>
                </div>
            )}

            {inviteType === 'BULK' && (
                <div className="p-4 bg-gray-50 border rounded space-y-4">
                    <h3 className="font-bold">Bulk Invite</h3>
                    {bulkVisitors.map((v, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <input placeholder="Name" className="border p-2 w-1/4" onChange={e => { const nv = [...bulkVisitors]; nv[i].name = e.target.value; setBulkVisitors(nv); }} />
                            <input placeholder="Phone" className="border p-2 w-1/4" onChange={e => { const nv = [...bulkVisitors]; nv[i].phone = e.target.value; setBulkVisitors(nv); }} />
                            <input type="datetime-local" className="border p-2 w-1/4" onChange={e => { const nv = [...bulkVisitors]; nv[i].valid_from = e.target.value; setBulkVisitors(nv); }} />
                            <input type="datetime-local" className="border p-2 w-1/4" onChange={e => { const nv = [...bulkVisitors]; nv[i].valid_to = e.target.value; setBulkVisitors(nv); }} />
                            <button onClick={() => setBulkVisitors(bulkVisitors.filter((_, idx) => idx !== i))}><Trash2 size={20} className="text-red-500" /></button>
                        </div>
                    ))}
                    <button onClick={() => setBulkVisitors([...bulkVisitors, { name: '', phone: '', valid_from: '', valid_to: '' }])} className="text-blue-600 flex items-center"><Plus size={16} /> Add Row</button>
                    <button onClick={handleBulkInvite} className="bg-green-600 text-white px-4 py-2 rounded w-full">Send Invites</button>
                </div>
            )}

            <h3 className="text-xl font-bold mt-6">My Passes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {passes.map(p => (
                    <Link to={`/pass/${p.id}/qr`} key={p.id} className="block p-4 border rounded shadow hover:bg-gray-50 cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold">{p.type}</span>
                            <Badge status={p.status} />
                        </div>
                        <div className="text-sm text-gray-600">
                            Valid: {new Date(p.valid_from).toLocaleString()} - {new Date(p.valid_to).toLocaleString()}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

const VisitorDashboard = () => {
    const [passes, setPasses] = useState<any[]>([]);
    useEffect(() => { fetchApi('/visitor/myPasses').then(setPasses).catch(console.error); }, []);

    return (
        <div>
            <h3 className="text-xl font-bold mb-4">My Passes</h3>
            <div className="grid gap-4">
                {passes.map(p => (
                    p.status === 'APPROVED' ? (
                        <Link to={`/pass/${p.id}/qr`} key={p.id} className="p-4 border rounded shadow hover:bg-gray-50 flex justify-between items-center cursor-pointer">
                            <div>
                                <span className="font-semibold block">{p.type}</span>
                                <span className="text-sm text-gray-500">{new Date(p.valid_from).toLocaleString()} - {new Date(p.valid_to).toLocaleString()}</span>
                            </div>
                            <Badge status={p.status} />
                            <QrCode size={24} className="text-blue-500 ml-4" />
                        </Link>
                    ) : (
                        <div key={p.id} className="p-4 border rounded bg-gray-50 flex justify-between items-center opacity-70">
                            <div>
                                <span className="font-semibold block">{p.type}</span>
                                <span className="text-sm text-gray-500">{new Date(p.valid_from).toLocaleString()} - {new Date(p.valid_to).toLocaleString()}</span>
                            </div>
                            <Badge status={p.status} />
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

const ApproverDashboard = ({ role, approvalSuffix }: { role: string, approvalSuffix: string }) => {
    const [passes, setPasses] = useState<any[]>([]);
    useEffect(() => { fetchApi('/passes').then(setPasses).catch(console.error); }, []);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        try {
            await fetchApi(`/passes/${id}/${action}-${approvalSuffix}`, { method: 'PUT' });
            setPasses(passes.filter(p => p.id !== id));
        } catch (e: any) { alert(e.message); }
    };

    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Pending Approvals</h3>
            <table className="w-full text-left border-collapse">
                <thead><tr className="bg-gray-100 border-b">
                    <th className="p-2">Applicant</th><th className="p-2">Type</th><th className="p-2">Dates</th><th className="p-2">Actions</th>
                </tr></thead>
                <tbody>
                    {passes.map(p => (
                        <tr key={p.id} className="border-b">
                            <td className="p-2">{p.applicant_name} <br /><span className="text-sm text-gray-500">{p.applicant_phone}</span></td>
                            <td className="p-2">{p.type}</td>
                            <td className="p-2 text-sm">{new Date(p.valid_from).toLocaleDateString()} - {new Date(p.valid_to).toLocaleDateString()}</td>
                            <td className="p-2 flex gap-2">
                                <button onClick={() => handleAction(p.id, 'approve')} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Approve</button>
                                <button onClick={() => handleAction(p.id, 'reject')} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Reject</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const GateSecurityDashboard = () => {
    const [qrJson, setQrJson] = useState('');
    const [rfidTag, setRfidTag] = useState('');
    const [scanResult, setScanResult] = useState<{ status: string, message?: string } | null>(null);

    const handleQRScan = async () => {
        try {
            const parsed = JSON.parse(qrJson);
            const res = await fetchApi('/gate/scan-qr', { method: 'POST', body: JSON.stringify(parsed) });
            setScanResult(res);
        } catch (e: any) { setScanResult({ status: 'DENIED', message: e.message || 'Invalid QR JSON' }); }
    };

    const handleRFIDScan = async () => {
        try {
            const res = await fetchApi('/gate/scan-rfid', { method: 'POST', body: JSON.stringify({ tag_id: rfidTag }) });
            setScanResult(res);
        } catch (e: any) { setScanResult({ status: 'DENIED', message: e.message }); }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div><ApproverDashboard role="GATE_SECURITY" approvalSuffix="security" /></div>
            <div className="space-y-6">
                <h3 className="text-xl font-bold">Scanners</h3>
                {scanResult && (
                    <div className={`p-4 text-white rounded font-bold ${scanResult.status === 'DENIED' ? 'bg-red-600' : 'bg-green-600'}`}>
                        {scanResult.status} {scanResult.message && `- ${scanResult.message}`}
                    </div>
                )}
                <div className="p-4 border rounded space-y-4">
                    <h4 className="font-semibold">QR Scanner</h4>
                    <textarea className="w-full border p-2 text-xs" rows={4} placeholder='{"pass_id": "...", "time": "...", "sig": "..."}' value={qrJson} onChange={e => setQrJson(e.target.value)} />
                    <button onClick={handleQRScan} className="w-full bg-blue-600 text-white py-2 rounded">Simulate QR Scan</button>
                </div>
                <div className="p-4 border rounded space-y-4">
                    <h4 className="font-semibold">RFID Scanner</h4>
                    <input className="w-full border p-2" placeholder="Tag ID" value={rfidTag} onChange={e => setRfidTag(e.target.value)} />
                    <button onClick={handleRFIDScan} className="w-full bg-purple-600 text-white py-2 rounded">Simulate RFID Scan</button>
                </div>
            </div>
        </div>
    );
};

const DashboardContainer = () => {
    const navigate = useNavigate();
    const token = getAuthToken();
    if (!token) return <Navigate to="/resident/login" />;
    const user = decodeJWT(token);

    const logout = () => { clearAuthToken(); navigate('/'); };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold flex items-center gap-2"><Shield /> Dashboard <span className="text-sm font-normal text-gray-500">| Role: {user?.role}</span></h1>
                <button onClick={logout} className="text-gray-600 flex items-center gap-1 hover:text-black"><LogOut size={18} /> Logout</button>
            </nav>
            <main className="p-6 max-w-6xl mx-auto">
                {user?.role === 'STUDENT' && <ResidentBaseDashboard role="STUDENT" />}
                {user?.role === 'FACULTY' && <ResidentBaseDashboard role="FACULTY" />}
                {user?.role === 'VISITOR' && <VisitorDashboard />}
                {user?.role === 'HOSTEL_SUPERINTENDENT' && <ApproverDashboard role="HOSTEL_SUPERINTENDENT" approvalSuffix="hostel" />}
                {user?.role === 'CONFERENCE_SUPERVISOR' && <ApproverDashboard role="CONFERENCE_SUPERVISOR" approvalSuffix="conference" />}
                {user?.role === 'ADMIN' && <ApproverDashboard role="ADMIN" approvalSuffix="admin" />}
                {user?.role === 'GATE_SECURITY' && <GateSecurityDashboard />}
            </main>
        </div>
    );
};

const SWDInterface = () => {
    const [activeTab, setActiveTab] = useState<'SINGLE' | 'BULK' | 'SEARCH'>('SINGLE');
    const [singleForm, setSingleForm] = useState({ studentEmail: '', name: '', phone: '', hashed_password: 'dummy-hashed-pw', type: 'STUDENT', valid_from: '', valid_until: '' });
    const [bulkForms, setBulkForms] = useState([{ email: '', name: '', phone: '', hashed_password: 'dummy-hashed-pw', type: 'STUDENT', valid_from: '', valid_until: '' }]);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [error, setError] = useState('');

    const submitSingle = async () => {
        try { await fetchApi('/swd/createPass', { method: 'POST', body: JSON.stringify(singleForm) }, true); alert('Created'); }
        catch (e: any) { setError(e.message); }
    };
    const submitBulk = async () => {
        try { await fetchApi('/swd/createBulkPasses', { method: 'POST', body: JSON.stringify({ students: bulkForms }) }, true); alert('Created Bulk'); }
        catch (e: any) { setError(e.message); }
    };
    const handleSearch = async () => {
        try { const data = await fetchApi(`/swd/getPass?studentEmail=${searchEmail}`, {}, true); setSearchResults(data); }
        catch (e: any) { setError(e.message); }
    };
    const handleDelete = async (id: string) => {
        try { await fetchApi(`/swd/deletePass/${id}`, { method: 'DELETE' }, true); handleSearch(); }
        catch (e: any) { setError(e.message); }
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded border-t-8 border-purple-600">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2"><Key /> SWD Admin Interface</h2>
            {error && <div className="p-3 bg-red-100 text-red-800 mb-4 rounded">{error}</div>}

            <div className="flex gap-4 mb-6 border-b pb-2">
                {['SINGLE', 'BULK', 'SEARCH'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab as any)} className={`font-semibold pb-1 ${activeTab === tab ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>{tab} PASS</button>
                ))}
            </div>

            {activeTab === 'SINGLE' && (
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Student Email" className="border p-2 rounded" onChange={e => setSingleForm({ ...singleForm, studentEmail: e.target.value })} />
                    <input placeholder="Name" className="border p-2 rounded" onChange={e => setSingleForm({ ...singleForm, name: e.target.value })} />
                    <input placeholder="Phone" className="border p-2 rounded" onChange={e => setSingleForm({ ...singleForm, phone: e.target.value })} />
                    <input type="datetime-local" className="border p-2 rounded" onChange={e => setSingleForm({ ...singleForm, valid_from: e.target.value })} />
                    <input type="datetime-local" className="border p-2 rounded" onChange={e => setSingleForm({ ...singleForm, valid_until: e.target.value })} />
                    <button onClick={submitSingle} className="col-span-2 bg-purple-600 text-white p-2 rounded mt-2">Create Pass</button>
                </div>
            )}

            {activeTab === 'BULK' && (
                <div className="space-y-4">
                    {bulkForms.map((f, i) => (
                        <div key={i} className="flex gap-2">
                            <input placeholder="Email" className="border p-2 w-1/5 text-sm" onChange={e => { const nv = [...bulkForms]; nv[i].email = e.target.value; setBulkForms(nv); }} />
                            <input placeholder="Name" className="border p-2 w-1/5 text-sm" onChange={e => { const nv = [...bulkForms]; nv[i].name = e.target.value; setBulkForms(nv); }} />
                            <input placeholder="Phone" className="border p-2 w-1/5 text-sm" onChange={e => { const nv = [...bulkForms]; nv[i].phone = e.target.value; setBulkForms(nv); }} />
                            <input type="datetime-local" className="border p-2 w-1/5 text-sm" onChange={e => { const nv = [...bulkForms]; nv[i].valid_from = e.target.value; setBulkForms(nv); }} />
                            <input type="datetime-local" className="border p-2 w-1/5 text-sm" onChange={e => { const nv = [...bulkForms]; nv[i].valid_until = e.target.value; setBulkForms(nv); }} />
                            <button onClick={() => setBulkForms(bulkForms.filter((_, idx) => idx !== i))}><Trash2 className="text-red-500 w-5" /></button>
                        </div>
                    ))}
                    <div className="flex gap-4 mt-4">
                        <button onClick={() => setBulkForms([...bulkForms, { email: '', name: '', phone: '', hashed_password: 'dummy-pw', type: 'STUDENT', valid_from: '', valid_until: '' }])} className="text-purple-600"> + Add Row</button>
                        <button onClick={submitBulk} className="bg-purple-600 text-white px-6 py-2 rounded">Submit Bulk</button>
                    </div>
                </div>
            )}

            {activeTab === 'SEARCH' && (
                <div>
                    <div className="flex gap-2 mb-6">
                        <input placeholder="Search by Student Email" className="border p-2 flex-1 rounded" value={searchEmail} onChange={e => setSearchEmail(e.target.value)} />
                        <button onClick={handleSearch} className="bg-purple-600 text-white px-4 rounded">Search</button>
                    </div>
                    <div className="space-y-2">
                        {searchResults.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-3 border rounded">
                                <div>
                                    <span className="font-bold">{p.type}</span> | {new Date(p.valid_from).toLocaleDateString()} - {new Date(p.valid_until || p.valid_to).toLocaleDateString()}
                                    <Badge status={p.status} />
                                </div>
                                <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- APP ROUTER ---
export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/resident/login" element={<ResidentLogin />} />
                <Route path="/resident/signup" element={<ResidentSignup />} />
                <Route path="/visitor" element={<VisitorFlow />} />
                <Route path="/dashboard" element={<DashboardContainer />} />
                <Route path="/pass/:pass_id/qr" element={<QRViewer />} />
                <Route path="/swd" element={<SWDInterface />} />
            </Routes>
        </BrowserRouter>
    );
}