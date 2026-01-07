import React from "react";
import {
  Navbar,
  Container,
  Button,
  Badge,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { useQuota } from "../context/QuotaContext";

const Header: React.FC = () => {
  const { user, isGuest, logout, setShowAuthModal } = useAuth();
  const { quota } = useQuota();

  const renderQuotaTooltip = (props: any) => {
    if (!quota) {
      return (
        <Tooltip id="quota-tooltip" {...props}>
          <div className="text-start">
            <strong>API Quota</strong>
            <div className="small">Loading...</div>
          </div>
        </Tooltip>
      );
    }

    const usedPercentage =
      ((quota.limit - quota.remaining) / quota.limit) * 100;

    return (
      <Tooltip id="quota-tooltip" {...props}>
        <div className="text-start">
          <strong>API Quota Status</strong>
          <div className="small mt-1">
            <div>Monthly Limit: {quota.limit.toLocaleString()}</div>
            <div>Used: {(quota.limit - quota.remaining).toLocaleString()}</div>
            <div>Remaining: {quota.remaining.toLocaleString()}</div>
            <div className="mt-1">
              <div className="progress" style={{ height: "5px" }}>
                <div
                  className={`progress-bar ${
                    usedPercentage > 80
                      ? "bg-danger"
                      : usedPercentage > 50
                      ? "bg-warning"
                      : "bg-success"
                  }`}
                  style={{ width: `${usedPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </Tooltip>
    );
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand href="/" className="fw-bold">
          <i className="bi bi-currency-exchange me-2"></i>
          Currency Converter
        </Navbar.Brand>
        <div className="d-flex align-items-center gap-3">
          <OverlayTrigger
            placement="bottom"
            delay={{ show: 250, hide: 400 }}
            overlay={renderQuotaTooltip}
          >
            <div className="quota-info-icon">
              <i
                className="bi bi-info-circle"
                style={{ fontSize: "1.2rem" }}
              ></i>
            </div>
          </OverlayTrigger>

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
