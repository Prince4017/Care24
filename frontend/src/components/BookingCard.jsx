import { useState } from 'react';
import { API_URL } from '../config.js';

const ACTIONS = {
  pending: [
    { status: 'accepted', label: 'Accept' },
    { status: 'cancelled', label: 'Decline' }
  ],
  accepted: [
    { status: 'in-progress', label: 'Start visit' },
    { status: 'cancelled', label: 'Cancel' }
  ],
  'in-progress': [{ status: 'completed', label: 'Mark completed' }]
};

function BookingCard({ booking, token, canManage, onUpdate }) {
  const [notes, setNotes] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [busy, setBusy] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  async function updateStatus(status) {
    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/bookings/${booking._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) onUpdate();
    } finally {
      setBusy(false);
    }
  }

  async function loadNotes() {
    const res = await fetch(`${API_URL}/bookings/${booking._id}/notes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setNotes(await res.json());
    setShowNotes(true);
  }

  async function addNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/bookings/${booking._id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ note: noteText })
      });
      if (res.ok) {
        setNoteText('');
        loadNotes();
      }
    } finally {
      setBusy(false);
    }
  }

  const options = ACTIONS[booking.status] || [];

  return (
    <div className="list-card booking-card">
      <h3>{booking.service?.name}</h3>
      <p>
        For {booking.patient?.name}
        {booking.caregiver?.user?.name ? <> with {booking.caregiver.user.name}</> : null}
      </p>
      <span className={`badge badge-${booking.status}`}>{booking.status}</span>

      {canManage && options.length > 0 && (
        <div className="booking-actions">
          {options.map((opt) => (
            <button key={opt.status} onClick={() => updateStatus(opt.status)} disabled={busy} className="tiny-btn">
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <button type="button" className="link-btn small-link" onClick={() => (showNotes ? setShowNotes(false) : loadNotes())}>
        {showNotes ? 'Hide updates' : 'View updates'}
      </button>

      {showNotes && (
        <div className="notes-panel">
          {(!notes || notes.length === 0) && <p className="muted">No care notes yet.</p>}
          {notes &&
            notes.map((n) => (
              <div key={n._id} className="note-item">
                <p>{n.note}</p>
                <small>
                  {n.addedBy?.name} &middot; {new Date(n.createdAt).toLocaleString()}
                </small>
              </div>
            ))}
          {canManage && booking.status === 'in-progress' && (
            <form onSubmit={addNote} className="inline-form">
              <input placeholder="Add a care note…" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
              <button type="submit" disabled={busy}>Add</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default BookingCard;
