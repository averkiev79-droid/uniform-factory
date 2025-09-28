import React from 'react';
import "./App.css";
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCategories } from './components/ProductCategories';

function App() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <ProductCategories />
    </div>
  );
}

export default App;