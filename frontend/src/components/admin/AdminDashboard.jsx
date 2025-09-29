import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Package, 
  Briefcase, 
  Mail, 
  BarChart3, 
  Upload, 
  LogOut,
  Menu,
  X 
} from 'lucide-react';
import { Button } from '../ui/button';
import { CategoriesManager } from './CategoriesManager';
import { PortfolioManager } from './PortfolioManager';
import { QuoteRequestsManager } from './QuoteRequestsManager';
import { StatisticsManager } from './StatisticsManager';
import { ImageUploader } from './ImageUploader';

export const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', name: 'Обзор', icon: LayoutGrid },
    { id: 'categories', name: 'Категории', icon: Package },
    { id: 'portfolio', name: 'Портфолио', icon: Briefcase },
    { id: 'quotes', name: 'Заявки', icon: Mail },
    { id: 'statistics', name: 'Статистика', icon: BarChart3 },
    { id: 'upload', name: 'Загрузка изображений', icon: Upload }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'categories':
        return <CategoriesManager />;
      case 'portfolio':
        return <PortfolioManager />;
      case 'quotes':
        return <QuoteRequestsManager />;
      case 'statistics':
        return <StatisticsManager />;
      case 'upload':
        return <ImageUploader />;
      default:
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Админ-панель AVIK</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
                <h3 className="text-lg font-semibold text-gray-900">Категории товаров</h3>
                <p className="text-gray-600 mt-2">Управление каталогом продукции</p>
                <Button 
                  onClick={() => setActiveTab('categories')}
                  className="mt-4 bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  Управлять
                </Button>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold text-gray-900">Портфолио</h3>
                <p className="text-gray-600 mt-2">Проекты и работы компании</p>
                <Button 
                  onClick={() => setActiveTab('portfolio')}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  Управлять
                </Button>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="text-lg font-semibold text-gray-900">Заявки</h3>
                <p className="text-gray-600 mt-2">Заявки на расчет и звонки</p>
                <Button 
                  onClick={() => setActiveTab('quotes')}
                  className="mt-4 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  Посмотреть
                </Button>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-500">
                <h3 className="text-lg font-semibold text-gray-900">Статистика</h3>
                <p className="text-gray-600 mt-2">Цифры компании на сайте</p>
                <Button 
                  onClick={() => setActiveTab('statistics')}
                  className="mt-4 bg-orange-600 hover:bg-orange-700"
                  size="sm"
                >
                  Изменить
                </Button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Быстрые действия</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => setActiveTab('upload')}
                  className="bg-gray-600 hover:bg-gray-700 justify-start"
                  size="lg"
                >
                  <Upload className="mr-2 w-5 h-5" />
                  Загрузить изображения
                </Button>
                <Button 
                  onClick={() => window.open('/', '_blank')}
                  variant="outline"
                  size="lg"
                  className="justify-start"
                >
                  <LayoutGrid className="mr-2 w-5 h-5" />
                  Перейти на сайт
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-0 md:w-64'
      } overflow-hidden relative flex flex-col`}>
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">AVIK Admin</h2>
        </div>
        
        <nav className="mt-6 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="mr-3 w-5 h-5" />
              {item.name}
            </button>
          ))}
        </nav>
        
        <div className="p-6 border-t">
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="mr-2 w-5 h-5" />
            Выйти
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b p-4 flex items-center justify-between">
          <Button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            variant="ghost"
            size="sm"
            className="md:hidden"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Админ-панель AVIK Uniform Factory
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};