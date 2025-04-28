import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Table, TableHead, TableRow,
  TableCell, TableBody, Paper
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useAuth } from './AuthContext.js';
import UnitedStates from './UnitedStates';  // Import it

export default function CountryProfile() {
  const { countryName } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (countryName !== "United States of America") {
      fetch('http://127.0.0.1:5000/country_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ country: countryName })
      })
        .then(res => res.json())
        .then(json => {
          setData(json);
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to fetch country data:', error);
          setLoading(false);
        });
    }
  }, [countryName, token]);

  if (countryName === "United States of America") {
    return <UnitedStates />;
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  const { overview, sectoral, national, disasters, timeline } = data;

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', color: 'white', px: 4, py: 6 }}>
      <Typography variant="h2" sx={{ fontWeight: 800, textAlign: 'center', mb: 4 }}>
        {countryName} Overview
      </Typography>

      {/* Overview Panel */}
      <Box sx={{ mb: 5, background: '#ffffff10', p: 3, borderRadius: '12px' }}>
        <Typography variant="h6">Income Group: {overview?.IncomeGroup || 'N/A'}</Typography>
        <Typography variant="h6">Region: {overview?.Region || 'N/A'}</Typography>
        <Typography variant="h6">Country Code: {overview?.CountryCode || 'N/A'}</Typography>
      </Box>

      {/* Sectoral Growth Chart */}
      {sectoral && sectoral.length > 0 && (
        <>
          <Typography variant="h4" sx={{ mb: 2 }}>📈 Sectoral Economic Growth</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sectoral}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Year" />
              <YAxis />
              <ChartTooltip />
              <Legend />
              <Line type="monotone" dataKey="AgricultureAnnualPercentGrowth" stroke="#81c784" name="Agriculture" />
              <Line type="monotone" dataKey="IndustryAnnualPercentGrowth" stroke="#64b5f6" name="Industry" />
              <Line type="monotone" dataKey="ManufacturingAnnualPercentGrowth" stroke="#9575cd" name="Manufacturing" />
              <Line type="monotone" dataKey="ServiceAnnualPercentGrowth" stroke="#ffb74d" name="Service" />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}

      {/* National Metrics Chart */}
      {national && national.length > 0 && (
        <>
          <Typography variant="h4" sx={{ mt: 6, mb: 2 }}>📊 National Economic Metrics</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={national}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Year" />
              <YAxis />
              <ChartTooltip />
              <Legend />
              <Line type="monotone" dataKey="GDPAnnualPercentGrowth" stroke="#42a5f5" name="GDP Growth" />
              <Line type="monotone" dataKey="CPI_2010_100" stroke="#ab47bc" name="CPI (2010=100)" />
              <Line type="monotone" dataKey="UnemploymentPercent" stroke="#ef5350" name="Unemployment %" />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}

      {/* Disaster Frequency Line Chart */}
      {timeline && timeline.length > 0 && (
        <>
          <Typography variant="h4" sx={{ mt: 6, mb: 2 }}>📈 Disaster Frequency Over Time</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Year" />
              <YAxis />
              <ChartTooltip />
              <Legend />
              <Line type="monotone" dataKey="Earthquake" stroke="#ef5350" name="Earthquake" />
              <Line type="monotone" dataKey="Tsunami" stroke="#42a5f5" name="Tsunami" />
              <Line type="monotone" dataKey="Volcano" stroke="#ab47bc" name="Volcano" />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}

      {/* Disasters Table */}
      {disasters && disasters.length > 0 && (
        <>
          <Typography variant="h4" sx={{ mt: 6, mb: 2 }}>🌪️ Disaster History</Typography>
          <Paper sx={{ width: '100%', overflow: 'auto', backgroundColor: '#ffffff10' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'white' }}>Type</TableCell>
                  <TableCell sx={{ color: 'white' }}>Year</TableCell>
                  <TableCell sx={{ color: 'white' }}>Intensity</TableCell>
                  <TableCell sx={{ color: 'white' }}>Total Damage</TableCell>
                  <TableCell sx={{ color: 'white' }}>Deaths</TableCell>
                  <TableCell sx={{ color: 'white' }}>Injuries</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {disasters.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ color: 'white' }}>{row.Type}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{row.Year}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{row.Intensity}</TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      {row.TotalDamage != null ? `${row.TotalDamage} (x${row.TotalDamageScale})` : 'N/A'}
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>{row.Deaths ?? 'N/A'}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{row.Injuries ?? 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
    </Box>
  );
}
