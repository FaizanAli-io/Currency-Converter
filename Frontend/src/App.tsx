import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { QuotaProvider } from "./context/QuotaContext";
import HomePage from "./pages/HomePage";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <QuotaProvider>
          <HomePage />
        </QuotaProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
