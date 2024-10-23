import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BlogPost from './pages/BlogPost';
import SearchPage from './pages/SearchPage';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/search" element={<SearchPage />} />
              </Routes>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;