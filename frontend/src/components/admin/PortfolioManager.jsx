import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';

export const PortfolioManager = () => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    company: '',
    description: '',
    image: '',
    category: '',
    items_count: 0,
    year: new Date().getFullYear()
  });

  React.useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/portfolio`);
      if (response.ok) {
        const data = await response.json();
        setPortfolioItems(data);
      }
    } catch (err) {
      setError('Ошибка загрузки портфолио');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      const url = editingId 
        ? `${process.env.REACT_APP_BACKEND_URL}/api/admin/portfolio/${editingId}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/admin/portfolio`;
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      if (response.ok) {
        await loadPortfolio();
        resetForm();
      } else {
        setError('Ошибка сохранения проекта');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      company: item.company,
      description: item.description,
      image: item.image,
      category: item.category,
      items_count: item.items_count,
      year: item.year
    });
    setEditingId(item.id);
    setShowAddForm(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Удалить этот проект из портфолио?')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/portfolio/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadPortfolio();
      } else {
        setError('Ошибка удаления проекта');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    }
  };

  const resetForm = () => {
    setFormData({
      company: '',
      description: '',
      image: '',
      category: '',
      items_count: 0,
      year: new Date().getFullYear()
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Загрузка портфолио...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Управление портфолио</h1>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-navy hover:bg-navy-hover"
        >
          <Plus className="mr-2 w-5 h-5" />
          Добавить проект
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Редактировать проект' : 'Добавить новый проект'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Название компании</Label>
                  <input
                    id="company"
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                    placeholder="Например: Сбербанк"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Категория</Label>
                  <input
                    id="category"
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                    placeholder="Банки, HoReCa, Торговля"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Описание проекта</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                  rows={3}
                  placeholder="Краткое описание выполненных работ"
                  required
                />
              </div>

              <div>
                <Label htmlFor="image">URL изображения</Label>
                <input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="items_count">Количество изделий</Label>
                  <input
                    id="items_count"
                    type="number"
                    value={formData.items_count}
                    onChange={(e) => setFormData({ ...formData, items_count: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                    placeholder="250"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="year">Год выполнения</Label>
                  <input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                    placeholder="2024"
                    min="2000"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" className="bg-navy hover:bg-navy-hover">
                  <Save className="mr-2 w-5 h-5" />
                  {editingId ? 'Сохранить изменения' : 'Добавить проект'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="mr-2 w-5 h-5" />
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-video">
              <img
                src={item.image}
                alt={item.company}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{item.company}</h3>
                <span className="text-sm text-gray-500">{item.year}</span>
              </div>
              
              <div className="mb-3">
                <span className="inline-block bg-navy-100 text-navy-700 text-xs px-2 py-1 rounded-full">
                  {item.category}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{item.description}</p>
              <p className="text-sm font-medium text-gray-900 mb-4">
                {item.items_count.toLocaleString()} изделий
              </p>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleEdit(item)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {portfolioItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Проекты в портфолио не найдены</p>
        </div>
      )}
    </div>
  );
};