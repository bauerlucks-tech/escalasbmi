import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SwapProvider } from "./context/SwapContext";
import Login from "./pages/Login";
import Escalas from "./pages/Escalas";
import Swaps from "./pages/Swaps";

export default function App() {
  return (
    <SwapProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/escalas" element={<Escalas />} />
          <Route path="/swaps" element={<Swaps />} />
        </Routes>
      </BrowserRouter>
    </SwapProvider>
  );
}
