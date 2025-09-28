import React from 'react';
import "./App.css";
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCategories } from './components/ProductCategories';
import { Advantages } from './components/Advantages';
import { Portfolio } from './components/Portfolio';
import { Calculator } from './components/Calculator';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <ProductCategories />
      <Advantages />
      <Portfolio />
      <Calculator />
      <Footer />
    </div>
  );
}

export default App;