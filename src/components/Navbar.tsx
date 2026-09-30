import { Film, Home, Tv, Sparkles, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export type TabId = 'home' | 'movies' | 'series' | 'anime';

interface NavbarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'movies', label: 'Movies', icon: Film },
  { id: 'series', label: 'Series', icon: Tv },
  { id: 'anime', label: 'Anime', icon: Sparkles },
];

export function Navbar({ activeTab, onTabChange, searchQuery, onSearchChange }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-neutral-950/95 backdrop-blur-xl shadow-lg shadow-black/40'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-8 lg:px-12 h-16 md:h-18">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => onTabChange('home')}>
          <div className="relative">
            <div className="absolute inset-0 bg-primary-600 blur-md opacity-50" />
            <Film size={26} className="relative text-primary-500" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Cine<span className="text-primary-500">Pulse</span>
          </span>
        </div>

        {/* Desktop tabs */}
        <div className="hidden md:flex items-center gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active ? 'text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          {searchOpen || searchQuery ? (
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-3 text-neutral-500 pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search movies, series, anime..."
                className="w-44 sm:w-64 md:w-80 rounded-full bg-white/10 border border-white/10 pl-9 pr-9 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/15 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => { onSearchChange(''); }}
                  className="absolute right-3 text-neutral-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-full bg-white/5 hover:bg-white/15 p-2 text-neutral-300 transition-colors"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="md:hidden flex items-center justify-around border-t border-white/5 bg-neutral-950/95 backdrop-blur-xl">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-2.5 flex-1 transition-colors ${
                active ? 'text-primary-500' : 'text-neutral-400'
              }`}
            >
              <Icon size={18} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
