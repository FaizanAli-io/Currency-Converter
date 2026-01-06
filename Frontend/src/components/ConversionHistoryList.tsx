import React, { useEffect } from "react";
import { Card, Button, ListGroup, Spinner, Badge } from "react-bootstrap";
import { useConversionHistory } from "../hooks/useConversionHistory";
import { useAuth } from "../context/AuthContext";

interface ConversionHistoryListProps {
  onRefreshReady?: (refresh: () => void) => void;
}

const ConversionHistoryList: React.FC<ConversionHistoryListProps> = ({
  onRefreshReady
}) => {
  const { history, loading, clearHistory, total, refresh } =
    useConversionHistory();
  const { guestId, isAuthenticated } = useAuth();

  useEffect(() => {
    if (onRefreshReady) {
      onRefreshReady(refresh);
    }
  }, [refresh, onRefreshReady]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <Card className="glass-card shadow-lg border-0 rounded-4">
      <Card.Header className="glass-card-header py-3 d-flex justify-content-between align-items-center">
        <h4 className="mb-0">
          <i className="bi bi-clock-history me-2"></i>
          Conversion History
        </h4>
        {history.length > 0 && (
          <Badge bg="light" pill style={{ color: "#000000 !important" }}>
            <span style={{ color: "#000000 !important" }}>{total}</span>
          </Badge>
        )}
      </Card.Header>
      <Card.Body className="p-0 card-section history-scroll">
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
            {history.map((item) => {
              const rate = Number(item.exchangeRate);
              const formattedRate = Number.isFinite(rate)
                ? rate.toFixed(2)
                : "N/A";

              return (
                <ListGroup.Item
                  key={item.id}
                  className="d-flex justify-content-between align-items-start py-3"
                >
                  <div className="me-auto">
                    <div className="fw-bold">
                      {Number(item.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}{" "}
                      {item.fromCurrency}
                      <i className="bi bi-arrow-right mx-2 text-primary"></i>
                      {Number(item.convertedAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}{" "}
                      {item.toCurrency}
                    </div>
                    <small className="text-muted">
                      Rate: 1 {item.fromCurrency} = {formattedRate}{" "}
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
              );
            })}
          </ListGroup>
        )}
      </Card.Body>
      {history.length > 0 && isAuthenticated && (
        <Card.Body className="card-section pt-0">
          <div className="d-flex gap-2">
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => {
                const historyStr = localStorage.getItem(
                  `history-cache-${guestId || "guest"}`
                );
                if (!historyStr) {
                  alert("No history to download");
                  return;
                }

                const historyData = JSON.parse(historyStr) as {
                  data: Array<{
                    id: string;
                    fromCurrency: string;
                    toCurrency: string;
                    amount: string | number;
                    convertedAmount: string | number;
                    exchangeRate: string | number;
                    createdAt: string;
                  }>;
                };

                const csv = [
                  "ID,From,To,Amount,Converted,Rate,Date",
                  ...historyData.data.map(
                    (row) =>
                      `${row.id},${row.fromCurrency},${row.toCurrency},${row.amount},${row.convertedAmount},${row.exchangeRate},${row.createdAt}`
                  )
                ].join("\n");

                const blob = new Blob([csv], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `conversion-history-${
                  new Date().toISOString().split("T")[0]
                }.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
              }}
              className="flex-fill history-btn"
            >
              <i className="bi bi-download me-2"></i>
              Download CSV
            </Button>
            <Button
              variant="outline-light"
              size="sm"
              onClick={clearHistory}
              className="flex-fill history-btn"
            >
              <i className="bi bi-trash me-2"></i>
              Clear History
            </Button>
          </div>
        </Card.Body>
      )}
    </Card>
  );
};

export default ConversionHistoryList;
