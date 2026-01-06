import React, { useState } from 'react';
import { Card, Form, Button, Spinner, Row, Col, Alert } from 'react-bootstrap';
import { useCurrencies } from '../hooks/useCurrencies';
import { currencyService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ConversionResult } from '../types';

interface CurrencyConverterProps {
  onConversion?: () => void;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ onConversion }) => {
  const { currencyList, loading: currenciesLoading } = useCurrencies();
  const { guestId } = useAuth();
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState<number>(100);
  const [historicalDate, setHistoricalDate] = useState<string>('');
  const [useHistorical, setUseHistorical] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await currencyService.convert(
        fromCurrency,
        toCurrency,
        amount,
        useHistorical && historicalDate ? historicalDate : undefined,
        guestId || undefined
      );
      setResult(response.data);
      if (onConversion) {
        onConversion();
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = (code: string) => {
    const currency = currencyList.find((c) => c.code === code);
    return currency?.symbol || code;
  };

  // Get max date (today)
  const maxDate = new Date().toISOString().split('T')[0];

  return (
    <Card className="shadow-lg border-0 rounded-4">
      <Card.Header className="bg-primary text-white py-3">
        <h4 className="mb-0 text-center">
          <i className="bi bi-currency-exchange me-2"></i>
          Currency Converter
        </h4>
      </Card.Header>
      <Card.Body className="p-4">
        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleConvert}>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="fw-semibold">Amount</Form.Label>
                <Form.Control
                  type="number"
                  size="lg"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  min={0}
                  step="0.01"
                  className="text-center fs-4"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={5}>
              <Form.Group>
                <Form.Label className="fw-semibold">From</Form.Label>
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

            <Col xs={12} md={2} className="d-flex align-items-end justify-content-center">
              <Button
                variant="outline-primary"
                className="rounded-circle p-2"
                onClick={handleSwapCurrencies}
                style={{ width: '48px', height: '48px' }}
              >
                <i className="bi bi-arrow-left-right"></i>
              </Button>
            </Col>

            <Col xs={12} md={5}>
              <Form.Group>
                <Form.Label className="fw-semibold">To</Form.Label>
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
                className="mb-2"
              />
              {useHistorical && (
                <Form.Control
                  type="date"
                  value={historicalDate}
                  onChange={(e) => setHistoricalDate(e.target.value)}
                  max={maxDate}
                  required={useHistorical}
                />
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
                      <Spinner size="sm" className="me-2" />
                      Converting...
                    </>
                  ) : (
                    'Convert'
                  )}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>

        {result && (
          <div className="mt-4 p-4 bg-light rounded-3 text-center">
            <div className="text-muted mb-2">
              {getCurrencySymbol(result.fromCurrency)} {result.amount.toLocaleString()} {result.fromCurrency}
            </div>
            <div className="fs-2 fw-bold text-primary">
              {getCurrencySymbol(result.toCurrency)} {result.convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {result.toCurrency}
            </div>
            <div className="text-muted mt-2">
              <small>
                1 {result.fromCurrency} = {result.exchangeRate.toFixed(6)} {result.toCurrency}
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
