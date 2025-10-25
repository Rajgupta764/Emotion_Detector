import React, { useEffect, useState } from 'react';
import { fetchSessions } from '../services/sessionService';
import EmotionBadge from '../components/Shared/EmotionBadge';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

const colors = ['#4caf50','#2196f3','#f44336','#9c27b0','#ff9800','#8bc34a','#9e9e9e'];

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const s = await fetchSessions();
        setSessions(s || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    load();
  }, []);

  const total = sessions.length;
  const most = sessions[0] ? sessions[0].results?.finalEmotion || '—' : '—';

  // compute distribution from sessions
  const distMap = {};
  sessions.forEach((s) => {
    const e = s.results?.finalEmotion || 'unknown';
    distMap[e] = (distMap[e] || 0) + 1;
  });
  const distData = Object.keys(distMap).length ? Object.keys(distMap).map((k) => ({ name: k, value: distMap[k] })) : [ { name: 'none', value: 1 } ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total sessions</Typography>
              <Typography variant="h5" sx={{ mt: 1 }}>{loading ? '...' : total}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Most detected emotion</Typography>
              <Box sx={{ mt: 1 }}>
                <EmotionBadge emotion={most} confidence={0.8} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Quick actions</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button variant="contained" size="small" href="/live">Start Live</Button>
                <Button variant="outlined" size="small" href="/sessions">All Sessions</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1">Emotion distribution</Typography>
              <Box sx={{ width: '100%', height: 220, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={70} paddingAngle={2}>
                      {distData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1">Recent sessions</Typography>
              <TableContainer component={Paper} sx={{ mt: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Session</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Final emotion</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessions.slice(0, 8).map((s) => (
                      <TableRow key={s._id} hover>
                        <TableCell>{s.sessionName || s._id}</TableCell>
                        <TableCell>{s.startTime ? new Date(s.startTime).toLocaleString() : '—'}</TableCell>
                        <TableCell>{s.duration ? `${Math.round(s.duration/1000)}s` : '—'}</TableCell>
                        <TableCell><EmotionBadge emotion={s.results?.finalEmotion} confidence={s.results?.confidence} /></TableCell>
                      </TableRow>
                    ))}
                    {sessions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">No sessions yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
