import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BlogPost from './pages/BlogPost';
import SearchPage from './pages/SearchPage';
import ErrorBoundary from './components/ErrorBoundary';
import SubmitWalk from './pages/SubmitWalk';
import ThankYou from './pages/ThankYou'; 
import CategoryPage from './pages/CategoryPage';

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
  <Route path="/dog-walks/:slug" element={<BlogPost />} />  {/* Changed from /blog to /dog-walks */}
  <Route path="/search" element={<SearchPage />} />
  <Route path="/submit-walk" element={<SubmitWalk />} />
  <Route path="/thank-you" element={<ThankYou />} />
  <Route path="/dog-walks" element={<CategoryPage type="all" />} />
  <Route path="/dog-walks/:region" element={<CategoryPage type="region" />} />
  <Route path="/dog-walks/:region/:town" element={<CategoryPage type="town" />} />
  <Route path="/dog-walks/walk/:slug" element={<BlogPost />} />
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
