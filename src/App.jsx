import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Header from './components/Header.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ScorePage from './pages/ScorePage.jsx';
import SpectatorPage from './pages/SpectatorPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Countdown from './pages/Countdown.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
function App() {
  return (
    <AuthProvider>
      <HashRouter basename='/PadelScoreLiveFront/'>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<ProtectedRoute><ScorePage /></ProtectedRoute>} />
              <Route path="/spectator" element={<SpectatorPage />} />
              <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
              <Route path="/count" element={<Countdown />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </AuthProvider>
  );
}
export default App;