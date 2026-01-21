import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Escalas from "./pages/Escalas";
import Swaps from "./pages/Swaps";
import { SwapProvider } from "./context/SwapContext";

const App: React.FC = () => {
  return (
    <SwapProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/escalas" element={<Escalas />} />
          <Route path="/swaps" element={<Swaps />} />
        </Routes>
      </Router>
    </SwapProvider>
  );
};

export default App;
