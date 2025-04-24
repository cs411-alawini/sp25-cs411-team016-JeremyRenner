import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Container,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { useNavigate } from 'react-router-dom';
import './DisasterMap.css';
import FilterSection from './FilterSection';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const disasterTypeOptions = ["Earthquake", "Tsunami", "Volcano"];

const indicatorOptions = [
  { value: "AVG(ne.GDPAnnualPercentGrowth) AS AvgGDP", label: "Average GDP Growth" },
  { value: "AVG(ne.CPI_2010_100) AS AvgCPI", label: "Average CPI (2010=100)" }
];

export default function DisasterMap() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1 });
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [disasterTypes, setDisasterTypes] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [yearRange, setYearRange] = useState([2000, 2020]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [hoveredCountryName, setHoveredCountryName] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      fetch(geoUrl)
        .then(res => res.json())
        .then(data => {
          const countries = data.objects.countries.geometries.map(g => g.properties.name || g.properties.NAME);
          setCountryOptions(countries.sort());
        })
        .catch(error => {
          console.error("Error loading map data:", error);
          setErrorMessage("Error loading map data. Please refresh the page.");
          setShowError(true);
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

  const handleYearRangeChange = (event, newValue) => {
    setYearRange(newValue);
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const handleSubmit = () => {
    if (selectedCountries.length === 0) {
      setErrorMessage("Please select at least one country");
      setShowError(true);
      return;
    }
    const payload = {
      countries: selectedCountries,
      indicators: indicators.length > 0 ? indicators.map(ind => ind.value): [],
      startYear: yearRange[0],
      endYear: yearRange[1],
      disasterTypes: disasterTypes.length > 0 ? disasterTypes : ["Earthquake", "Tsunami", "Volcano"]
    };
    setDataLoading(true);
    fetch('http://127.0.0.1:5000/compare_data_aggregated', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          setCountryData(data);
        } else {
          setErrorMessage("No data found for the selected criteria");
          setShowError(true);
        }
        setDataLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setDataLoading(false);
        setErrorMessage('Error fetching data from the server. Please try again.');
        setShowError(true);
      });
  };

  return (
    <Box className="disaster-map-container">
      <Box className="background-animations" />

      <Container maxWidth="xl" className="content-container">
        <Typography variant="h2" className="title">
          Global Disaster Impact
        </Typography>
        <Typography variant="h6" className="subtitle">
          Explore disaster statistics and their impact on global development and economic stability.
          Click on any country to view detailed information and historical trends.
        </Typography>

        {loading ? (
          <Box className="loading-container">
            <CircularProgress size={60} className="loading-spinner" />
          </Box>
        ) : (
          <>
            <FilterSection
              selectedCountries={selectedCountries}
              setSelectedCountries={setSelectedCountries}
              disasterTypes={disasterTypes}
              setDisasterTypes={setDisasterTypes}
              indicators={indicators}
              setIndicators={setIndicators}
              yearRange={yearRange}
              handleYearRangeChange={handleYearRangeChange}
              handleSubmit={handleSubmit}
              dataLoading={dataLoading}
              countryOptions={countryOptions}
              disasterTypeOptions={disasterTypeOptions}
              indicatorOptions={indicatorOptions}
            />

            <Box className="map-container">
            {hoveredCountryName && (
  <Box className="country-tooltip">
    <Typography variant="h6" className="tooltip-title">
      {hoveredCountryName}
    </Typography>

    {hoveredCountry ? (
      <>
        <Typography variant="body2" className="tooltip-text">
          Total Disasters <b>{hoveredCountry.TotalDisasters ?? "N/A"}</b>
        </Typography>

        <Typography variant="body2" className="tooltip-text">
          Total Deaths <b>{hoveredCountry.TotalDeaths ?? "N/A"}</b>
        </Typography>

        {indicators.find(i => i.label === "Average GDP Growth") && (
            <Typography variant="body2" className="tooltip-text">
                Avg. GDP Growth{" "}
                <b>
                {hoveredCountry.AvgGDP !== undefined && !isNaN(Number(hoveredCountry.AvgGDP))
                    ? Number(hoveredCountry.AvgGDP).toFixed(2) + "%"
                    : "N/A"}
                </b>
            </Typography>
            )}

            {indicators.find(i => i.label === "Average CPI (2010=100)") && (
            <Typography variant="body2" className="tooltip-text">
                Avg. CPI{" "}
                <b>
                {hoveredCountry.AvgCPI !== undefined && !isNaN(Number(hoveredCountry.AvgCPI))
                    ? Number(hoveredCountry.AvgCPI).toFixed(2)
                    : "N/A"}
                </b>
            </Typography>
            )}
      </>
    ) : (
      <Typography variant="body2" className="tooltip-text">
        No data available.
      </Typography>
    )}
  </Box>
)}

              <Box className="zoom-controls">
                <Box onClick={handleZoomIn} className="zoom-button">+</Box>
                <Box onClick={handleZoomOut} className="zoom-button">-</Box>
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
                  translateExtent={[[0, 0], [1200, 600]]}
                >
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const country = geo.properties.NAME || geo.properties.name;
                        const countryDataItem = countryData.find(item => item.CountryName === country);
                        const isHighlighted = !!countryDataItem;
                        return (
                            <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            onClick={() => handleCountryClick(country)}
                            onMouseEnter={() => {
                              setHoveredCountryName(country); // Always set country name
                              const countryDataItem = countryData.find(item => item.CountryName === country);
                              if (countryDataItem) {
                                setHoveredCountry(countryDataItem);
                              } else {
                                setHoveredCountry(null);
                              }
                            }}
                            onMouseLeave={() => {
                              setHoveredCountry(null);
                              setHoveredCountryName(null);
                            }}
                            className={isHighlighted ? "geography-highlighted" : "geography-normal"}
                          />
                          
                        );
                      })
                    }
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>
            </Box>
          </>
        )}

        <Box className="stats-container">
          <Box className="stat-box">
            <Typography variant="h4" className="stat-value">5000+</Typography>
            <Typography className="stat-label">
              Disasters tracked globally with real-time impact analysis
            </Typography>
          </Box>
          <Box className="stat-box">
            <Typography variant="h4" className="stat-value">192</Typography>
            <Typography className="stat-label">
              Countries with comprehensive disaster recovery metrics
            </Typography>
          </Box>
          <Box className="stat-box">
            <Typography variant="h4" className="stat-value">50 Years</Typography>
            <Typography className="stat-label">
              Of historical disaster data to analyze patterns and trends
            </Typography>
          </Box>
          <Box className="stat-box compare-box" onClick={handleCompareClick}>
            <Typography variant="h4" className="stat-value">Compare Countries</Typography>
            <Typography className="stat-label">
              View Disaster and Economic data between the countries
            </Typography>
          </Box>
        </Box>
      </Container>

      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ 
          width: '100%',
          backgroundColor: 'rgba(211, 47, 47, 0.9)',
          color: 'white',
          '& .MuiAlert-icon': {
            color: 'white'
          }
        }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}