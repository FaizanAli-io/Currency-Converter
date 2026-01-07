import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef
} from "react";
import {
  Card,
  Form,
  Button,
  Spinner,
  Row,
  Col,
  Alert,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import { useCurrencies } from "../hooks/useCurrencies";
import { currencyService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useQuota } from "../context/QuotaContext";
import { ConversionResult } from "../types";

interface CurrencyConverterProps {
  onConversion?: () => void;
}

interface PairFrequency {
  pair: string;
  from: string;
  to: string;
  count: number;
}

interface FavoritePair {
  from: string;
  to: string;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  onConversion
}) => {
  const { currencyList, loading: currenciesLoading } = useCurrencies();
  const { guestId } = useAuth();
  const { setQuota } = useQuota();
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState<number>(100);
  const [historicalDate, setHistoricalDate] = useState<string>("");
  const [useHistorical, setUseHistorical] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Favorites management
  const [favorites, setFavorites] = useState<FavoritePair[]>(() => {
    const saved = localStorage.getItem("favorite-pairs");
    return saved ? JSON.parse(saved) : [];
  });

  const isFavorite = useMemo(() => {
    return favorites.some(
      (f) => f.from === fromCurrency && f.to === toCurrency
    );
  }, [favorites, fromCurrency, toCurrency]);

  const toggleFavorite = useCallback(() => {
    setFavorites((prev) => {
      const exists = prev.some(
        (f) => f.from === fromCurrency && f.to === toCurrency
      );
      const newFavs = exists
        ? prev.filter((f) => !(f.from === fromCurrency && f.to === toCurrency))
        : [...prev, { from: fromCurrency, to: toCurrency }].slice(0, 8);
      localStorage.setItem("favorite-pairs", JSON.stringify(newFavs));
      return newFavs;
    });
  }, [fromCurrency, toCurrency]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "s":
          e.preventDefault();
          setFromCurrency(toCurrency);
          setToCurrency(fromCurrency);
          setResult(null);
          break;
        case "f":
          e.preventDefault();
          toggleFavorite();
          break;
        case "a":
          e.preventDefault();
          amountInputRef.current?.focus();
          amountInputRef.current?.select();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fromCurrency, toCurrency, toggleFavorite]);

  const defaultPairs: PairFrequency[] = [
    { pair: "USD-EUR", from: "USD", to: "EUR", count: 0 },
    { pair: "USD-GBP", from: "USD", to: "GBP", count: 0 },
    { pair: "USD-JPY", from: "USD", to: "JPY", count: 0 },
    { pair: "USD-CAD", from: "USD", to: "CAD", count: 0 }
  ];

  const topPairs = useMemo(() => {
    // Prioritize favorites over history-based pairs
    if (favorites.length > 0) {
      return favorites.slice(0, 4).map((f) => ({
        pair: `${f.from}-${f.to}`,
        from: f.from,
        to: f.to,
        count: 999,
        isFavorite: true
      }));
    }

    const historyStr = localStorage.getItem(
      `history-cache-${guestId || "guest"}`
    );
    if (!historyStr) return defaultPairs;

    try {
      const historyData = JSON.parse(historyStr) as {
        data: Array<{
          fromCurrency: string;
          toCurrency: string;
        }>;
      };

      const pairCounts: Map<
        string,
        { from: string; to: string; count: number }
      > = new Map();

      historyData.data.forEach((record) => {
        const key = `${record.fromCurrency}-${record.toCurrency}`;
        if (!pairCounts.has(key)) {
          pairCounts.set(key, {
            from: record.fromCurrency,
            to: record.toCurrency,
            count: 0
          });
        }
        const pair = pairCounts.get(key)!;
        pair.count += 1;
      });

      const sortedPairs = Array.from(pairCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 4)
        .map((p) => ({ pair: `${p.from}-${p.to}`, ...p }));

      return sortedPairs.length > 0 ? sortedPairs : defaultPairs;
    } catch {
      return defaultPairs;
    }
  }, [guestId]);

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    const suffix = ["st", "nd", "rd"][((day + 90) % 10) - 1] || "th";
    return `${day}${suffix} ${month} ${year}`;
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        fromCurrency,
        toCurrency,
        amount,
        date: useHistorical && historicalDate ? historicalDate : undefined
      };
      console.log("Converting with payload:", payload);
      const response = await currencyService.convert(
        fromCurrency,
        toCurrency,
        amount,
        useHistorical && historicalDate ? historicalDate : undefined
      );
      console.log("Conversion result:", response.data);
      setResult(response.data);
      if (response.data.quota) {
        setQuota(response.data.quota);
      }
      if (onConversion) {
        onConversion();
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      console.error("Conversion error:", err);
      setError(axiosError.response?.data?.message || "Conversion failed");
    } finally {
      setLoading(false);
    }
  };

  // Get max date (today)
  const maxDate = new Date().toISOString().split("T")[0];

  return (
    <Card className="glass-card shadow-lg border-0 rounded-4">
      <Card.Header className="glass-card-header py-2 py-md-3 d-flex justify-content-between align-items-center">
        <h4 className="mb-0 converter-title">
          <i className="bi bi-currency-exchange me-1 me-md-2"></i>
          <span className="d-none d-sm-inline">Currency Converter</span>
          <span className="d-inline d-sm-none">Convert</span>
        </h4>
        <div className="d-flex align-items-center gap-2">
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip id="favorite-tooltip">
                {isFavorite ? "Remove from favorites" : "Add to favorites"} (F)
              </Tooltip>
            }
          >
            <Button
              variant="link"
              className="p-1 favorite-btn"
              onClick={toggleFavorite}
            >
              <i
                className={`bi ${
                  isFavorite ? "bi-star-fill text-warning" : "bi-star"
                }`}
                style={{ fontSize: "1.2rem" }}
              ></i>
            </Button>
          </OverlayTrigger>
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip id="shortcuts-tooltip">
                <div className="text-start">
                  <strong>Keyboard Shortcuts</strong>
                  <div className="small mt-1">
                    <div>
                      <kbd>S</kbd> Swap currencies
                    </div>
                    <div>
                      <kbd>F</kbd> Toggle favorite
                    </div>
                    <div>
                      <kbd>A</kbd> Focus amount
                    </div>
                  </div>
                </div>
              </Tooltip>
            }
          >
            <div className="shortcuts-hint">
              <i className="bi bi-keyboard" style={{ fontSize: "1rem" }}></i>
            </div>
          </OverlayTrigger>
        </div>
      </Card.Header>
      <Card.Body className="card-section p-4">
        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}

        {topPairs.length > 0 && (
          <div className="mb-4">
            <p className="text-muted small mb-2">
              {favorites.length > 0 ? (
                <>
                  <i className="bi bi-star-fill text-warning me-1"></i>
                  Favorites
                </>
              ) : (
                "Quick Pairs"
              )}
            </p>
            <div className="d-flex gap-2 flex-wrap">
              {topPairs.map((pair) => (
                <button
                  key={pair.pair}
                  type="button"
                  className={`btn btn-sm btn-outline-light quick-pair-btn rounded-pill ${
                    pair.from === fromCurrency && pair.to === toCurrency
                      ? "active"
                      : ""
                  }`}
                  onClick={() => {
                    setFromCurrency(pair.from);
                    setToCurrency(pair.to);
                    setResult(null);
                  }}
                >
                  {pair.from} ↔ {pair.to}
                </button>
              ))}
            </div>
            <hr className="my-3 opacity-25" />
          </div>
        )}

        <Form onSubmit={handleConvert}>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="fw-semibold muted-label">
                  Amount
                </Form.Label>
                <Form.Control
                  ref={amountInputRef}
                  type="number"
                  size="lg"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  min={0}
                  step="0.01"
                  className="text-center fs-4 amount-input"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={5}>
              <Form.Group>
                <Form.Label className="fw-semibold muted-label">
                  From
                </Form.Label>
                <Form.Select
                  size="lg"
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  disabled={currenciesLoading}
                >
                  {currenciesLoading ? (
                    <option>Loading...</option>
                  ) : (
                    currencyList.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </option>
                    ))
                  )}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col
              xs={12}
              md={2}
              className="d-flex align-items-end justify-content-center"
            >
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="swap-tooltip">Swap currencies (S)</Tooltip>
                }
              >
                <Button
                  variant="outline-light"
                  className="rounded-circle p-2 swap-btn"
                  onClick={handleSwapCurrencies}
                  style={{ width: "48px", height: "48px" }}
                >
                  <i className="bi bi-arrow-left-right"></i>
                </Button>
              </OverlayTrigger>
            </Col>

            <Col xs={12} md={5}>
              <Form.Group>
                <Form.Label className="fw-semibold muted-label">To</Form.Label>
                <Form.Select
                  size="lg"
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  disabled={currenciesLoading}
                >
                  {currenciesLoading ? (
                    <option>Loading...</option>
                  ) : (
                    currencyList.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </option>
                    ))
                  )}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Check
                type="switch"
                id="historical-switch"
                label="Use Historical Exchange Rate"
                checked={useHistorical}
                onChange={(e) => setUseHistorical(e.target.checked)}
                className="mb-3"
              />
              {useHistorical && (
                <div className="date-input-group">
                  <Form.Label className="fw-semibold muted-label small">
                    Select Date
                  </Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0">
                      <i className="bi bi-calendar-event"></i>
                    </span>
                    <Form.Control
                      type="date"
                      value={historicalDate}
                      onChange={(e) => setHistoricalDate(e.target.value)}
                      max={maxDate}
                      required={useHistorical}
                      className="date-input border-start-0"
                    />
                  </div>
                  {historicalDate && (
                    <div className="date-display mt-2">
                      {formatDateDisplay(historicalDate)}
                    </div>
                  )}
                </div>
              )}
            </Col>

            <Col xs={12}>
              <div className="d-grid">
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={loading || currenciesLoading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2 spinner-sm" />
                      Converting...
                    </>
                  ) : (
                    "Convert"
                  )}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>

        {result && (
          <div className="mt-4 p-4 result-panel rounded-3 text-center">
            <div className="mb-2 opacity-90">
              {Number(result.amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}{" "}
              {result.fromCurrency}
            </div>
            <div className="fs-2 fw-bold text-white">
              {Number(result.convertedAmount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}{" "}
              {result.toCurrency}
            </div>
            <div className="mt-2 opacity-90">
              <small>
                1 {result.fromCurrency} ={" "}
                {Number(result.exchangeRate).toFixed(2)} {result.toCurrency}
                {result.date && ` (as of ${result.date})`}
              </small>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default CurrencyConverter;
