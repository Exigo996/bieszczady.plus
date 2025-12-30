import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useFilters } from "../../contexts/FiltersContext";
import { getTranslations } from "../../translations";
import FilterPanel from "../events/FilterPanel";

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  const { filters, setFilters } = useFilters();
  const t = getTranslations(language);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  const handleFiltersMouseEnter = () => {
    setIsFiltersOpen(true);
  };

  const handleFiltersMouseLeave = () => {
    setIsFiltersOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  // Close dropdowns when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsFiltersOpen(false);
  }, [location.pathname]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isFiltersOpen) setIsFiltersOpen(false);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isFiltersOpen, isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleSearchChange = (search: string) => {
    setFilters({
      ...filters,
      search: search || undefined,
    });
  };

  const activeFiltersCount = Object.keys(filters).filter(
    (key) => key !== "radius" && filters[key as keyof typeof filters]
  ).length;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Główna nawigacja"
      >
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center -ml-2">
            <Link to="/" className="group">
              <div className="relative z-10">
                <img
                  src="/logo.webp"
                  alt="Bieszczady.plus"
                  className="h-13 w-auto transition-all duration-300 group-hover:scale-110 drop-shadow-2xl"
                  style={{ marginTop: "-1.5rem", marginBottom: "-1.5rem" }}
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                isActive("/")
                  ? "text-gray-900 border-blue-600"
                  : "text-gray-700 hover:text-blue-600 border-transparent hover:border-blue-600"
              }`}
              aria-current={isActive("/") ? "page" : undefined}
            >
              {t.events}
            </Link>
            <Link
              to="/produkty"
              className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                isActive("/produkty")
                  ? "text-gray-900 border-blue-600"
                  : "text-gray-700 hover:text-blue-600 border-transparent hover:border-blue-600"
              }`}
            >
              {t.localProducers}
            </Link>
            <Link
              to="/mapa"
              className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                isActive("/mapa")
                  ? "text-gray-900 border-blue-600"
                  : "text-gray-700 hover:text-blue-600 border-transparent hover:border-blue-600"
              }`}
            >
              {t.map}
            </Link>
            <Link
              to="/o-nas"
              className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                isActive("/o-nas")
                  ? "text-gray-900 border-blue-600"
                  : "text-gray-700 hover:text-blue-600 border-transparent hover:border-blue-600"
              }`}
            >
              {t.aboutUs}
            </Link>

            {/* Search Bar - Desktop */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Szukaj wydarzeń..."
                  value={filters.search || ""}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-64 px-4 py-1.5 pl-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  aria-label="Wyszukaj wydarzenie"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                />
                <svg
                  className="absolute left-3 top-2 w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <button
                className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                aria-label="Szukaj"
              >
                Szukaj
              </button>
            </div>

            {/* Filters Button - Desktop */}
            <div
              className="relative"
              onMouseEnter={handleFiltersMouseEnter}
              onMouseLeave={handleFiltersMouseLeave}
            >
              <button
                className={`relative px-4 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  isFiltersOpen
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                aria-label="Filtry"
                aria-expanded={isFiltersOpen}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filtry
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Filters Dropdown - Desktop */}
              {isFiltersOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-80 bg-white shadow-2xl z-50 border border-gray-200 rounded-lg max-h-[80vh] overflow-y-auto"
                  onMouseEnter={handleFiltersMouseEnter}
                  onMouseLeave={handleFiltersMouseLeave}
                >
                  <div className="p-4">
                    <FilterPanel filters={filters} onFiltersChange={setFilters} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Language Selector - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => setLanguage("pl")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                language === "pl"
                  ? "text-white bg-blue-600 hover:bg-blue-700"
                  : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              }`}
              aria-label="Język polski"
            >
              PL
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                language === "en"
                  ? "text-white bg-blue-600 hover:bg-blue-700"
                  : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              }`}
              aria-label="English language"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("uk")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                language === "uk"
                  ? "text-white bg-blue-600 hover:bg-blue-700"
                  : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              }`}
              aria-label="Українська мова"
            >
              UA
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">{t.openMainMenu}</span>
              {!isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200" id="mobile-menu">
            {/* Search - Mobile */}
            <div className="px-4 pt-3 pb-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Szukaj wydarzeń..."
                  value={filters.search || ""}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  aria-label="Wyszukaj wydarzenie"
                />
                <svg
                  className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Filters Button - Mobile */}
            <div className="px-4 pb-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsFiltersOpen(true);
                }}
                className={`w-full relative px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  isFiltersOpen
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                aria-label="Filtry"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filtry
                {activeFiltersCount > 0 && (
                  <span className="absolute top-1 right-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/")
                    ? "text-white bg-blue-600"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                } transition-colors`}
                aria-current={isActive("/") ? "page" : undefined}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.events}
              </Link>
              <Link
                to="/produkty"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/produkty")
                    ? "text-white bg-blue-600"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                } transition-colors`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.localProducers}
              </Link>
              <Link
                to="/mapa"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/mapa")
                    ? "text-white bg-blue-600"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                } transition-colors`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.map}
              </Link>
              <Link
                to="/o-nas"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/o-nas")
                    ? "text-white bg-blue-600"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                } transition-colors`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.aboutUs}
              </Link>
            </div>

            {/* Language Selector - Mobile */}
            <div className="px-2 pt-2 pb-4 border-t border-gray-200">
              <p className="px-3 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {t.language}
              </p>
              <div className="flex space-x-2 px-3">
                <button
                  onClick={() => setLanguage("pl")}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    language === "pl"
                      ? "text-white bg-blue-600 hover:bg-blue-700"
                      : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                  }`}
                  aria-label="Język polski"
                >
                  {t.polish}
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    language === "en"
                      ? "text-white bg-blue-600 hover:bg-blue-700"
                      : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                  }`}
                  aria-label="English language"
                >
                  {t.english}
                </button>
                <button
                  onClick={() => setLanguage("uk")}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    language === "uk"
                      ? "text-white bg-blue-600 hover:bg-blue-700"
                      : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                  }`}
                  aria-label="Українська мова"
                >
                  {t.ukrainian}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
