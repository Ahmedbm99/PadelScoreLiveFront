import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import Header from './components/Header.jsx';

import LoginPage from './pages/LoginPage.jsx';
import ScorePage from './pages/ScorePage.jsx';
import SpectatorPage from './pages/SpectatorPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import Countdown from './pages/Countdown.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/PadelScoreLiveFront/">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>

              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/count" element={<Countdown />} />
              <Route path="/spectator" element={<SpectatorPage />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <ScorePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />

            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
