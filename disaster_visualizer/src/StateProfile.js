import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Button, Tabs, Tab, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function StateProfile() {
  const { stateName } = useParams();
  const navigate = useNavigate();
  const [stateData, setStateData] = useState(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/state_data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: decodeURIComponent(stateName) })
    })
    .then(res => res.json())
    .then(data => setStateData(data))
    .catch(err => console.error(err));
  }, [stateName]);

  if (!stateData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', color: 'white' }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  const disasterTimeline = {};
  if (stateData.disasters) {
    stateData.disasters.forEach(({ Year, DisasterType }) => {
      if (!disasterTimeline[Year]) {
        disasterTimeline[Year] = { Year, Tornado: 0, Flood: 0, Fire: 0, "Severe Storm": 0, Hurricane: 0, Snowstorm: 0, "Severe Ice Storm": 0, Drought: 0, Biological: 0 };
      }
      if (disasterTimeline[Year][DisasterType] !== undefined) {
        disasterTimeline[Year][DisasterType]++;
      }
    });
  }
  const disasterTimelineData = Object.values(disasterTimeline).sort((a, b) => a.Year - b.Year);

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', color: 'white', p: 4 }}>
      <Button variant="outlined" sx={{ mb: 2, borderColor: '#90caf9', color: '#90caf9' }} onClick={() => navigate('/country/United%20States%20of%20America')}>Back to United States Map</Button>
      <Container maxWidth="xl">
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>{stateData.overview.StateName} ({stateData.overview.StateCode})</Typography>
        <Typography variant="h6" sx={{ mb: 4, color: '#bbdefb' }}>{stateData.overview.Region}</Typography>

        <Tabs value={tab} onChange={(e, newVal) => setTab(newVal)} centered sx={{ mb: 4 }}>
          <Tab label="Economic Growth" />
          <Tab label="Economic Totals" />
          <Tab label="Disaster Timeline" />
          <Tab label="Disaster Details" />
        </Tabs>

        {tab === 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={stateData.economicGrowth} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Year" stroke="white" />
              <YAxis stroke="white" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="AgriculturePercentGrowth" stroke="#82ca9d" name="Agriculture Growth" />
              <Line type="monotone" dataKey="ManufacturingPercentGrowth" stroke="#8884d8" name="Manufacturing Growth" />
              <Line type="monotone" dataKey="RealEstatePercentGrowth" stroke="#ffc658" name="Real Estate Growth" />
            </LineChart>
          </ResponsiveContainer>
        )}

        {tab === 1 && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={stateData.economicTotals} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Year" stroke="white" />
              <YAxis stroke="white" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="GDPGrowth" stroke="#82ca9d" name="GDP Growth (%)" />
              <Line type="monotone" dataKey="PersonalIncomeGrowth" stroke="#8884d8" name="Personal Income Growth (%)" />
            </LineChart>
          </ResponsiveContainer>
        )}

        {tab === 2 && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={disasterTimelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Year" stroke="white" />
              <YAxis stroke="white" />
              <Tooltip />
              <Legend />
              <Bar dataKey="Tornado" stackId="a" fill="#82ca9d" />
              <Bar dataKey="Flood" stackId="a" fill="#8884d8" />
              <Bar dataKey="Fire" stackId="a" fill="#ffc658" />
              <Bar dataKey="Severe Storm" stackId="a" fill="#ff7f50" />
              <Bar dataKey="Snowstorm" stackId="a" fill="#00c49f" />
              <Bar dataKey="Severe Ice Storm" stackId="a" fill="#a4de6c" />
              <Bar dataKey="Drought" stackId="a" fill="#d0ed57" />
              <Bar dataKey="Biological" stackId="a" fill="#888888" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {tab === 3 && (
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'white' }}>Year</TableCell>
                  <TableCell sx={{ color: 'white' }}>Disaster Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stateData.disasters.map((disaster, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ color: 'white' }}>{disaster.Year}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{disaster.DisasterType}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

      </Container>
    </Box>
  );
}
