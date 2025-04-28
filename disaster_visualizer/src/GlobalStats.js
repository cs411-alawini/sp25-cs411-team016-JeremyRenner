import React, { useState, useEffect } from 'react';
import { Typography, Box, Container, CircularProgress, Button, AppBar, Toolbar, TextField, Autocomplete } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import SaveGraphButton from './SaveGraphButton'; // Import SaveGraphButton

export default function GlobalStats() {
  const navigate = useNavigate();
  const location = useLocation();

  // Load filters from location state
  const filters = location.state?.filters || {};

  // Set filter states
  const [startYear, setStartYear] = useState(filters.startYear || '');
  const [endYear, setEndYear] = useState(filters.endYear || '');
  const [selectedDisasters, setSelectedDisasters] = useState(filters.selectedDisasters || []);
  const [selectedIndicators, setSelectedIndicators] = useState(filters.selectedIndicators || []);
  const [aggregationType, setAggregationType] = useState(filters.aggregationType || 'Disaster Types');
  const [sortOption, setSortOption] = useState(filters.sortOption || 'Year (Ascending)');
  const [statsData, setStatsData] = useState([]);
  const [loading, setLoading] = useState(false);

  const disasterOptions = ['Earthquake', 'Tsunami', 'Volcano'];
  const indicatorOptions = [
    "AvgGDP",
    "AvgCPI",
    "AvgExportGrowth",
    "AvgImportGrowth",
    "AvgUnemployment",
    "AvgAgrictultureGrowth",
    "AvgIndustryGrowth",
    "AvgManufacturingGrowth",
    "AvgServiceGrowth"
  ].filter(Boolean);

  const textInputStyle = {
    input: { color: 'white' },
    '& label': { color: 'white' },
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#90caf9' },
      '&:hover fieldset': { borderColor: '#64b5f6' },
      '&.Mui-focused fieldset': { borderColor: '#2196f3' },
    },
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 2,
    '& input::-webkit-clear-button, & input::-webkit-search-cancel-button': { display: 'none' }
  };

  const commonAutocompleteProps = {
    disableClearable: true,
    ListboxProps: {
      sx: {
        '& li[aria-label="Clear"]': { display: 'none' }
      }
    }
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    const payload = {
      startYear,
      endYear,
      disasterTypes: selectedDisasters,
      indicators: selectedIndicators,
      aggregateBy: aggregationType,
      sortOption
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/global_stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      setStatsData(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', pt: '50px', pb:'40px', px: 2 }}>
      <AppBar position="fixed" sx={{ background: '#0f2027', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)', zIndex: 10 }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#bbdefb', letterSpacing: '1px', userSelect: 'none' }}>Jeremy Renner</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={() => navigate('/')} variant="outlined" sx={{ color: '#bbdefb', borderColor: '#64b5f6' }}>Home</Button>
            <Button onClick={() => navigate('/compare')} variant="outlined" sx={{ color: '#bbdefb', borderColor: '#64b5f6' }}>Compare</Button>
            <Button onClick={() => navigate('/saved')} variant="outlined" sx={{ color: '#bbdefb', borderColor: '#64b5f6' }}>Saved Graphs</Button>
            <Button onClick={() => navigate('/global')} variant="outlined" sx={{ color: '#bbdefb', borderColor: '#64b5f6' }}>Global Stats</Button>
            <Button onClick={() => { localStorage.removeItem('token'); navigate('/auth'); }} variant="outlined" sx={{ color: '#ef9a9a', borderColor: '#ef9a9a' }}>Sign Out</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 8 }}>
        <Typography variant="h2" sx={{ fontWeight: 800, background: 'linear-gradient(to right, #bbdefb, #82b1ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center', letterSpacing: '1px', fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' }, mb: 4 }}>
          Global Statistics
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mb: 4, maxWidth: '1200px', mx: 'auto' }}>
          <TextField label="Start Year" variant="outlined" type="number" value={startYear} onChange={(e) => setStartYear(e.target.value)} sx={textInputStyle} />
          <TextField label="End Year" variant="outlined" type="number" value={endYear} onChange={(e) => setEndYear(e.target.value)} sx={textInputStyle} />
          <Autocomplete {...commonAutocompleteProps} multiple options={disasterOptions} value={selectedDisasters} onChange={(e, value) => setSelectedDisasters(value)} renderInput={(params) => (<TextField {...params} variant="outlined" label="Disaster Types" sx={textInputStyle} />)} sx={{ minWidth: 240 }} filterOptions={(options) => options.filter(opt => opt !== '')}/>
          <Autocomplete {...commonAutocompleteProps} multiple options={indicatorOptions} value={selectedIndicators} onChange={(e, value) => setSelectedIndicators(value)} renderInput={(params) => (<TextField {...params} variant="outlined" label="Economic Indicators" sx={textInputStyle} />)} sx={{ minWidth: 320 }} filterOptions={(options) => options.filter(opt => opt !== '')}/>
          <Autocomplete {...commonAutocompleteProps} options={['Individual Disasters', 'Disaster Types']} value={aggregationType} onChange={(e, value) => setAggregationType(value)} renderInput={(params) => (<TextField {...params} variant="outlined" label="Aggregate By" sx={textInputStyle} />)} sx={{ minWidth: 240 }} filterOptions={(options) => options.filter(opt => opt !== '')}/>
          <Autocomplete {...commonAutocompleteProps} options={['Year (Ascending)', 'Year (Descending)', 'Indicator (Ascending)', 'Indicator (Descending)']} value={sortOption} onChange={(e, value) => setSortOption(value)} renderInput={(params) => (<TextField {...params} variant="outlined" label="Sort By" sx={textInputStyle} />)} sx={{ minWidth: 240 }} filterOptions={(options) => options.filter(opt => opt !== '')}/>
          <Button onClick={handleApplyFilters} variant="contained" sx={{ backgroundColor: '#64b5f6', color: '#0d1b2a', fontWeight: 600, height: '56px', '&:hover': { backgroundColor: '#42a5f5' } }}>Apply Filters</Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          {/* Add SaveGraphButton here */}
          <SaveGraphButton
            graphTitle="Global Disaster Stats"
            filters={{
              startYear,
              endYear,
              selectedDisasters,
              selectedIndicators,
              aggregationType,
              sortOption
            }}
            page="Global Stats"
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress size={60} sx={{ color: '#82b1ff' }} />
          </Box>
        ) : (
          <Box sx={{ mt: 4 }}>
            {statsData.length > 0 ? statsData.map((row, idx) => (
              <Box key={idx} sx={{ backgroundColor: 'rgba(255,255,255,0.05)', p: 2, borderRadius: 2, mb: 2 }}>
                {Object.entries(row).map(([k, v]) => (
                  <Typography key={k} sx={{ color: '#bbdefb', fontSize: '1rem' }}>{k}: {v}</Typography>
                ))}
              </Box>
            )) : (
              <Typography variant="h5" sx={{ textAlign: 'center', color: '#bbdefb' }}>
                Filtered Results will display here.
              </Typography>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
