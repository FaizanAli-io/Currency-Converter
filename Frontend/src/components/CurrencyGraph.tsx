import React, { useState, useEffect } from 'react';
import { Card, Form, Spinner, Row, Col } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useCurrencies } from '../hooks/useCurrencies';
import { currencyService } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CurrencyGraph: React.FC = () => {
  const { currencyList, loading: currenciesLoading } = useCurrencies();
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<{
    labels: string[];
    rates: number[];
  }>({ labels: [], rates: [] });

  useEffect(() => {
    const fetchTimeSeriesData = async () => {
      setLoading(true);
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const response = await currencyService.getTimeSeries(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
          baseCurrency,
          [targetCurrency]
        );

        const data = response.data;
        const dates = Object.keys(data).sort();
        const rates = dates.map((date) => data[date][targetCurrency] || 0);

        setChartData({ labels: dates, rates });
      } catch (error) {
        console.error('Failed to fetch time series data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (baseCurrency && targetCurrency && baseCurrency !== targetCurrency) {
      fetchTimeSeriesData();
    }
  }, [baseCurrency, targetCurrency]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `${baseCurrency} to ${targetCurrency} - Last 30 Days`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: { parsed: { y: number | null } }) => {
            return `${(context.parsed.y ?? 0).toFixed(4)} ${targetCurrency}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: `1 ${baseCurrency} = ? ${targetCurrency}`,
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: `${baseCurrency}/${targetCurrency}`,
        data: chartData.rates,
        borderColor: 'rgb(13, 110, 253)',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <Card className="shadow-lg border-0 rounded-4">
      <Card.Header className="bg-success text-white py-3">
        <h4 className="mb-0 text-center">
          <i className="bi bi-graph-up me-2"></i>
          Exchange Rate Trend
        </h4>
      </Card.Header>
      <Card.Body className="p-4">
        <Row className="g-3 mb-4">
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold">Base Currency</Form.Label>
              <Form.Select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
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
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold">Target Currency</Form.Label>
              <Form.Select
                value={targetCurrency}
                onChange={(e) => setTargetCurrency(e.target.value)}
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
        </Row>

        <div style={{ height: '300px', position: 'relative' }}>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : chartData.labels.length > 0 ? (
            <Line options={options} data={data} />
          ) : (
            <div className="d-flex justify-content-center align-items-center h-100 text-muted">
              Select different currencies to view the chart
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default CurrencyGraph;
