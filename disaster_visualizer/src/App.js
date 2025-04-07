// Required dependencies:
// npm install react-simple-maps @mui/material @emotion/react @emotion/styled axios

import React, { useState } from 'react';
import axios from 'axios';
import { Slider, Typography, Box, Paper, Tooltip, Container } from '@mui/material';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function DisasterMap() {
  const [year, setYear] = useState(1960);
  const [tooltipContent, setTooltipContent] = useState("");

  const handleHover = async (country) => {
    try {
      const response = await axios.post("http://localhost:5000/deaths", {
        country,
        year
      });
      const data = response.data;
      const content = `${country} —\nEarthquake: ${data.Earthquake || 0}\nTsunami: ${data.Tsunami || 0}\nVolcano: ${data.Volcano || 0}`;
      setTooltipContent(content);
    } catch (err) {
      console.error("Error fetching disaster data:", err);
      setTooltipContent(`${country} — Error fetching data`);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to right, #e0f7fa, #e3f2fd)', padding: '2rem' }}>
      <Container maxWidth="md">
        <Paper elevation={6} sx={{ padding: '2rem', borderRadius: '1rem' }}>
          <Typography variant="h3" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            Disaster Impact Visualizer
          </Typography>

          <Typography variant="h6" align="center" color="textSecondary" sx={{ marginBottom: '1.5rem' }}>
            Hover over a country to view disaster-related deaths by type
          </Typography>

          <Box sx={{ width: '90%', margin: '2rem auto' }}>
            <Slider
              value={year}
              onChange={(e, newYear) => setYear(newYear)}
              min={1960}
              max={2025}
              step={1}
              marks
              valueLabelDisplay="on"
              sx={{
                color: '#1976d2',
                '& .MuiSlider-thumb': {
                  width: 24,
                  height: 24,
                  backgroundColor: '#1976d2',
                  boxShadow: '0px 0px 5px rgba(0,0,0,0.2)'
                },
                '& .MuiSlider-track': {
                  height: 10,
                },
                '& .MuiSlider-rail': {
                  height: 10,
                  opacity: 0.3
                },
              }}
            />
          </Box>

          <Box sx={{ height: '600px', width: '100%', marginTop: '2rem', border: '1px solid #ccc', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: 2 }}>
            <ComposableMap projectionConfig={{ scale: 150 }} width={980} height={600}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const country = geo.properties.NAME || geo.properties.name;
                    return (
                      <Tooltip key={geo.rsmKey} title={<span style={{ whiteSpace: 'pre-line' }}>{tooltipContent}</span>} arrow>
                        <Geography
                          geography={geo}
                          style={{
                            default: { fill: "#b3e5fc", outline: "none" },
                            hover: { fill: "#4fc3f7", outline: "none" },
                            pressed: { fill: "#0288d1", outline: "none" }
                          }}
                          onMouseEnter={() => handleHover(country)}
                          onMouseLeave={() => setTooltipContent("")}
                        />
                      </Tooltip>
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}