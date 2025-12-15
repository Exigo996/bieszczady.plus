import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HeroSection from './components/events/HeroSection';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
