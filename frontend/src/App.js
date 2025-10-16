import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./App.css";
import { Layout } from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { AboutPage } from './pages/AboutPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { ContactsPage } from './pages/ContactsPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { CategoryProductsPage } from './pages/CategoryProductsPage';
import { ProductPage } from './pages/ProductPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AdvantagePage } from './pages/AdvantagePage';
import { AdminApp } from './components/AdminApp';

function App() {
  return (
    <div className="App">
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/admin" element={<AdminApp />} />
          <Route path="/" element={
            <Layout>
              <HomePage />
            </Layout>
          } />
          <Route path="/catalog" element={
            <Layout>
              <CatalogPage />
            </Layout>
          } />
          <Route path="/about" element={
            <Layout>
              <AboutPage />
            </Layout>
          } />
          <Route path="/portfolio" element={
            <Layout>
              <PortfolioPage />
            </Layout>
          } />
          <Route path="/contacts" element={
            <Layout>
              <ContactsPage />
            </Layout>
          } />
          <Route path="/calculator" element={
            <Layout>
              <CalculatorPage />
            </Layout>
          } />
          <Route path="/category/:categoryId" element={
            <Layout>
              <CategoryProductsPage />
            </Layout>
          } />
          <Route path="/product/:productId" element={
            <Layout>
              <ProductPage />
            </Layout>
          } />
          <Route path="/favorites" element={
            <Layout>
              <FavoritesPage />
            </Layout>
          } />
          <Route path="/advantage/:slug" element={
            <Layout>
              <AdvantagePage />
            </Layout>
          } />
        </Routes>
      </Router>
    </div>
  );
}

export default App;