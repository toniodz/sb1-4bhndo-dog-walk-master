// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BlogPost from './pages/BlogPost';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import ErrorBoundary from './components/ErrorBoundary';

// Redirect component for old URLs
const RedirectToNewPattern: React.FC = () => {
  const { location } = useParams<{ location: string }>();
  return <Navigate to={`/dog-walks/kent/${location}`} replace />;
};

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
                <Route path="/search" element={<SearchPage />} />
                
                {/* New hierarchical routes */}
                <Route path="/dog-walks/kent" element={<CategoryPage />} />
                <Route path="/dog-walks/kent/:town" element={<CategoryPage />} />
                <Route path="/walks/:slug" element={<BlogPost />} />

                {/* Redirects from old URLs to new pattern */}
                <Route 
                  path="/dog-walks-in-kent" 
                  element={<Navigate to="/dog-walks/kent" replace />} 
                />
                <Route 
                  path="/dog-walks-in-:location" 
                  element={<RedirectToNewPattern />} 
                />
                
                <Route path="*" element={<div>Page not found</div>} />
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