import React, { useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';

export default function SaveGraphButton({ graphTitle, filters, page }) {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleSaveGraph = async () => {
    setSaving(true);
    try {
      const username = localStorage.getItem('username'); // username not token!!
      const response = await fetch('http://127.0.0.1:5000/save_graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          graph_title: graphTitle,
          filters,
          page
        })
      });
      if (response.ok) {
        setSuccess(true);
      } else {
        const data = await response.json();
        console.error('Save failed:', data.error);
        setError(true);
      }
    } catch (e) {
      console.error('Save error:', e);
      setError(true);
    }
    setSaving(false);
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={handleSaveGraph}
        disabled={saving}
        sx={{ mt: 2, backgroundColor: '#82b1ff', color: '#0d1b2a', '&:hover': { backgroundColor: '#64b5f6' } }}
      >
        Save Graph
      </Button>
      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success" onClose={() => setSuccess(false)}>Graph saved successfully!</Alert>
      </Snackbar>
      <Snackbar open={error} autoHideDuration={3000} onClose={() => setError(false)}>
        <Alert severity="error" onClose={() => setError(false)}>Failed to save graph.</Alert>
      </Snackbar>
    </>
  );
}
