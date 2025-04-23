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

export default function CountryComparison() {
    
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
            py: { xs: 6, md: 8 },
            gap: 4,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
     </Box>)
}
