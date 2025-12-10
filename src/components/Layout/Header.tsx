/**
 * Header component with navigation and branding
 * Accessible and responsive
 */

import React from 'react';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Financial Dashboard' }) => {
  return (
    <header
      className="bg-neutral-900 text-white shadow-lg"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center font-bold text-xl"
              aria-hidden="true"
            >
              FD
            </div>
            <h1 className="text-xl font-semibold tracking-tight">
              {title}
            </h1>
          </div>

          {/* Navigation */}
          <nav aria-label="Main navigation">
            <ul className="flex space-x-6">
              <li>
                <a
                  href="#dashboard"
                  className="text-neutral-300 hover:text-white transition-colors focus:outline-none focus:text-white"
                  aria-current="page"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#portfolio"
                  className="text-neutral-300 hover:text-white transition-colors focus:outline-none focus:text-white"
                >
                  Portfolio
                </a>
              </li>
              <li>
                <a
                  href="#markets"
                  className="text-neutral-300 hover:text-white transition-colors focus:outline-none focus:text-white"
                >
                  Markets
                </a>
              </li>
            </ul>
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            <button
              className="text-neutral-300 hover:text-white transition-colors focus:outline-none"
              aria-label="Notifications"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center font-semibold">
              <span aria-label="User profile">JD</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;