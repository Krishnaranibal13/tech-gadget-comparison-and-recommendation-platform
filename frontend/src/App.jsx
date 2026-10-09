
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// Shared components
import Navbar from "./components/Navbar";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Gadgets from "./pages/Gadgets";
import GadgetDetails from "./pages/GadgetDetails";
import Recommendations from "./pages/Recommendations";
import Compare from "./pages/Compare";

function App() {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-container">
        <Routes>
          {/* Home page */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* Authentication pages */}
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* Gadget catalog */}
          <Route
            path="/gadgets"
            element={<Gadgets />}
          />

          {/* Individual gadget details */}
          <Route
            path="/gadgets/:id"
            element={<GadgetDetails />}
          />

          {/* Personalized recommendations */}
          <Route
            path="/recommend"
            element={<Recommendations />}
          />

          {/* Product comparison */}
          <Route
            path="/compare"
            element={<Compare />}
          />

          {/* Redirect unknown URLs to Home */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;