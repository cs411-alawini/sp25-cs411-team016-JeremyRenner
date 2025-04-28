import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, Container, CircularProgress, Button, AppBar, Toolbar, TextField, Autocomplete } from '@mui/material';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export default function UnitedStates() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState({ coordinates: [-98, 38], zoom: 1 });
  const [highlightedStates, setHighlightedStates] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [hoveredState, setHoveredState] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      fetch(geoUrl)
        .then(res => res.json())
        .then(data => {
          const states = Object.values(data.objects.states.geometries || []).map(g => g.properties.name || g.properties.NAME);
          setStateOptions(states.sort());
        });
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setHighlightedStates(selectedStates);
  }, [selectedStates]);

  const handleZoomIn = () => {
    if (position.zoom >= 8) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleMoveEnd = (position) => {
    setPosition(position);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', color: 'white', px: { xs: 2, md: 4 }, pt: '100px', gap: 4, position: 'relative', overflow: 'hidden' }}>
      <AppBar position="fixed" sx={{ background: '#0f2027', boxShadow: '0 2px 10px rgba(0,0,0,0.4)', zIndex: 10 }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#bbdefb', letterSpacing: '1px' }}>United States Disaster Map</Typography>
          <Button onClick={() => navigate('/')} variant="outlined" sx={{ color: '#bbdefb', borderColor: '#64b5f6' }}>Back to World Map</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        <Typography variant="h2" sx={{ fontWeight: 800, textAlign: 'center', mb: 4, background: 'linear-gradient(to right, #bbdefb, #82b1ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>U.S. Disaster Impact by State</Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Box sx={{ width: { xs: '90%', sm: '400px', md: '500px' } }}>
            <Autocomplete
              multiple
              options={stateOptions}
              value={selectedStates}
              onChange={(e, value) => setSelectedStates(value)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const tagProps = getTagProps({ index });
                  const { onDelete } = tagProps;
                  return (
                    <Box
                      component="span"
                      {...tagProps}
                      onDelete={undefined}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        borderRadius: '4px',
                        m: 0.5,
                        px: 1.5,
                        py: 0.75,
                        color: 'white',
                        fontSize: '0.875rem',
                      }}
                    >
                      {option}
                      <span
                        onClick={onDelete}
                        style={{
                          marginLeft: '8px',
                          color: '#adbdcc',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      >×</span>
                    </Box>
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Search for a state"
                  sx={{
                    input: { color: 'white' },
                    '& label': { color: 'white' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#90caf9' },
                      '&:hover fieldset': { borderColor: '#64b5f6' },
                      '&.Mui-focused fieldset': { borderColor: '#2196f3' },
                    },
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: 2,
                  }}
                />
              )}
            />
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 12 }}>
            <CircularProgress size={60} sx={{ color: '#82b1ff' }} />
          </Box>
        ) : (
          <Box sx={{ width: '100%', height: { xs: '50vh', md: '60vh' }, position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', background: 'rgba(8, 24, 40, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', p: { xs: 1, md: 2 } }}>
            <Box sx={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: 1, zIndex: 10 }}>
              <Button onClick={handleZoomIn} variant="contained" sx={zoomButtonStyle}>+</Button>
              <Button onClick={handleZoomOut} variant="contained" sx={zoomButtonStyle}>-</Button>
            </Box>

            <ComposableMap projection="geoAlbersUsa" width={1200} height={600} style={{ width: '100%', height: '100%' }}>
              <ZoomableGroup zoom={position.zoom} center={position.coordinates} onMoveEnd={handleMoveEnd} translateExtent={[[0, 0], [1200, 600]]}>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const stateName = geo.properties.name;
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onClick={() => navigate(`/state/${encodeURIComponent(stateName)}`)}
                          onMouseEnter={() => setHoveredState(stateName)}
                          onMouseLeave={() => setHoveredState(null)}
                          style={{
                            default: {
                              fill: highlightedStates.includes(stateName) ? '#ffee58' : '#74ccf4',
                              stroke: 'rgba(255,255,255,0.2)',
                              strokeWidth: 0.5,
                              outline: 'none',
                              transition: 'all 0.3s ease',
                              filter: highlightedStates.includes(stateName) ? 'drop-shadow(0 0 10px rgba(255, 235, 59, 0.9))' : 'none',
                            },
                            hover: {
                              fill: '#2196f3',
                              stroke: '#ffffff',
                              strokeWidth: 0.75,
                              cursor: 'pointer',
                              filter: 'drop-shadow(0 0 8px rgba(33, 150, 243, 0.8))',
                            },
                            pressed: {
                              fill: '#0d47a1',
                              stroke: '#ffffff',
                              strokeWidth: 1
                            }
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          </Box>
        )}
      </Container>
    </Box>
  );
}

const zoomButtonStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '4px',
  backgroundColor: 'rgba(255,255,255,0.15)',
  color: 'white',
  fontSize: '20px',
  fontWeight: 'bold',
  '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' }
};
