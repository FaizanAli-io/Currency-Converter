import React, { useState, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Header from '../components/Header';
import CurrencyConverter from '../components/CurrencyConverter';
import CurrencyGraph from '../components/CurrencyGraph';
import ConversionHistoryList from '../components/ConversionHistoryList';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { loading } = useAuth();
  const [historyKey, setHistoryKey] = useState(0);

  const handleConversion = useCallback(() => {
    // Trigger history refresh by changing key
    setHistoryKey((prev) => prev + 1);
  }, []);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Header />
      <AuthModal />
      <Container className="py-4">
        <Row className="g-4">
          <Col xs={12} lg={6}>
            <CurrencyConverter onConversion={handleConversion} />
          </Col>
          <Col xs={12} lg={6}>
            <ConversionHistoryList key={historyKey} />
          </Col>
          <Col xs={12}>
            <CurrencyGraph />
          </Col>
        </Row>
        <footer className="text-center py-4 mt-4 text-muted">
          <small>
            <i className="bi bi-info-circle me-1"></i>
            Exchange rates provided by Free Currency API
          </small>
        </footer>
      </Container>
    </div>
  );
};

export default HomePage;
