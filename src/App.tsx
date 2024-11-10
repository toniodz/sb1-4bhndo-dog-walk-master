// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastProvider } from '@/providers/ToastProvider';

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
import CountyPage from './pages/CountyPage';
import TownPage from './pages/TownPage';
import NotFoundPage from './pages/NotFoundPage';

// Redirect component for old URLs
const RedirectToNewPattern: React.FC = () => {
  const { location } = useParams<{ location: string }>();
  return <Navigate to={`/kent/${location.toLowerCase()}/walks`} replace />;
};

function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
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
                  
                  {/* County and Town Routes */}
                  <Route path="/counties" element={<CategoryPage type="counties" />} />
                  <Route path="/:county" element={<CountyPage />} />
                  <Route path="/:county/walks" element={<CountyPage />} />
                  <Route path="/:county/:town/walks" element={<TownPage />} />
                  <Route path="/walks/:slug" element={<BlogPost />} />

                  {/* Feature Routes */}
                  <Route path="/:county/features/:feature" element={<CountyPage />} />
                  <Route path="/:county/:town/features/:feature" element={<TownPage />} />

                  {/* Redirects from old URLs */}
                  <Route 
                    path="/dog-walks-in-kent" 
                    element={<Navigate to="/kent/walks" replace />} 
                  />
                  <Route 
                    path="/dog-walks-in-:location" 
                    element={<RedirectToNewPattern />} 
                  />
                  
                  {/* Legacy redirects */}
                  <Route 
                    path="/dog-walks/:county" 
                    element={<Navigate to="/:county/walks" replace />} 
                  />
                  <Route 
                    path="/dog-walks/:county/:town" 
                    element={<Navigate to="/:county/:town/walks" replace />} 
                  />
                  <Route 
                    path="/blog/:slug" 
                    element={<Navigate to="/walks/:slug" replace />} 
                  />

                  {/* Static Pages */}
                  <Route path="/about" element={<div>About Page</div>} />
                  <Route path="/contact" element={<div>Contact Page</div>} />
                  <Route path="/privacy-policy" element={<div>Privacy Policy</div>} />
                  <Route path="/terms" element={<div>Terms of Service</div>} />

                  {/* 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </ErrorBoundary>
            </main>

            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </HelmetProvider>
  );
}

export default App;