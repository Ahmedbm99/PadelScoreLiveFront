import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isOnSpectator = location.pathname.startsWith('/spectator');
  const isOnAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="w-full bg-slate-950 border-b border-slate-800">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-28">
        <div className="flex items-center">
          <img src="/PadelScoreLiveFront/Black png.png" alt="Padel Du Coeur Logo" className="h-40 w-40" />
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight">Padel Du Coeur</h1>
            <p className="text-2xl font-thin text-slate-400">Tableau de score temps réel</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <nav className="flex items-center gap-2 text-xs">
                <Link
                  to="/"
                  className={`rounded-md px-2 py-1 ${
                    !isOnSpectator && !isOnAdmin
                      ? 'bg-slate-800 text-slate-50'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Superviseur
                </Link>
                <Link
                  to="/spectator"
                  className={`rounded-md px-2 py-1 ${
                    isOnSpectator
                      ? 'bg-slate-800 text-slate-50'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Spectateur
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`rounded-md px-2 py-1 ${
                      isOnAdmin
                        ? 'bg-slate-800 text-slate-50'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </nav>
              <div className="text-right text-xs">
                <p className="font-medium">{user.username}</p>
                <p className="text-slate-400 capitalize">{user.role}</p>
              </div>
            </>
          )}
          {user && (
            <button
              onClick={logout}
              className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700 transition"
            >
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;


