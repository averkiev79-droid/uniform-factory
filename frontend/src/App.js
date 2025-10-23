import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import "./App.css";
import { CartProvider } from './context/CartContext';
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
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { UserAgreementPage } from './pages/UserAgreementPage';
import { CompanyDetailsPage } from './pages/CompanyDetailsPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import CartPage from './pages/CartPage';
import { AdminApp } from './components/AdminApp';

function App() {
  return (
    <HelmetProvider>
      <CartProvider>
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
          <Route path="/search" element={
            <Layout>
              <SearchResultsPage />
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
          <Route path="/privacy-policy" element={
            <Layout>
              <PrivacyPolicyPage />
            </Layout>
          } />
          <Route path="/user-agreement" element={
            <Layout>
              <UserAgreementPage />
            </Layout>
          } />
          <Route path="/company-details" element={
            <Layout>
              <CompanyDetailsPage />
            </Layout>
          } />
        </Routes>
      </Router>
    </div>
    </HelmetProvider>
  );
}

export default App;