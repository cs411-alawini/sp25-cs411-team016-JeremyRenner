import React from 'react';
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  Slider,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';

export default function FilterSection({
  countryOptions,
  selectedCountries,
  setSelectedCountries,
  disasterTypes = [],
  setDisasterTypes,
  indicators = [],
  setIndicators,
  yearRange,
  handleYearRangeChange,
  handleSubmit,
  dataLoading,
  disasterTypeOptions,
  indicatorOptions,
}) {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '1400px',
        mx: 'auto',
        mb: 5,
        px: { xs: 2, md: 4 },
        py: 3,
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.04)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 3,
        justifyContent: 'space-between',
        zIndex: 3,
      }}
    >
      {/* Country Selector */}
      <Box sx={{ flex: 1, minWidth: 220 }}>
        <Typography variant="subtitle2" sx={{ color: '#90caf9', mb: 1, fontWeight: 500 }}>
          SELECT COUNTRIES
        </Typography>
        <Autocomplete
          multiple
          freeSolo
          options={countryOptions}
          value={selectedCountries}
          onChange={(e, newVal) => setSelectedCountries(newVal)}
          ChipProps={{
            sx: {
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid #90caf9',
              '& .MuiChip-deleteIcon': {
                color: 'white',
                '&:hover': { color: '#ff1744' },
              },
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search countries"
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

      {/* Disaster Types */}
      <Box sx={{ flex: 1, minWidth: 180 }}>
        <Typography variant="subtitle2" sx={{ color: '#90caf9', mb: 1, fontWeight: 500 }}>
          DISASTER TYPES
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel sx={{ color: 'white' }}>Select</InputLabel>
          <Select
            multiple
            value={disasterTypes || []}
            onChange={(e) => setDisasterTypes(e.target.value)}
            label="Select"
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#90caf9',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#64b5f6',
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: '#1e1e2f',
                  color: 'white',
                },
              },
            }}
          >
            {disasterTypeOptions.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Indicators */}
      <Box sx={{ flex: 1, minWidth: 180 }}>
        <Typography variant="subtitle2" sx={{ color: '#90caf9', mb: 1, fontWeight: 500 }}>
          INDICATORS
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel sx={{ color: 'white' }}>Select</InputLabel>
          <Select
            multiple
            value={indicators || []}
            onChange={(e) => setIndicators(e.target.value)}
            label="Select"
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#90caf9',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#64b5f6',
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: '#1e1e2f',
                  color: 'white',
                },
              },
            }}
            renderValue={(selected) => selected.map(s => s.label || s).join(', ')}
          >
            {indicatorOptions.map((indicator) => (
              <MenuItem key={indicator.value} value={indicator}>{indicator.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Year Range Slider */}
      <Box sx={{ flex: 1, minWidth: 220 }}>
        <Typography variant="subtitle2" sx={{ color: '#90caf9', mb: 1, fontWeight: 500 }}>
          YEAR RANGE: {yearRange[0]} - {yearRange[1]}
        </Typography>
        <Slider
          value={yearRange}
          onChange={handleYearRangeChange}
          min={1900}
          max={2024}
          step={1}
          valueLabelDisplay="auto"
          sx={{
            color: '#2196f3',
          }}
        />
      </Box>

      {/* Apply Filters Button */}
      <Box sx={{ minWidth: 180 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={dataLoading}
          sx={{
            height: '56px',
            px: 4,
            fontWeight: 600,
            fontSize: '0.95rem',
            background: 'linear-gradient(90deg, #2196f3, #21cbf3)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(33, 203, 243, 0.4)',
            borderRadius: '12px',
            '&:hover': {
              background: 'linear-gradient(90deg, #1e88e5, #1de9b6)',
            },
          }}
        >
          APPLY FILTERS
        </Button>
      </Box>
    </Box>
  );
}