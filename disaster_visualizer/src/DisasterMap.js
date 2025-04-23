import React, { useState, useEffect } from 'react';
import { Typography, Box, Tooltip, Container, CircularProgress, Button, AppBar, Toolbar } from '@mui/material';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { useNavigate } from 'react-router-dom';
import { TextField, Autocomplete } from '@mui/material';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function DisasterMap() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1 });
  const [highlightedCountry, setHighlightedCountry] = useState(null);
  const [countryOptions, setCountryOptions] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      fetch(geoUrl)
        .then(res => res.json())
        .then(data => {
          const countries = data.objects.countries.geometries.map(g => g.properties.name || g.properties.NAME);
          setCountryOptions(countries.sort());
        });
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleCountryClick = (country) => {
    navigate(`/country/${encodeURIComponent(country)}`);
  };

  const handleCompareClick = () => {
    navigate(`/compare`);
  };

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleMoveEnd = (position) => {
    setPosition(position);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/auth');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: { xs: 2, md: 4 },
        pt: '100px',
        gap: 4,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Navbar */}
      <AppBar
        position="fixed"
        sx={{
          background: '#0f2027', // solid dark color
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
          zIndex: 10,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 4 }}>
          {/* Left: Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#bbdefb',
              letterSpacing: '1px',
              userSelect: 'none',
            }}
          >
            Jeremy Renner
          </Typography>

          {/* Right: Navigation Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={() => navigate('/compare')} variant="outlined" sx={{ color: '#bbdefb', borderColor: '#64b5f6' }}>
              Compare
            </Button>
            <Button onClick={() => navigate('/saved')} variant="outlined" sx={{ color: '#bbdefb', borderColor: '#64b5f6' }}>
              Saved Graphs
            </Button>
            <Button onClick={() => navigate('/global')} variant="outlined" sx={{ color: '#bbdefb', borderColor: '#64b5f6' }}>
              Global Stats
            </Button>
            <Button onClick={handleLogout} variant="outlined" sx={{ color: '#ef9a9a', borderColor: '#ef9a9a' }}>
              Sign Out
            </Button>
          </Box>
        </Toolbar>
      </AppBar>


      {/* Animated background elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '5%',
          left: '45%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(64,164,244,0.1) 0%, transparent 70%)',
          animation: 'float 20s infinite alternate ease-in-out'
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(66,165,245,0.08) 0%, transparent 70%)',
          animation: 'float 15s infinite alternate-reverse ease-in-out'
        },
        '@keyframes float': {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(40px, 20px)' }
        }
      }} />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>

        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(to right, #bbdefb, #82b1ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            letterSpacing: '1px',
            fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
            mb: 1,
            textShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
            animation: 'fadeIn 1.5s ease-out',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(-10px)' },
              to: { opacity: 1, transform: 'translateY(0)' }
            }
          }}
        >
          Global Disaster Impact
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: '#e3f2fd',
            textAlign: 'center',
            maxWidth: '800px',
            fontWeight: 300,
            fontSize: { xs: '1rem', sm: '1.1rem' },
            lineHeight: 1.8,
            mx: 'auto',
            mb: 4,
            opacity: 0.9,
            animation: 'fadeIn 1.5s ease-out 0.3s both',
          }}
        >
          Explore disaster statistics and their impact on global development and economic stability.
          Click on any country to view detailed information and historical trends.
        </Typography>
        <Box sx={{ mb: 4, zIndex: 3, width: '100%', maxWidth: '500px', mx: 'auto' }}>
            <Autocomplete
                freeSolo
                options={countryOptions}
                onChange={(event, value) => setHighlightedCountry(value)}
                renderInput={(params) => (
                <TextField
                    {...params}
                    label="Search for a country"
                    variant="outlined"
                    sx={{
                    input: { color: 'white' },
                    '& label': { color: 'white' },
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                        borderColor: '#90caf9',
                        },
                        '&:hover fieldset': {
                        borderColor: '#64b5f6',
                        },
                        '&.Mui-focused fieldset': {
                        borderColor: '#2196f3',
                        },
                    },
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                    }}
                />
                )}
            />
            </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 12 }}>
            <CircularProgress size={60} sx={{ color: '#82b1ff' }} />
          </Box>
        ) : (
          <Box
            sx={{
              width: '100%',
              height: { xs: '50vh', md: '60vh' },
              maxHeight: '700px',
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              background: 'rgba(8, 24, 40, 0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              p: { xs: 1, md: 2 },
              animation: 'scaleIn 1s ease-out 0.6s both',
              '@keyframes scaleIn': {
                from: { opacity: 0, transform: 'scale(0.95)' },
                to: { opacity: 1, transform: 'scale(1)' }
              }
            }}
          >
            {/* Zoom controls */}
            <Box sx={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}>
              <Box
                onClick={handleZoomIn}
                sx={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(4px)',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.25)',
                  }
                }}
              >
                +
              </Box>
              <Box
                onClick={handleZoomOut}
                sx={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(4px)',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.25)',
                  }
                }}
              >
                -
              </Box>
            </Box>
            
            <ComposableMap
              projectionConfig={{ scale: 160 }}
              width={1200}
              height={600}
              style={{ width: '100%', height: '100%' }}
            >
              <ZoomableGroup
                zoom={position.zoom}
                center={position.coordinates}
                onMoveEnd={handleMoveEnd}
                translateExtent={[
                  [0, 0],
                  [1200, 600]
                ]}
              >
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const country = geo.properties.NAME || geo.properties.name;
                      
                      return (
                        <Tooltip 
                          key={geo.rsmKey} 
                          title={
                            <Typography sx={{ p: 1, fontSize: '0.9rem' }}>
                              {country}
                            </Typography>
                          } 
                          arrow
                        >
                          <Geography
                            geography={geo}
                            onClick={() => handleCountryClick(country)}
                            style={{
                                default: {
                                    fill: highlightedCountry === country ? '#ffee58' : '#74ccf4',
                                    stroke: 'rgba(255,255,255,0.2)',
                                    strokeWidth: 0.5,
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                    filter: highlightedCountry === country ? 'drop-shadow(0 0 10px rgba(255, 235, 59, 0.9))' : 'none',
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
                                strokeWidth: 1,
                              }
                            }}
                          />
                        </Tooltip>
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          </Box>
        )}

        <Box sx={{ 
          mt: 4, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'center', 
          gap: 3,
          animation: 'fadeIn 1.5s ease-out 0.9s both'
        }}>
          <Box sx={{ 
            p: 3, 
            borderRadius: '12px', 
            background: 'rgba(13, 71, 161, 0.2)', 
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(144, 202, 249, 0.3)',
            textAlign: 'center',
            flex: '1',
            maxWidth: '280px',
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <Typography variant="h4" sx={{ fontSize: '2rem', color: '#82b1ff', mb: 2 }}>
              5000+
            </Typography>
            <Typography sx={{ color: '#e3f2fd', fontWeight: 300 }}>
              Disasters tracked globally with real-time impact analysis
            </Typography>
          </Box>

          <Box sx={{ 
            p: 3, 
            borderRadius: '12px', 
            background: 'rgba(13, 71, 161, 0.2)', 
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(144, 202, 249, 0.3)',
            textAlign: 'center',
            flex: '1',
            maxWidth: '280px',
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <Typography variant="h4" sx={{ fontSize: '2rem', color: '#82b1ff', mb: 2 }}>
              192
            </Typography>
            <Typography sx={{ color: '#e3f2fd', fontWeight: 300 }}>
              Countries with comprehensive disaster recovery metrics
            </Typography>
          </Box>

          <Box sx={{ 
            p: 3, 
            borderRadius: '12px', 
            background: 'rgba(13, 71, 161, 0.2)', 
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(144, 202, 249, 0.3)',
            textAlign: 'center',
            flex: '1',
            maxWidth: '280px',
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <Typography variant="h4" sx={{ fontSize: '2rem', color: '#82b1ff', mb: 2 }}>
              50 Years
            </Typography>
            <Typography sx={{ color: '#e3f2fd', fontWeight: 300 }}>
              Of historical disaster data to analyze patterns and trends
            </Typography>
            
          </Box>
          <Box sx={{ 
            p: 3,
            borderRadius: '12px', 
            background: 'rgba(13, 71, 161, 0.2)', 
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(144, 202, 249, 0.3)',
            textAlign: 'center',
            flex: '1',
            maxWidth: '280px',
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-5px)' }
            
          }}
          onClick= {handleCompareClick}
          >
            <Typography variant="h4" sx={{ fontSize: '2rem', color: '#82b1ff', mb: 2 }}>
              Compare Countries
            </Typography>
            <Typography sx={{ color: '#e3f2fd', fontWeight: 300 }}>
              View Distaster and Economic data between the countries
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}