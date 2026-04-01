// ==========================================================================
// src/components/auth/LoginPage.jsx — Password Login Screen
// ==========================================================================
// Purpose:
//   Full-screen centered login form. The application uses a simple
//   password-only authentication model (no username). On submit, the
//   password is sent to the backend which validates it against the
//   APP_PASSWORD environment variable and returns a JWT.
//
// Auth flow:
//   1. User types password and submits the form.
//   2. login(password) calls POST /api/auth/login (src/api/auth.js).
//   3. Backend (backend/api/auth.py) validates password vs APP_PASSWORD,
//      signs a JWT with APP_TOKEN_SECRET, and returns { token: "..." }.
//   4. loginUser(token) stores the JWT in AuthContext + localStorage.
//   5. navigate('/') redirects to the Dashboard.
//   6. On error, the backend's "detail" message is shown in a dismissible Alert.
//
// Internal dependencies:
//   - react-bootstrap (Card, Form, Button, Alert, Container)
//   - react-router-dom (useNavigate)
//   - context/AuthContext → useAuth().loginUser
//   - api/auth → login()
//
// Relationship to backend:
//   - POST /api/auth/login (backend/api/auth.py)
//     Request:  { "password": "<string>" }
//     Response: { "token": "<JWT>" }
//
// Used by:
//   - src/App.jsx → rendered on the /login route
// ==========================================================================
import React, { useState } from 'react';
import { Card, Form, Button, Alert, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
// useAuth provides loginUser() to persist the JWT token after successful auth
import { useAuth } from '../../context/AuthContext';
// login() sends the password to POST /api/auth/login
import { login } from '../../api/auth';

export default function LoginPage() {
  // Local form state
  const [password, setPassword] = useState('');
  // Error message displayed in a dismissible Alert; empty string = no error
  const [error, setError] = useState('');
  // Loading flag disables the submit button while the API call is in-flight
  const [loading, setLoading] = useState(false);
  // loginUser from AuthContext — stores the JWT in state + localStorage
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  // handleSubmit — called on form submission.
  // Sends password to the backend, stores the returned JWT, and navigates
  // to the dashboard on success. Shows an error alert on failure.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Call POST /api/auth/login via src/api/auth.js
      const res = await login(password);
      // Store the JWT in AuthContext (and localStorage for persistence)
      loginUser(res.data.token);
      // Redirect to the dashboard
      navigate('/');
    } catch (err) {
      // Display the backend error message, or a generic fallback
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '100%', maxWidth: '400px' }} className="border-secondary">
        <Card.Body>
          <Card.Title className="text-center mb-4 fs-4 fw-bold">Radicle Analytics</Card.Title>
          {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoFocus
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? 'Signing in...' : 'Enter'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
