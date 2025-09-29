import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./App.css";
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCategories } from './components/ProductCategories';
import { Advantages } from './components/Advantages';
import { About } from './components/About';
import { Portfolio } from './components/Portfolio';
import { Calculator } from './components/Calculator';
import { Footer } from './components/Footer';
import { AdminApp } from './components/AdminApp';

// Main website component
function MainWebsite() {
  return (
    <div>
      <Header />
      <Hero />
      <ProductCategories />
      <Advantages />
      <About />
      <Portfolio />
      <Calculator />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/admin" element={<AdminApp />} />
          <Route path="/" element={<MainWebsite />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;