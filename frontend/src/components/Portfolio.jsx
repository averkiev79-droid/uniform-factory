import React, { useState, useEffect } from 'react';
import { ExternalLink, Building, Users } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { apiService } from '../services/api';
import { portfolioItems } from '../mock'; // Fallback data

export const Portfolio = () => {
  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const data = await apiService.getPortfolio();
        // Transform API data to match frontend format
        const transformedData = data.map(item => ({
          id: item.id,
          company: item.company,
          description: item.description,
          image: item.image,
          category: item.category,
          items: item.items_count,
          year: item.year
        }));
        setPortfolioData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch portfolio:', err);
        setError('Failed to load portfolio');
        // Use fallback data
        setPortfolioData(portfolioItems);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);
  
  const categories = ['all', ...new Set(portfolioData.map(item => item.category))];
  
  const filteredItems = selectedFilter === 'all' 
    ? portfolioData 
    : portfolioData.filter(item => item.category === selectedFilter);

  if (loading) {
    return (
      <section id="portfolio" className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded-md w-80 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded-md w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900">
            Портфолио работ
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Более 5000 успешно реализованных проектов для компаний различных отраслей. 
            Посмотрите примеры нашей работы.
          </p>
          {error && (
            <p className="text-amber-600 text-sm">
              Показаны демо-данные. {error}
            </p>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedFilter(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                selectedFilter === category
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'Все проекты' : category}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.company}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 text-gray-800 hover:bg-white">
                    {item.year}
                  </Badge>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full">
                    <ExternalLink className="w-6 h-6 text-gray-800" />
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-purple-600 border-purple-200">
                      {item.category}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                    {item.company}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{item.items} изделий</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.year}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* More Projects CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 lg:p-12">
            <Building className="w-16 h-16 text-purple-600 mx-auto mb-6" />
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Хотите увидеть больше проектов?
            </h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              В нашем архиве более 5000 успешно реализованных проектов. 
              Запросите полное портфолио для вашей отрасли.
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-medium transition-colors duration-200">
              Запросить полное портфолио
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};