import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Edit2, Trash2, Eye, X, Save, Search, EyeOff, CheckSquare, Square, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Товаров на странице
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    short_description: '',
    price_from: '',
    price_to: '',
    material: '',
    sizes: [],
    colors: [],
    is_available: true,
    featured: false,
    images: [],
    characteristics: []
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/admin/products`);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Поиск товаров
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter(product => {
      return (
        product.name.toLowerCase().includes(query) ||
        (product.article && product.article.toLowerCase().includes(query)) ||
        (product.description && product.description.toLowerCase().includes(query))
      );
    });
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  // Выбор всех товаров
  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  // Выбор одного товара
  const toggleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Массовая публикация
  const handleBulkPublish = async () => {
    if (selectedProducts.length === 0) {
      alert('Выберите товары для публикации');
      return;
    }

    if (!window.confirm(`Опубликовать ${selectedProducts.length} товаров?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedProducts.map(productId =>
          axios.patch(`${BACKEND_URL}/api/admin/products/${productId}`, {
            is_available: true
          })
        )
      );
      alert('Товары успешно опубликованы');
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error('Error publishing products:', error);
      alert('Ошибка при публикации товаров');
    }
  };

  // Массовое скрытие
  const handleBulkUnpublish = async () => {
    if (selectedProducts.length === 0) {
      alert('Выберите товары для скрытия');
      return;
    }

    if (!window.confirm(`Скрыть ${selectedProducts.length} товаров?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedProducts.map(productId =>
          axios.patch(`${BACKEND_URL}/api/admin/products/${productId}`, {
            is_available: false
          })
        )
      );
      alert('Товары успешно скрыты');
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error('Error unpublishing products:', error);
      alert('Ошибка при скрытии товаров');
    }
  };

  const handleCreate = () => {
    setCurrentProduct(null);
    setFormData({
      category_id: '',
      name: '',
      description: '',
      short_description: '',
      price_from: '',
      price_to: '',
      material: '',
      sizes: [],
      colors: [],
      is_available: true,
      featured: false,
      images: [],
      characteristics: []
    });
    setIsEditing(true);
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setFormData({
      category_id: product.category_id,
      name: product.name,
      description: product.description,
      short_description: product.short_description || '',
      price_from: product.price_from,
      price_to: product.price_to || '',
      material: product.material || '',
      sizes: product.sizes || [],
      colors: product.colors || [],
      is_available: product.is_available,
      featured: product.featured,
      images: product.images?.map(img => img.image_url) || [],
      characteristics: product.characteristics || []
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.category_id || !formData.name || !formData.description || !formData.price_from) {
        alert('Заполните обязательные поля: категория, название, описание, цена');
        return;
      }

      const productData = {
        ...formData,
        price_from: parseInt(formData.price_from),
        price_to: formData.price_to ? parseInt(formData.price_to) : null
      };

      if (currentProduct) {
        // Update existing product
        await axios.put(`${BACKEND_URL}/api/admin/products/${currentProduct.id}`, productData);
        alert('Товар успешно обновлен');
      } else {
        // Create new product
        await axios.post(`${BACKEND_URL}/api/products`, productData);
        alert('Товар успешно создан');
      }

      setIsEditing(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Ошибка при сохранении товара: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      await axios.delete(`${BACKEND_URL}/api/admin/products/${productId}`);
      alert('Товар успешно удален');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Ошибка при удалении товара');
    }
  };

  // Быстрое изменение категории товара
  const handleQuickCategoryChange = async (productId, newCategoryId) => {
    try {
      // Найдем товар
      const product = products.find(p => p.id === productId);
      if (!product) return;

      // Обновляем только категорию
      await axios.put(`${BACKEND_URL}/api/admin/products/${productId}`, {
        category_id: newCategoryId,
        name: product.name,
        description: product.description,
        short_description: product.short_description || '',
        price_from: product.price_from,
        price_to: product.price_to || null,
        material: product.material || '',
        sizes: product.sizes || [],
        colors: product.colors || [],
        is_available: product.is_available,
        featured: product.featured || false
      });

      // Обновляем список
      fetchProducts();
      alert('Категория изменена');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Ошибка изменения категории');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInput = (field, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [field]: array }));
  };

  const addCharacteristic = () => {
    setFormData(prev => ({
      ...prev,
      characteristics: [...prev.characteristics, { name: '', value: '' }]
    }));
  };

  const updateCharacteristic = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      characteristics: prev.characteristics.map((char, i) => 
        i === index ? { ...char, [field]: value } : char
      )
    }));
  };

  const removeCharacteristic = (index) => {
    setFormData(prev => ({
      ...prev,
      characteristics: prev.characteristics.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка товаров...</p>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{currentProduct ? 'Редактировать товар' : 'Создать новый товар'}</CardTitle>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="w-4 h-4 mr-2" />
              Отмена
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Категория *</label>
              <select
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Выберите категорию</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.title}</option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Название товара"
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Краткое описание</label>
              <input
                type="text"
                value={formData.short_description}
                onChange={(e) => handleInputChange('short_description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Краткое описание для карточки товара"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Полное описание *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
                placeholder="Полное описание товара"
              />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Цена от *</label>
                <input
                  type="number"
                  value={formData.price_from}
                  onChange={(e) => handleInputChange('price_from', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="1500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Цена до</label>
                <input
                  type="number"
                  value={formData.price_to}
                  onChange={(e) => handleInputChange('price_to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="2500"
                />
              </div>
            </div>

            {/* Material */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Материал</label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) => handleInputChange('material', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Хлопок 95%, Эластан 5%"
              />
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Размеры (через запятую)</label>
              <input
                type="text"
                value={formData.sizes.join(', ')}
                onChange={(e) => handleArrayInput('sizes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="XS, S, M, L, XL"
              />
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Цвета (через запятую)</label>
              <input
                type="text"
                value={formData.colors.join(', ')}
                onChange={(e) => handleArrayInput('colors', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="белый, черный, серый"
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Изображения (URL через запятую)</label>
              <input
                type="text"
                value={formData.images.join(', ')}
                onChange={(e) => handleArrayInput('images', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              />
            </div>

            {/* Characteristics */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Характеристики</label>
                <Button type="button" size="sm" onClick={addCharacteristic}>
                  <Plus className="w-4 h-4 mr-1" />
                  Добавить
                </Button>
              </div>
              {formData.characteristics.map((char, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={char.name}
                    onChange={(e) => updateCharacteristic(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Название"
                  />
                  <input
                    type="text"
                    value={char.value}
                    onChange={(e) => updateCharacteristic(index, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Значение"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCharacteristic(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Availability & Featured */}
            <div className="flex gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => handleInputChange('is_available', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">В наличии</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Популярное</span>
              </label>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Отмена
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle>Управление товарами ({products.length})</CardTitle>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить товар
          </Button>
        </div>

        {/* Поиск по артикулу и названию */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск по названию или артикулу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {searchQuery && (
            <p className="text-sm text-gray-600 mt-2">
              Найдено: {filteredProducts.length} товаров
            </p>
          )}
        </div>

        {/* Массовые операции */}
        {filteredProducts.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              {selectedProducts.length === filteredProducts.length ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5" />
              )}
              Выбрать все
            </button>
            
            {selectedProducts.length > 0 && (
              <>
                <span className="text-sm text-gray-600">
                  Выбрано: {selectedProducts.length}
                </span>
                <div className="flex gap-2 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkPublish}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Опубликовать
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkUnpublish}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <EyeOff className="w-4 h-4 mr-1" />
                    Скрыть
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4 flex-1">
                {/* Чекбокс для выбора */}
                <button
                  onClick={() => toggleSelectProduct(product.id)}
                  className="flex-shrink-0"
                >
                  {selectedProducts.includes(product.id) ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>

                {product.images && product.images.length > 0 && (
                  <img
                    src={product.images[0].image_url}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-1">{product.short_description || product.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-medium text-blue-600">
                      {product.price_from.toLocaleString()} ₽
                      {product.price_to && ` - ${product.price_to.toLocaleString()} ₽`}
                    </span>
                    {/* Быстрое изменение категории */}
                    <select
                      value={product.category_id}
                      onChange={(e) => handleQuickCategoryChange(product.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Изменить категорию"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                      ))}
                    </select>
                    {product.article && (
                      <span className="text-xs font-mono font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        Арт. {product.article}
                      </span>
                    )}
                    {product.featured && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Популярное</span>
                    )}
                    {!product.is_available && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Нет в наличии</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/product/${product.id}`, '_blank')}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(product)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && !searchQuery && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Товары не найдены</p>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить первый товар
              </Button>
            </div>
          )}

          {filteredProducts.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">Товары не найдены</p>
              <p className="text-sm text-gray-400">Попробуйте изменить запрос</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
