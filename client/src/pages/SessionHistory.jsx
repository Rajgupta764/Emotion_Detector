import React, { useEffect, useState } from 'react';
import { fetchSessions, deleteSession } from '../services/sessionService';
import { useNavigate } from 'react-router-dom';

const SessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    load();
    async function load() {
      try {
        const s = await fetchSessions();
        setSessions(s || []);
      } catch (err) { console.error(err); }
    }
  }, []);

  const handleView = (id) => navigate(`/sessions/${id}`);
  const handleDelete = async (id) => {
    if (!confirm('Delete session?')) return;
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((p) => p._id !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <h3>Session History</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Emotion</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(s => (
            <tr key={s._id}>
              <td>{s.sessionName || s._id}</td>
              <td>{new Date(s.startTime).toLocaleString()}</td>
              <td>{s.results?.finalEmotion || '—'}</td>
              <td>
                <button onClick={() => handleView(s._id)}>View</button>
                <button onClick={() => handleDelete(s._id)} style={{ marginLeft: 8 }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SessionHistory;
