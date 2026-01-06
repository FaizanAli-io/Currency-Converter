import React from 'react';
import { Card, Button, ListGroup, Spinner, Badge } from 'react-bootstrap';
import { useConversionHistory } from '../hooks/useConversionHistory';

const ConversionHistoryList: React.FC = () => {
  const { history, loading, clearHistory, total } = useConversionHistory();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="shadow-lg border-0 rounded-4">
      <Card.Header className="bg-info text-white py-3 d-flex justify-content-between align-items-center">
        <h4 className="mb-0">
          <i className="bi bi-clock-history me-2"></i>
          Conversion History
        </h4>
        {history.length > 0 && (
          <Badge bg="light" text="dark" pill>
            {total}
          </Badge>
        )}
      </Card.Header>
      <Card.Body className="p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" variant="info" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-inbox fs-1 d-block mb-2"></i>
            No conversion history yet
          </div>
        ) : (
          <ListGroup variant="flush">
            {history.map((item) => (
              <ListGroup.Item
                key={item.id}
                className="d-flex justify-content-between align-items-start py-3"
              >
                <div className="me-auto">
                  <div className="fw-bold">
                    {item.amount.toLocaleString()} {item.fromCurrency}
                    <i className="bi bi-arrow-right mx-2 text-primary"></i>
                    {item.convertedAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}{' '}
                    {item.toCurrency}
                  </div>
                  <small className="text-muted">
                    Rate: 1 {item.fromCurrency} = {item.exchangeRate.toFixed(6)}{' '}
                    {item.toCurrency}
                    {item.historicalDate && (
                      <Badge bg="secondary" className="ms-2">
                        Historical: {item.historicalDate}
                      </Badge>
                    )}
                  </small>
                </div>
                <small className="text-muted text-end">
                  {formatDate(item.createdAt)}
                </small>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
      {history.length > 0 && (
        <Card.Footer className="bg-white border-top">
          <Button
            variant="outline-danger"
            size="sm"
            onClick={clearHistory}
            className="w-100"
          >
            <i className="bi bi-trash me-2"></i>
            Clear History
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
};

export default ConversionHistoryList;
