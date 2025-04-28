import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, CircularProgress, Button, Card, CardContent, AppBar, Toolbar, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export default function SavedGraphsPage() {
  const [graphs, setGraphs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGraphId, setEditingGraphId] = useState(null);  // Track which graph is being edited
  const [newGraphTitle, setNewGraphTitle] = useState('');  // Track the new graph title

  const navigate = useNavigate();
  
  // Get the filters from location state
  const location = useLocation();
  const filters = location.state?.filters || {};

  // Set filter states
  const [startYear, setStartYear] = useState(filters.startYear || '');
  const [endYear, setEndYear] = useState(filters.endYear || '');
  const [selectedDisasters, setSelectedDisasters] = useState(filters.selectedDisasters || []);
  const [selectedIndicators, setSelectedIndicators] = useState(filters.selectedIndicators || []);

  useEffect(() => {
    const fetchSavedGraphs = async () => {
      try {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        const response = await fetch('http://127.0.0.1:5000/saved_graphs', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Username': `${username}`
          },
        });
        const data = await response.json();
        if (response.ok) {
          setGraphs(data);
        } else {
          console.error('Failed to fetch graphs:', data.error);
        }
      } catch (error) {
        console.error('Error fetching saved graphs:', error);
      }
      setLoading(false);
    };

    fetchSavedGraphs();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/auth');
  };

  // Function to navigate to a page with filters
  function navigateToGraph(page, filters) {
    if (page === 'DisasterMap') {
      navigate('/', { state: { filters } });
    } else if (page === 'Compare') {
      navigate('/compare', { state: { filters } });
    } else if (page === 'Global Stats') {
      navigate('/global', { state: { filters } });
    } else {
      console.error('Invalid page for saved graph:', page);
    }
  }

  const handleEditGraphTitle = (graphId, currentTitle) => {
    setEditingGraphId(graphId);
    setNewGraphTitle(currentTitle);  // Pre-fill the title for editing
  };
  
  const handleSaveGraphTitle = async () => {
    if (!newGraphTitle) {
      console.error('Graph title cannot be empty');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
  
      if (!username) {
        console.error('User not logged in.');
        return;
      }
  
      const response = await fetch('http://127.0.0.1:5000/update_graph_title', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          graphId: editingGraphId,
          username,
          newGraphTitle,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        // Update the graph's title in the UI without modifying the delete logic
        setGraphs((prevGraphs) =>
          prevGraphs.map((graph) =>
            graph.GraphID === editingGraphId
              ? { ...graph, GraphTitle: newGraphTitle }
              : graph
          )
        );
        setEditingGraphId(null); // Stop editing mode
        setNewGraphTitle('');
        console.log(`Graph title updated to "${newGraphTitle}"`);
        window.location.reload();

      } else {
        console.error('Failed to update graph title:', data.error || data.message);
      }
    } catch (error) {
      console.error('Error updating graph title:', error);
    }
  };
  

  const handleDeleteGraph = async (graphId) => {
    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');  // Ensure this is stored in localStorage
  
      if (!username) {
        console.error('User not logged in.');
        return;
      }
  
      const response = await fetch('http://127.0.0.1:5000/delete_graph', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ graphId, username })
      });
  
      const data = await response.json();
      console.log('Response from server:', data);
  
      if (response.ok) {
        // Remove the deleted graph from the state
        setGraphs((prevGraphs) => prevGraphs.filter(graph => graph.GraphID !== graphId));
        console.log(`Graph ${graphId} deleted successfully.`);
        window.location.reload();
      } else {
        console.error('Failed to delete graph:', data.error || data.message);
      }
    } catch (error) {
      console.error('Error deleting graph:', error);
    }
  };
  

  return (
    <Box sx={{ minHeight: '100vh', pb:'50px', background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', color: 'white', pt: '50px', px: 2 }}>
      {/* --- NAVBAR --- */}
      <AppBar position="fixed" sx={{ background: '#0f2027', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)', zIndex: 10 }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#bbdefb', letterSpacing: '1px', userSelect: 'none' }}>
            Jeremy Renner
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={() => navigate('/')} variant="outlined" sx={{ color: '#bbdefb', borderColor: '#64b5f6' }}>Home</Button>
            <Button onClick={() => navigate('/compare')} variant="outlined" sx={{ color: '#bbdefb', borderColor: '#64b5f6' }}>Compare</Button>
            <Button onClick={() => navigate('/saved')} variant="outlined" sx={{ color: '#bbdefb', borderColor: '#64b5f6' }}>Saved Graphs</Button>
            <Button onClick={() => navigate('/global')} variant="outlined" sx={{ color: '#bbdefb', borderColor: '#64b5f6' }}>Global Stats</Button>
            <Button onClick={handleLogout} variant="outlined" sx={{ color: '#ef9a9a', borderColor: '#ef9a9a' }}>Sign Out</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* --- PAGE CONTENT --- */}
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Typography variant="h2" sx={{
          textAlign: 'center',
          mb: 4,
          fontWeight: 800,
          background: 'linear-gradient(to right, #bbdefb, #82b1ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' }
        }}>
          Saved Graphs
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress size={60} sx={{ color: '#82b1ff' }} />
          </Box>
        ) : graphs.length === 0 ? (
          <Typography sx={{ textAlign: 'center', mt: 8 }}>
            No saved graphs found.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
            {graphs.map((graph, idx) => {
                // Parse the filters from the saved graph if stored as a string
                const filters = JSON.parse(graph.Filters || '{}');
                
                return (
                    <Card key={idx} sx={{ width: 300, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <CardContent>
                    <Typography variant="h6" sx={{ color: '#bbdefb', mb: 1 }}>
                        {editingGraphId === graph.GraphId ? (
                            <TextField
                            value={newGraphTitle}
                            onChange={(e) => setNewGraphTitle(e.target.value)}
                            fullWidth
                            variant="outlined"
                            label="Edit Graph Title"
                            sx={{ color: 'white', background: 'rgba(255,255,255,0.1)' }}
                            />
                        ) : (
                            graph.GraphTitle
                        )}
                        </Typography>

                        <Typography variant="body2" sx={{ color: '#cfd8dc', mb: 2 }}>Page: {graph.Page}</Typography>
                        
                        {/* Show the filters saved with the graph */}
                        <Typography variant="body2" sx={{ color: '#cfd8dc', mb: 2 }}>
                        Filters: {graph.Filters || 'N/A'}
                        </Typography>

                        <Button
                        variant="outlined"
                        onClick={() => navigateToGraph(graph.Page, filters)}
                        sx={{ color: '#82b1ff', borderColor: '#82b1ff', margin:'5px'}}
                        >
                        Load Graph
                        </Button>

                        {editingGraphId === graph.GraphId ? (
                            <Button
                                variant="contained"
                                onClick={handleSaveGraphTitle}
                                sx={{ backgroundColor: '#64b5f6', color: '#0d1b2a', fontWeight: 600, mt: 2, margin:'5px'}}
                            >
                                Save Title
                            </Button>
                            ) : (
                            <Button
                                variant="outlined"
                                onClick={() => handleEditGraphTitle(graph.GraphId, graph.GraphTitle)}
                                sx={{ color: '#82b1ff', borderColor: '#82b1ff', margin:'10px'}}
                            >
                                Edit Title
                            </Button>
                            )}
                        
                        {/* Delete Button */}
                        <Button
                        variant="outlined"
                        onClick={() => handleDeleteGraph(graph.GraphId)}  // Pass GraphID here
                        sx={{ color: '#ef9a9a', borderColor: '#ef9a9a', margin:'5px'}}
                        >
                        Delete Graph
                        </Button>
                    </CardContent>
                    </Card>
                );
                })}

          </Box>
        )}
      </Container>
    </Box>
  );
}
