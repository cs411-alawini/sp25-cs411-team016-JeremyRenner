import React, { useState } from 'react';
import { Box, TextField, Button, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import './Auth.css';
import { useNavigate } from 'react-router-dom';



export default function AuthForm() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [response, setResponse] = useState('');
  const navigate = useNavigate();


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResponse('');
    const endpoint = mode === 'login' ? 'login' : 'signup';
    const payload = mode === 'login'
      ? { email: form.email, password: form.password }
      : { email: form.email, username: form.username, password: form.password };

    try {
      const res = await fetch(`http://127.0.0.1:5000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(mode === 'login' ? `Welcome back, ${data.username}!` : 'Account created!');
        if (data.token) {
          localStorage.setItem('token', data.token);
          navigate('/');
        }
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  return (
    <Box className="auth-page">
      <Box className="auth-form">
        <Typography variant="h4" className="auth-title">
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </Typography>

        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(e, newMode) => newMode && setMode(newMode)}
          fullWidth
          className="auth-toggle-group"
        >
          <ToggleButton value="login">Login</ToggleButton>
          <ToggleButton value="signup">Sign Up</ToggleButton>
        </ToggleButtonGroup>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              margin="normal"
              required
              className="auth-input"
            />
          )}
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            margin="normal"
            required
            className="auth-input"
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            margin="normal"
            required
            className="auth-input"
          />

          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          {response && <Typography color="success.main" sx={{ mt: 1 }}>{response}</Typography>}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, py: 1.5 }}
          >
            {mode === 'login' ? 'Log In' : 'Sign Up'}
          </Button>
        </form>
      </Box>
    </Box>
  );
}