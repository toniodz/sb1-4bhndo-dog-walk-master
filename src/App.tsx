import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

// Page Components
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import WalkDetailPage from './pages/WalkDetailPage';
import SearchPage from './pages/SearchPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';

// Types
interface RedirectParams {
  location: string;
  county: string;
}

// Redirect component for old URLs
const RedirectToNewPattern: React.FC = () => {
  const { location } = useParams<{ location: string }>();
  return <Navigate to={`/dog-walks/kent/${location.toLowerCase()}`} replace />;
};

// County redirect handler
const CountyRedirectHandler: React.FC = () => {
  const { county } = useParams<{ county: string }>();
  return <Navigate to={`/dog-walks/${county?.toLowerCase()}`} replace />;
};

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          
          <main className="flex-grow">
            <ErrorBoundary>
              <Routes>
                {/* Main Pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Legal Pages */}
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />

                {/* Walk Routes */}
                <Route path="/dog-walks/:county" element={<CategoryPage />} />
                <Route path="/dog-walks/:county/:town" element={<CategoryPage />} />
                <Route path="/walks/:slug" element={<WalkDetailPage />} />

                {/* Legacy URL Redirects */}
                <Route 
                  path="/dog-walks-in-kent" 
                  element={<Navigate to="/dog-walks/kent" replace />} 
                />
                <Route 
                  path="/dog-walks-in-:location" 
                  element={<RedirectToNewPattern />} 
                />
                <Route 
                  path="/county/:county" 
                  element={<CountyRedirectHandler />} 
                />

                {/* Feature Pages */}
                <Route path="/features/:feature" element={<CategoryPage />} />
                
                {/* County-specific features */}
                <Route 
                  path="/dog-walks/:county/features/:feature" 
                  element={<CategoryPage />} 
                />

                {/* Town-specific features */}
                <Route 
                  path="/dog-walks/:county/:town/features/:feature" 
                  element={<CategoryPage />} 
                />

                {/* RSS Feed */}
                <Route 
                  path="/rss.xml" 
                  element={
                    <Navigate 
                      to="/api/rss" 
                      replace 
                    />
                  } 
                />

                {/* Sitemap */}
                <Route 
                  path="/sitemap.xml" 
                  element={
                    <Navigate 
                      to="/api/sitemap" 
                      replace 
                    />
                  } 
                />

                {/* 404 Page */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ErrorBoundary>
          </main>

          <Footer />
          
          {/* Toast Notifications */}
          <Toaster />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
