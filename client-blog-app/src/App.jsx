import "./App.css";
import React from "react";
import { Routes, Route } from "react-router-dom";
import Registration from "./pages/registration";
import { Navbar } from "./components/Navbar";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/register" element={<Registration />} />
      </Routes>
    </div>
  );
}

export default App;
