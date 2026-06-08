import { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { StatusBadge } from '../../components/Badge';
import { Link } from 'react-router-dom';

export function FacultyDashboard() {
  const [passes, setPasses] = useState<any[]>([]);
  const [outpassUntil, setOutpassUntil] = useState('');
  const [rfidId, setRfidId] = useState('');
  const [vehicleNum, setVehicleNum] = useState('');
  const [rfidMessage, setRfidMessage] = useState('');
  const [regularInvites, setRegularInvites] = useState([{ name: '', phone: '' }]);
  const [confInvites, setConfInvites] = useState([{ name: '', phone: '', valid_until: '' }]);
  const [error, setError] = useState('');

  const fetchPasses = async () => {
    const data = await apiFetch('/api/resident/passes');
    setPasses(data || []);
  };
  useEffect(() => { fetchPasses(); }, []);

  const handleApplyRFID = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await apiFetch(`/api/resident/applyRFID/${vehicleNum}`, { method: 'PUT' });
      setRfidMessage(data.message || 'RFID application submitted');
      setVehicleNum('');
    } catch (err: any) { setError(err.message); }
  };

  const handleOutpass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/resident/createPass', {
        method: 'POST',
        body: JSON.stringify({
          type: 'FACULTY',
          valid_from: new Date().toISOString(),
          valid_until: new Date(outpassUntil).toISOString(),
          rfid_id: rfidId || undefined
        })
      });
      fetchPasses(); setError('');
    } catch (err: any) { setError(err.message); }
  };

  const handleRegularInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid_from = new Date().toISOString();
    const valid_until = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
    try {
      await apiFetch('/api/resident/visitorPass', {
        method: 'POST',
        body: JSON.stringify({
          passes: regularInvites.map(inv => ({ ...inv, type: 'INVITED_VISITOR', valid_from, valid_until }))
        })
      });
      setRegularInvites([{ name: '', phone: '' }]); setError(''); alert("Regular invites sent!");
    } catch (err: any) { setError(err.message); }
  };

  const handleConfInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid_from = new Date().toISOString();
    try {
      await apiFetch('/api/resident/visitorPass', {
        method: 'POST',
        body: JSON.stringify({
          passes: confInvites.map(inv => ({
            name: inv.name, phone: inv.phone, type: 'CONFERENCE_PARTICIPANT',
            valid_from, valid_until: new Date(inv.valid_until).toISOString()
          }))
        })
      });
      setConfInvites([{ name: '', phone: '', valid_until: '' }]); setError(''); alert("Conference invites sent!");
    } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="space-y-8">
      {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

      <section className="bg-white p-4 shadow rounded">
        <h2 className="text-xl font-bold mb-2">My Passes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border">
            <thead className="bg-gray-100 border-b"><tr><th>Type</th><th>Status</th><th>From</th><th>Until</th><th>Action</th></tr></thead>
            <tbody>
              {passes.map((p, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2">{p.type}</td><td className="p-2"><StatusBadge status={p.status} /></td>
                  <td className="p-2">{new Date(p.valid_from).toLocaleString()}</td>
                  <td className="p-2">{new Date(p.valid_until).toLocaleString()}</td>
                  <td className="p-2">
                    {p.status === 'APPROVED' && <Link to={`/qr/${p.id || p.pass_id}?source=resident`} className="text-blue-500 underline">View QR</Link>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white p-4 shadow rounded">
          <h2 className="text-xl font-bold mb-4">Register Vehicle RFID</h2>
          <form onSubmit={handleApplyRFID} className="flex gap-2">
            <input placeholder="Vehicle Number" required className="border p-2 flex-1 rounded" value={vehicleNum} onChange={e => setVehicleNum(e.target.value)} />
            <button className="bg-purple-600 text-white px-4 py-2 rounded">Register</button>
          </form>
          {rfidMessage && <p className="text-green-600 text-sm mt-2">{rfidMessage}</p>}
        </section>

        <section className="bg-white p-4 shadow rounded">
          <h2 className="text-xl font-bold mb-4">Apply Faculty Outpass</h2>
          <form onSubmit={handleOutpass} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600">Valid Until</label>
              <input type="datetime-local" required className="border p-2 w-full rounded" onChange={e => setOutpassUntil(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600">RFID Tag ID (optional)</label>
              <input type="text" placeholder="Enter tag ID" className="border p-2 w-full rounded" onChange={e => setRfidId(e.target.value)} />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">Apply Outpass</button>
          </form>
        </section>
      </div>

      <section className="bg-white p-4 shadow rounded">
        <h2 className="text-xl font-bold mb-4">Invite Regular Visitors (End of Day)</h2>
        <form onSubmit={handleRegularInvite} className="space-y-2">
          {regularInvites.map((inv, i) => (
            <div key={i} className="flex gap-2">
              <input placeholder="Name" required className="border p-2 flex-1 rounded" value={inv.name} onChange={e => { const newInv = [...regularInvites]; newInv[i].name = e.target.value; setRegularInvites(newInv); }} />
              <input placeholder="Phone" required className="border p-2 flex-1 rounded" value={inv.phone} onChange={e => { const newInv = [...regularInvites]; newInv[i].phone = e.target.value; setRegularInvites(newInv); }} />
              {i > 0 && <button type="button" onClick={() => setRegularInvites(regularInvites.filter((_, idx) => idx !== i))} className="text-red-500 font-bold px-2">X</button>}
            </div>
          ))}
          <button type="button" onClick={() => setRegularInvites([...regularInvites, { name: '', phone: '' }])} className="text-sm bg-gray-200 px-3 py-1 rounded">+ Add Row</button>
          <div className="pt-2"><button className="bg-green-600 text-white px-6 py-2 rounded">Send Regular Invites</button></div>
        </form>
      </section>

      <section className="bg-white p-4 shadow rounded">
        <h2 className="text-xl font-bold mb-4">Invite Conference Participants</h2>
        <form onSubmit={handleConfInvite} className="space-y-2">
          {confInvites.map((inv, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input placeholder="Name" required className="border p-2 flex-1 rounded" value={inv.name} onChange={e => { const newInv = [...confInvites]; newInv[i].name = e.target.value; setConfInvites(newInv); }} />
              <input placeholder="Phone" required className="border p-2 flex-1 rounded" value={inv.phone} onChange={e => { const newInv = [...confInvites]; newInv[i].phone = e.target.value; setConfInvites(newInv); }} />
              <input type="datetime-local" required className="border p-2 flex-1 rounded" value={inv.valid_until} onChange={e => { const newInv = [...confInvites]; newInv[i].valid_until = e.target.value; setConfInvites(newInv); }} />
              {i > 0 && <button type="button" onClick={() => setConfInvites(confInvites.filter((_, idx) => idx !== i))} className="text-red-500 font-bold px-2">X</button>}
            </div>
          ))}
          <button type="button" onClick={() => setConfInvites([...confInvites, { name: '', phone: '', valid_until: '' }])} className="text-sm bg-gray-200 px-3 py-1 rounded">+ Add Row</button>
          <div className="pt-2"><button className="bg-indigo-600 text-white px-6 py-2 rounded">Send Conference Invites</button></div>
        </form>
      </section>
    </div>
  );
}