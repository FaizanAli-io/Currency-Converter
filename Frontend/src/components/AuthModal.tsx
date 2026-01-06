import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert, Nav, Tab } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, login, register, verifyOtp, continueAsGuest } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await register(email, password, name);
      setPendingEmail(result.email);
      setActiveTab('verify-otp');
      setSuccess('Registration successful! Please check your email for OTP.');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await verifyOtp(pendingEmail || email, otp);
      setSuccess('Email verified! You can now login.');
      setActiveTab('login');
      setEmail(pendingEmail || email);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.forgotPassword(email);
      setSuccess('If the email exists, a reset link has been sent.');
      setActiveTab('reset-password');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(resetToken, newPassword);
      setSuccess('Password reset successful! You can now login.');
      setActiveTab('login');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await authService.resendOtp(pendingEmail || email);
      setSuccess('OTP sent successfully!');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={showAuthModal} onHide={() => {}} backdrop="static" centered>
      <Modal.Header className="bg-primary text-white">
        <Modal.Title className="w-100 text-center">
          <i className="bi bi-currency-exchange me-2"></i>
          Currency Converter
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'login')}>
          <Nav variant="pills" className="justify-content-center mb-4">
            <Nav.Item>
              <Nav.Link eventKey="login">Login</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="register">Register</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey="login">
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? <Spinner size="sm" /> : 'Login'}
                  </Button>
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() => setActiveTab('forgot-password')}
                  >
                    Forgot Password?
                  </Button>
                </div>
              </Form>
            </Tab.Pane>

            <Tab.Pane eventKey="register">
              <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3">
                  <Form.Label>Name (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </Form.Group>
                <div className="d-grid">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? <Spinner size="sm" /> : 'Register'}
                  </Button>
                </div>
              </Form>
            </Tab.Pane>

            <Tab.Pane eventKey="verify-otp">
              <Form onSubmit={handleVerifyOtp}>
                <p className="text-muted text-center mb-3">
                  Enter the OTP sent to your email
                </p>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={pendingEmail || email}
                    onChange={(e) => setPendingEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>OTP</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                  />
                </Form.Group>
                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? <Spinner size="sm" /> : 'Verify OTP'}
                  </Button>
                  <Button variant="link" onClick={handleResendOtp} disabled={loading}>
                    Resend OTP
                  </Button>
                </div>
              </Form>
            </Tab.Pane>

            <Tab.Pane eventKey="forgot-password">
              <Form onSubmit={handleForgotPassword}>
                <p className="text-muted text-center mb-3">
                  Enter your email to receive a password reset token
                </p>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? <Spinner size="sm" /> : 'Send Reset Link'}
                  </Button>
                  <Button variant="link" onClick={() => setActiveTab('login')}>
                    Back to Login
                  </Button>
                </div>
              </Form>
            </Tab.Pane>

            <Tab.Pane eventKey="reset-password">
              <Form onSubmit={handleResetPassword}>
                <p className="text-muted text-center mb-3">
                  Enter the reset token from your email and new password
                </p>
                <Form.Group className="mb-3">
                  <Form.Label>Reset Token</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter reset token"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="New password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </Form.Group>
                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? <Spinner size="sm" /> : 'Reset Password'}
                  </Button>
                  <Button variant="link" onClick={() => setActiveTab('login')}>
                    Back to Login
                  </Button>
                </div>
              </Form>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>

        <hr />
        <div className="d-grid">
          <Button
            variant="outline-secondary"
            onClick={() => {
              continueAsGuest();
              setShowAuthModal(false);
            }}
          >
            Continue as Guest
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AuthModal;
