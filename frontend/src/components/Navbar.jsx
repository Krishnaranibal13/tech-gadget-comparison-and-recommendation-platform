
import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  GitCompare,
  House,
  Menu,
  Search,
  Sparkles,
  Smartphone,
  UserRound,
  X,
} from "lucide-react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

const links = [
  { to: "/", label: "Home", icon: House, end: true },
  { to: "/gadgets", label: "Gadgets", icon: Smartphone },
  { to: "/compare", label: "Compare", icon: GitCompare },
  { to: "/recommend", label: "Recommendations", icon: Sparkles },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  function handleSearch(event) {
    event.preventDefault();

    const query = searchQuery.trim();

    navigate(
      query
        ? `/gadgets?search=${encodeURIComponent(query)}`
        : "/gadgets"
    );

    setMenuOpen(false);
    setSearchOpen(false);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="tc-navbar">
      <div className="tc-navbar-inner">
        <Link
          to="/"
          className="tc-brand"
          aria-label="TechCompare home"
          onClick={closeMenu}
        >
          <span className="tc-brand-mark">T</span>

          <span className="tc-brand-copy">
            <strong>TechCompare</strong>
            <small>Choose with confidence</small>
          </span>
        </Link>

        {/* One navigation list for desktop and mobile */}
        <nav
          id="tc-main-navigation"
          className={`tc-nav-menu ${menuOpen ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          {links.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `tc-nav-link ${isActive ? "is-active" : ""}`
                }
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="tc-nav-mobile-auth">
            <Link
              to="/login"
              className="tc-nav-mobile-login"
              onClick={closeMenu}
            >
              <UserRound size={17} />
              Sign in
            </Link>

            <Link
              to="/register"
              className="tc-get-started tc-nav-mobile-register"
              onClick={closeMenu}
            >
              Create account
              <ArrowRight size={16} />
            </Link>
          </div>
        </nav>

        <div className="tc-navbar-actions">
          {searchOpen && (
            <form
              className="tc-nav-search-form"
              onSubmit={handleSearch}
              role="search"
            >
              <Search size={17} aria-hidden="true" />

              <input
                type="search"
                autoFocus
                aria-label="Search gadgets"
                placeholder="Search gadgets..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
              />

              <button type="submit" aria-label="Submit search">
                <ArrowRight size={17} />
              </button>
            </form>
          )}

          <button
            type="button"
            className={`tc-search-trigger ${
              searchOpen ? "is-open" : ""
            }`}
            aria-label={searchOpen ? "Close search" : "Search gadgets"}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((previous) => !previous)}
          >
            {searchOpen ? <X size={19} /> : <Search size={19} />}
          </button>

          <Link to="/login" className="tc-login-link">
            <UserRound size={17} />
            <span>Sign in</span>
          </Link>

          <Link to="/register" className="tc-get-started tc-desktop-cta">
            Get started
            <ArrowRight size={16} />
          </Link>

          <button
            type="button"
            className="tc-mobile-menu-toggle"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-controls="tc-main-navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((previous) => !previous)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;