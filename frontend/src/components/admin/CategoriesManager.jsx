import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';

export const CategoriesManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    products_count: 0,
    slug: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      setError('Ошибка загрузки категорий');
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
        ? `${process.env.REACT_APP_BACKEND_URL}/api/admin/categories/${editingId}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/admin/categories`;
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      if (response.ok) {
        await loadCategories();
        resetForm();
      } else {
        setError('Ошибка сохранения категории');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    }
  };

  const handleEdit = (category) => {
    setFormData({
      title: category.title,
      description: category.description,
      image: category.image,
      products_count: category.products_count,
      slug: category.slug
    });
    setEditingId(category.id);
    setShowAddForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Удалить эту категорию?')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/categories/${categoryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadCategories();
      } else {
        setError('Ошибка удаления категории');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      products_count: 0,
      slug: ''
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Загрузка категорий...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Управление категориями</h1>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="mr-2 w-5 h-5" />
          Добавить категорию
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
              {editingId ? 'Редактировать категорию' : 'Добавить новую категорию'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Название категории</Label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Например: Офисная одежда"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug">URL slug</Label>
                  <input
                    id="slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="office-wear"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Описание</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Краткое описание категории"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="image">URL изображения</Label>
                  <input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="products_count">Количество товаров</Label>
                  <input
                    id="products_count"
                    type="number"
                    value={formData.products_count}
                    onChange={(e) => setFormData({ ...formData, products_count: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="50"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  <Save className="mr-2 w-5 h-5" />
                  {editingId ? 'Сохранить изменения' : 'Добавить категорию'}
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
        {categories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <div className="aspect-video">
              <img
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-2">{category.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{category.description}</p>
              <p className="text-sm text-gray-500 mb-4">
                {category.products_count} товаров • Slug: {category.slug}
              </p>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleEdit(category)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Категории не найдены</p>
        </div>
      )}
    </div>
  );
};