import React from 'react';
import { Navbar, Container, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, isGuest, logout, setShowAuthModal } = useAuth();

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand href="/" className="fw-bold">
          <i className="bi bi-currency-exchange me-2"></i>
          Currency Converter
        </Navbar.Brand>
        <div className="d-flex align-items-center gap-3">
          {user ? (
            <>
              <span className="text-white d-none d-md-inline">
                <i className="bi bi-person-circle me-1"></i>
                {user.name || user.email}
              </span>
              <Button variant="outline-light" size="sm" onClick={logout}>
                <i className="bi bi-box-arrow-right me-1"></i>
                Logout
              </Button>
            </>
          ) : isGuest ? (
            <>
              <Badge bg="warning" text="dark" className="d-none d-sm-inline">
                <i className="bi bi-person me-1"></i>
                Guest Mode
              </Badge>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => setShowAuthModal(true)}
              >
                <i className="bi bi-box-arrow-in-right me-1"></i>
                Sign In
              </Button>
            </>
          ) : null}
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;
