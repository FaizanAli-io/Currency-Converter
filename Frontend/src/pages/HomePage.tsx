import React, { useCallback, useRef } from "react";
import { Container, Row, Col, Badge } from "react-bootstrap";
import Header from "../components/Header";
import CurrencyConverter from "../components/CurrencyConverter";
import ConversionHistoryList from "../components/ConversionHistoryList";
import StrongestCurrencies from "../components/StrongestCurrencies";
import AuthModal from "../components/AuthModal";
import { useAuth } from "../context/AuthContext";

const HomePage: React.FC = () => {
  const { loading } = useAuth();
  const historyRefresh = useRef<(() => void) | undefined>(undefined);

  const handleConversion = useCallback(() => {
    // Force refresh history cache
    if (historyRefresh.current) {
      historyRefresh.current();
    }
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
    <div className="min-vh-100 bg-app-gradient text-dark">
      <Header />
      <AuthModal />

      <div className="hero-overlay py-3 py-md-5">
        <Container>
          <Row className="g-3 g-md-4">
            <Col xs={12}>
              <div className="glass-panel p-3 p-md-5 shadow-lg d-flex flex-column gap-2 gap-md-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <Badge bg="light" text="dark" className="pill-badge">
                    <i className="bi bi-shield-lock me-1"></i>Secure by JWT
                  </Badge>
                  <Badge bg="light" text="dark" className="pill-badge">
                    <i className="bi bi-graph-up-arrow me-1"></i>Live FX rates
                  </Badge>
                </div>
                <h1 className="hero-title fw-semibold mb-0 text-white">
                  Convert currencies with confidence and track every move.
                </h1>
                <p className="hero-subtitle mb-0 text-white">
                  Fast conversions, historical lookups, and saved history for
                  guests and signed-in users.
                </p>
                <div className="d-flex flex-wrap gap-3 mt-2">
                  <div className="stat-chip">
                    <span className="label">Latency</span>
                    <span className="value">&lt; 120ms</span>
                  </div>
                  <div className="stat-chip">
                    <span className="label">Coverage</span>
                    <span className="value">150+ FX pairs</span>
                  </div>
                  <div className="stat-chip">
                    <span className="label">History</span>
                    <span className="value">Saved per user/guest</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-3 py-md-4 position-relative content-container">
        <Row className="g-4">
          <Col xs={12} lg={6}>
            <CurrencyConverter onConversion={handleConversion} />
          </Col>
          <Col xs={12} lg={6}>
            <ConversionHistoryList
              onRefreshReady={(refresh) => {
                historyRefresh.current = refresh;
              }}
            />
          </Col>
        </Row>

        <Row className="g-4 mt-2">
          <Col xs={12}>
            <StrongestCurrencies />
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
