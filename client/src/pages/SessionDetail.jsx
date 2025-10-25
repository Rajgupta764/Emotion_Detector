import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSession } from '../services/sessionService';

const SessionDetail = () => {
  const { id } = useParams();
  const [session, setSession] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const s = await fetchSession(id);
        setSession(s);
      } catch (err) { console.error(err); }
    }
    load();
  }, [id]);

  if (!session) return <div>Loading...</div>;

  return (
    <div>
      <h3>Session Detail</h3>
      <p><strong>Name:</strong> {session.sessionName}</p>
      <p><strong>Start:</strong> {new Date(session.startTime).toLocaleString()}</p>
      <p><strong>End:</strong> {session.endTime ? new Date(session.endTime).toLocaleString() : '—'}</p>
      <p><strong>Duration (ms):</strong> {session.duration || '—'}</p>
      <h4>Final Result</h4>
      <pre>{JSON.stringify(session.results, null, 2)}</pre>
    </div>
  );
};

export default SessionDetail;
