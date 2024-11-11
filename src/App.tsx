import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

// Page Components
import HomePage from './pages/HomePage';
import BlogPost from './pages/BlogPost';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import SubmitWalk from './pages/SubmitWalk';
import ThankYou from './pages/ThankYou';

// Redirect component for old URLs
const RedirectToNewPattern: React.FC = () => {
  const { location } = useParams<{ location: string }>();
  return <Navigate to={`/dog-walks/kent/${location.toLowerCase()}`} replace />;
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
                {/* Main Pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/submit-walk" element={<SubmitWalk />} />
                <Route path="/thank-you" element={<ThankYou />} />
                
                {/* Dog Walks Routes - Matching Original URLs */}
                <Route path="/dog-walks" element={<CategoryPage />} />
                <Route path="/dog-walks/:county" element={<CategoryPage />} />
                <Route path="/dog-walks/:county/:town" element={<CategoryPage />} />
                
                {/* Individual Walk Route */}
                <Route path="/walks/:slug" element={<BlogPost />} />

                {/* Feature Routes */}
                <Route path="/dog-walks/:county/features/:feature" element={<CategoryPage />} />
                <Route path="/dog-walks/:county/:town/features/:feature" element={<CategoryPage />} />

                {/* Legacy Redirects */}
                <Route 
                  path="/dog-walks-in-kent" 
                  element={<Navigate to="/dog-walks/kent" replace />} 
                />
                <Route 
                  path="/dog-walks-in-:location" 
                  element={<RedirectToNewPattern />} 
                />
                <Route 
                  path="/blog/:slug" 
                  element={<Navigate to="/walks/:slug" replace />} 
                />

                {/* 404 */}
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