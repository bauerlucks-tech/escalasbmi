import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login"; // sensível a maiúsculas/minúsculas
import Home from "./pages/Home";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}
