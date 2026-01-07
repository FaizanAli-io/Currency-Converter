import React, { useState, useEffect } from "react";
import { Card, Spinner, ListGroup } from "react-bootstrap";
import { currencyService } from "../services/api";
import { useCurrencies } from "../hooks/useCurrencies";

interface CurrencyStrength {
  code: string;
  name: string;
  rate: number;
  symbol: string;
}

const StrongestCurrencies: React.FC = () => {
  const { currencies } = useCurrencies();
  const [strongest, setStrongest] = useState<CurrencyStrength[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStrongestCurrencies = async () => {
      try {
        setLoading(true);

        // Check cache first (5 min TTL for this data)
        const cacheKey = "strongest-currencies-cache";
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as {
            timestamp: number;
            data: CurrencyStrength[];
          };
          if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
            setStrongest(parsed.data);
            setLoading(false);
            return;
          }
        }

        const response = await currencyService.getLatestRates("USD");
        const rates = response.data;

        // Convert rates to strength list (lower rate = stronger currency)
        // 1 USD = X currency means lower X = stronger currency
        const strengthList: CurrencyStrength[] = Object.entries(rates)
          .filter(([code]) => code !== "USD") // Exclude USD itself
          .map(([code, rate]) => ({
            code,
            name: currencies[code]?.name || code,
            rate: rate as number,
            symbol: currencies[code]?.symbol || ""
          }))
          .sort((a, b) => a.rate - b.rate) // Lower rate = stronger
          .slice(0, 10);

        setStrongest(strengthList);

        // Cache the result
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ timestamp: Date.now(), data: strengthList })
        );

        setError("");
      } catch (err) {
        console.error("Failed to fetch strongest currencies:", err);
        setError("Failed to load data");

        // Try to use stale cache on error
        const cached = localStorage.getItem("strongest-currencies-cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          setStrongest(parsed.data || []);
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if currencies are loaded
    if (Object.keys(currencies).length > 0) {
      fetchStrongestCurrencies();
    }
  }, [currencies]);

  const formatRate = (rate: number) => {
    if (rate < 0.01) return rate.toFixed(6);
    if (rate < 1) return rate.toFixed(4);
    return rate.toFixed(2);
  };

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return <i className="bi bi-trophy-fill text-warning"></i>;
      case 1:
        return (
          <i className="bi bi-trophy-fill" style={{ color: "#c0c0c0" }}></i>
        );
      case 2:
        return (
          <i className="bi bi-trophy-fill" style={{ color: "#cd7f32" }}></i>
        );
      default:
        return <span className="rank-number">{index + 1}</span>;
    }
  };

  return (
    <Card className="glass-card shadow-lg border-0 rounded-4">
      <Card.Header className="glass-card-header py-3">
        <h4 className="mb-0 strongest-title">
          <i className="bi bi-graph-up-arrow me-2"></i>
          <span className="d-none d-sm-inline">
            Strongest Currencies vs USD
          </span>
          <span className="d-inline d-sm-none">Top 10 vs USD</span>
        </h4>
      </Card.Header>
      <Card.Body className="card-section p-0">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" variant="info" />
          </div>
        ) : error ? (
          <div className="text-center py-4 text-muted">
            <i className="bi bi-exclamation-triangle fs-3 d-block mb-2"></i>
            {error}
          </div>
        ) : strongest.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <i className="bi bi-inbox fs-3 d-block mb-2"></i>
            No data available
          </div>
        ) : (
          <ListGroup variant="flush">
            {strongest.map((currency, index) => (
              <ListGroup.Item
                key={currency.code}
                className="d-flex justify-content-between align-items-center py-2 py-sm-3 currency-strength-item"
              >
                <div className="d-flex align-items-center gap-2 gap-sm-3 flex-grow-1">
                  <div className="medal-container">{getMedalIcon(index)}</div>
                  <div className="flex-grow-1 min-width-0">
                    <div className="fw-bold currency-name">
                      <span className="currency-code-strong">
                        {currency.code}
                      </span>
                      {currency.symbol && (
                        <span className="currency-symbol ms-1 ms-sm-2">
                          {currency.symbol}
                        </span>
                      )}
                    </div>
                    <small className="text-muted currency-full-name">
                      {currency.name}
                    </small>
                  </div>
                </div>
                <div className="text-end flex-shrink-0">
                  <div className="rate-value">
                    <span className="d-none d-sm-inline">1 USD = </span>
                    {formatRate(currency.rate)}
                  </div>
                  <small className="text-muted d-none d-sm-block">
                    {currency.code}
                  </small>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
      <Card.Footer className="card-section border-0 bg-transparent pt-2 pb-3 text-center">
        <small className="text-muted footer-text">
          <i className="bi bi-info-circle me-1"></i>
          <span className="d-none d-sm-inline">
            Lower rate = Stronger currency • Updated every 5 minutes
          </span>
          <span className="d-inline d-sm-none">Updates every 5 min</span>
        </small>
      </Card.Footer>
    </Card>
  );
};

export default StrongestCurrencies;
