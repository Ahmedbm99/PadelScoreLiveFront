import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isOnSpectator = location.pathname.startsWith('/spectator');
  const isOnAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/45 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <img src="/PadelScoreLiveFront/bloom.png" alt="Bloom Cup Logo" className="h-12 w-12 rounded-full object-cover ring-2 ring-fuchsia-300/30 sm:h-14 sm:w-14" />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold tracking-tight text-white sm:text-3xl">BLOOM CUP</h1>
            <p className="text-[11px] uppercase tracking-wider text-cyan-200/90">Eleven Club Padel</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:flex-none sm:gap-3">
          {user && (
            <nav className="flex min-w-0 flex-wrap items-center justify-end gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 text-[11px] sm:rounded-full sm:text-xs">
              <Link to="/" className={`rounded-full px-2.5 py-1.5 sm:px-3 ${!isOnSpectator && !isOnAdmin ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white' : 'text-slate-200 hover:bg-white/10'}`}>
                Superviseur
              </Link>
              <Link to="/spectator" className={`rounded-full px-2.5 py-1.5 sm:px-3 ${isOnSpectator ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white' : 'text-slate-200 hover:bg-white/10'}`}>
                Spectateur
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className={`rounded-full px-2.5 py-1.5 sm:px-3 ${isOnAdmin ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white' : 'text-slate-200 hover:bg-white/10'}`}>
                  Admin
                </Link>
              )}
            </nav>
          )}

          {user && (
            <button onClick={logout} className="rounded-full border border-fuchsia-300/40 bg-fuchsia-500/15 px-3 py-1.5 text-xs font-semibold text-fuchsia-100 hover:bg-fuchsia-500/25">
              Deconnexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
