import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import ProductsPage from './pages/ProductsPage';
import { LanguageProvider } from './contexts/LanguageContext';
import { FiltersProvider } from './contexts/FiltersContext';
import './App.css';

// Create a query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <FiltersProvider>
        <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/mapa" element={<MapPage />} />
                  <Route path="/produkty" element={<ProductsPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </FiltersProvider>
    </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
