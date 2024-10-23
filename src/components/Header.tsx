import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dog, Search, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-md relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Dog className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-gray-800">Dog Walks Near Me</span>
          </Link>
          <nav className="hidden md:block">
            <ul className="flex space-x-4">
              <li><Link to="/" className="text-gray-600 hover:text-primary">Home</Link></li>
              <li><Link to="/search" className="text-gray-600 hover:text-primary">Search</Link></li>
            </ul>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/search" className="btn-primary flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Find Walks
            </Link>
            <button
              className="md:hidden text-gray-600 hover:text-primary"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-50">
          <div className="flex flex-col items-center justify-center h-full">
            <button
              className="absolute top-4 right-4 text-white"
              onClick={toggleMenu}
              aria-label="Close menu"
            >
              <X className="h-8 w-8" />
            </button>
            <nav>
              <ul className="flex flex-col items-center space-y-6 text-xl">
                <li><Link to="/" className="text-white hover:text-primary" onClick={toggleMenu}>Home</Link></li>
                <li><Link to="/search" className="text-white hover:text-primary" onClick={toggleMenu}>Search</Link></li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;