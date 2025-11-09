import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Edit2, Trash2, Eye, X, Save, Search, EyeOff, CheckSquare, Square, ChevronLeft, ChevronRight, Clock, Star, Upload, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import ImageUploadGuidelines from './ImageUploadGuidelines';
import ColorImageUploader from './ColorImageUploader';
import BrandingManager from './BrandingManager';

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
  const [itemsPerPage, setItemsPerPage] = useState(30); // Товаров на странице (по умолчанию 30)
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    article: '',
    description: '',
    short_description: '',
    price_from: '',
    price_to: '',
    material: '',
    sizes: [],
    colors: [],
    color_images: [],
    branding_options: [],
    is_available: true,
    on_order: false,
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
      setCurrentPage(1); // Сброс на первую страницу при новом поиске
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
    setCurrentPage(1); // Сброс на первую страницу при новом поиске
  }, [searchQuery, products]);

  // Пагинация
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
  // Массовая публикация (В наличии)
  const handleBulkPublish = async () => {
    if (selectedProducts.length === 0) {
      alert('Выберите товары для публикации');
      return;
    }

    if (!window.confirm(`Опубликовать ${selectedProducts.length} товаров как "В наличии"?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedProducts.map(productId =>
          axios.patch(`${BACKEND_URL}/api/admin/products/${productId}`, {
            is_available: true,
            on_order: false
          })
        )
      );
      alert('Товары успешно опубликованы (В наличии)');
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error('Error publishing products:', error);
      alert('Ошибка при публикации товаров');
    }
  };

  // Массовое снятие с публикации
  const handleBulkUnpublish = async () => {
    if (selectedProducts.length === 0) {
      alert('Выберите товары для снятия с публикации');
      return;
    }

    if (!window.confirm(`Снять с публикации ${selectedProducts.length} товаров?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedProducts.map(productId =>
          axios.patch(`${BACKEND_URL}/api/admin/products/${productId}`, {
            is_available: false,
            on_order: false
          })
        )
      );
      alert('Товары сняты с публикации');
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error('Error unpublishing products:', error);
      alert('Ошибка при снятии с публикации');
    }
  };

  // Массовое "Под заказ"
  const handleBulkOnOrder = async () => {
    if (selectedProducts.length === 0) {
      alert('Выберите товары');
      return;
    }

    if (!window.confirm(`Установить статус "Под заказ" для ${selectedProducts.length} товаров?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedProducts.map(productId =>
          axios.patch(`${BACKEND_URL}/api/admin/products/${productId}`, {
            is_available: false,
            on_order: true
          })
        )
      );
      alert('Статус "Под заказ" установлен');
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error('Error setting on_order:', error);
      alert('Ошибка при установке статуса');
    }
  };

  // Массовое "Популярное"
  const handleBulkFeatured = async () => {
    if (selectedProducts.length === 0) {
      alert('Выберите товары');
      return;
    }

    if (!window.confirm(`Отметить ${selectedProducts.length} товаров как "Популярные"?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedProducts.map(productId =>
          axios.patch(`${BACKEND_URL}/api/admin/products/${productId}`, {
            featured: true
          })
        )
      );
      alert('Товары отмечены как популярные');
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error('Error setting featured:', error);
      alert('Ошибка при установке статуса');
    }
  };

  // Массовое удаление товаров
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      alert('Выберите товары для удаления');
      return;
    }

    if (!window.confirm(`⚠️ ВНИМАНИЕ! Вы уверены, что хотите УДАЛИТЬ ${selectedProducts.length} товаров?\n\nЭто действие НЕОБРАТИМО!`)) {
      return;
    }

    // Двойное подтверждение для безопасности
    if (!window.confirm(`Последнее подтверждение: удалить ${selectedProducts.length} товаров навсегда?`)) {
      return;
    }

    try {
      // Удаляем товары последовательно с отображением прогресса
      let deletedCount = 0;
      const totalCount = selectedProducts.length;
      
      for (const productId of selectedProducts) {
        try {
          await axios.delete(`${BACKEND_URL}/api/admin/products/${productId}`);
          deletedCount++;
          console.log(`Удалено ${deletedCount}/${totalCount} товаров`);
        } catch (error) {
          console.error(`Ошибка удаления товара ${productId}:`, error);
        }
      }

      alert(`✅ Успешно удалено ${deletedCount} из ${totalCount} товаров`);
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting products:', error);
      alert('Ошибка при удалении товаров');
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
    
    // Normalize images - handle both array of strings and array of objects
    let normalizedImages = [];
    if (Array.isArray(product.images)) {
      normalizedImages = product.images.map(img => {
        // If it's already a string (URL), use it
        if (typeof img === 'string') {
          return img;
        }
        // If it's an object with image_url property, extract it
        if (img && typeof img === 'object' && img.image_url) {
          return img.image_url;
        }
        return null;
      }).filter(url => url !== null);
    }
    
    setFormData({
      category_id: product.category_id,
      name: product.name,
      article: product.article || '',
      description: product.description,
      short_description: product.short_description || '',
      price_from: product.price_from,
      price_to: product.price_to || '',
      material: product.material || '',
      sizes: product.sizes || [],
      colors: product.colors || [],
      color_images: product.color_images || [],
      branding_options: product.branding_options || [],
      is_available: product.is_available,
      on_order: product.on_order || false,
      featured: product.featured,
      images: normalizedImages,
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

      // Парсим строковые поля в массивы перед отправкой
      const parseSizes = (sizes) => {
        if (Array.isArray(sizes)) return sizes;
        if (typeof sizes === 'string') {
          return sizes.split(',').map(s => s.trim()).filter(s => s);
        }
        return [];
      };

      const parseColors = (colors) => {
        if (Array.isArray(colors)) return colors;
        if (typeof colors === 'string') {
          return colors.split(',').map(c => c.trim()).filter(c => c);
        }
        return [];
      };

      const productData = {
        ...formData,
        price_from: parseInt(formData.price_from),
        price_to: formData.price_to ? parseInt(formData.price_to) : null,
        sizes: parseSizes(formData.sizes),
        colors: parseColors(formData.colors),
        // Убедимся, что images - это массив строк (URL-ов)
        images: Array.isArray(formData.images) ? formData.images : []
      };

      console.log('=== SAVING PRODUCT ===');
      console.log('Product ID:', currentProduct?.id);
      console.log('Product data:', JSON.stringify(productData, null, 2));
      console.log('Images count:', productData.images.length);
      console.log('Images URLs:', productData.images);

      if (currentProduct) {
        // Update existing product
        const response = await axios.put(`${BACKEND_URL}/api/admin/products/${currentProduct.id}`, productData);
        console.log('Update response:', response.data);
        alert('Товар успешно обновлен');
      } else {
        // Create new product
        const response = await axios.post(`${BACKEND_URL}/api/admin/products`, productData);
        console.log('Create response:', response.data);
        alert('Товар успешно создан');
      }

      setIsEditing(false);
      fetchProducts();
    } catch (error) {
      console.error('=== ERROR SAVING PRODUCT ===');
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
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

      // Обновляем только категорию - ВАЖНО: передаем ВСЕ поля, включая images, article, characteristics
      await axios.put(`${BACKEND_URL}/api/admin/products/${productId}`, {
        category_id: newCategoryId,
        name: product.name,
        article: product.article || '',
        description: product.description,
        short_description: product.short_description || '',
        price_from: product.price_from,
        price_to: product.price_to || null,
        material: product.material || '',
        sizes: product.sizes || [],
        colors: product.colors || [],
        images: product.images || [],
        characteristics: product.characteristics || [],
        is_available: product.is_available,
        on_order: product.on_order || false,
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
    // Просто сохраняем строку как есть, без немедленного парсинга
    // Парсинг будет при сохранении
    setFormData(prev => ({ ...prev, [field]: value }));
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

  // Image upload handlers
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formDataToSend = new FormData();
        formDataToSend.append('file', file);

        console.log('Uploading file:', file.name);
        const response = await axios.post(`${BACKEND_URL}/api/admin/upload-image`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Upload response:', response.data);
        const fullUrl = `${BACKEND_URL}${response.data.url}`;
        console.log('Full URL:', fullUrl);
        return fullUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      console.log('All uploaded URLs:', uploadedUrls);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

      alert(`Загружено ${uploadedUrls.length} изображений`);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Ошибка загрузки изображений: ' + (error.response?.data?.detail || error.message));
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const moveImageUp = (index) => {
    if (index === 0) return;
    setFormData(prev => {
      const newImages = [...prev.images];
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      return { ...prev, images: newImages };
    });
  };

  const moveImageDown = (index) => {
    if (index === formData.images.length - 1) return;
    setFormData(prev => {
      const newImages = [...prev.images];
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      return { ...prev, images: newImages };
    });
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

            {/* Article */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Артикул</label>
              <input
                type="text"
                value={formData.article}
                onChange={(e) => handleInputChange('article', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono"
                placeholder="Например: WS-001 или 4A.490E"
              />
              <p className="text-xs text-gray-500 mt-1">Уникальный код товара для идентификации</p>
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
                value={Array.isArray(formData.sizes) ? formData.sizes.join(', ') : formData.sizes}
                onChange={(e) => handleArrayInput('sizes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="XS, S, M, L, XL"
              />
            </div>

            {/* Colors with Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Цвета с изображениями</label>
              
              {/* Add new color */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Название цвета (например: белый)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      const newColor = {
                        color: e.target.value.trim(),
                        image: null,
                        preview: null
                      };
                      setFormData(prev => ({
                        ...prev,
                        color_images: [...(prev.color_images || []), newColor]
                      }));
                      e.target.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.target.closest('.flex').querySelector('input');
                    if (input.value.trim()) {
                      const newColor = {
                        color: input.value.trim(),
                        image: null,
                        preview: null
                      };
                      setFormData(prev => ({
                        ...prev,
                        color_images: [...(prev.color_images || []), newColor]
                      }));
                      input.value = '';
                    }
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Добавить цвет
                </Button>
              </div>

              {/* Color list with image uploaders */}
              <div className="space-y-3">
                {(formData.color_images || []).map((colorData, index) => (
                  <ColorImageUploader
                    key={index}
                    colorData={colorData}
                    onUpdate={(updatedColor) => {
                      const newColorImages = [...formData.color_images];
                      newColorImages[index] = updatedColor;
                      setFormData(prev => ({ ...prev, color_images: newColorImages }));
                    }}
                    onRemove={() => {
                      setFormData(prev => ({
                        ...prev,
                        color_images: prev.color_images.filter((_, i) => i !== index)
                      }));
                    }}
                  />
                ))}
              </div>

              {formData.color_images?.length === 0 && (
                <p className="text-sm text-gray-500 italic">Нет добавленных цветов</p>
              )}
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Изображения товара</label>
              
              {/* Guidelines */}
              <ImageUploadGuidelines type="product" />
              
              {/* Upload button */}
              <div className="mb-4">
                <label className="cursor-pointer">
                  <div className="flex items-center justify-center w-full h-32 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    {uploadingImage ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <span className="text-sm text-gray-600">Загрузка...</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-600">
                          Нажмите для загрузки или перетащите файлы
                        </span>
                        <span className="text-xs text-gray-500 block mt-1">
                          PNG, JPG до 10MB (можно выбрать несколько)
                        </span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>

              {/* Manual URL input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Или укажите URL изображения
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const url = e.target.value.trim();
                        if (url) {
                          setFormData(prev => ({
                            ...prev,
                            images: [...prev.images, url]
                          }));
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      const input = e.target.parentElement.querySelector('input[type="url"]');
                      const url = input.value.trim();
                      if (url) {
                        setFormData(prev => ({
                          ...prev,
                          images: [...prev.images, url]
                        }));
                        input.value = '';
                      }
                    }}
                  >
                    Добавить
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Введите URL и нажмите Enter или кнопку "Добавить"</p>
              </div>

              {/* Images preview */}
              {formData.images.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Загружено изображений: {formData.images.length}</p>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Удалить все изображения?')) {
                          setFormData(prev => ({ ...prev, images: [] }));
                        }
                      }}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Очистить все
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {formData.images.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="relative border border-gray-200 rounded-lg p-2 bg-white group"
                      >
                        <img
                          src={imageUrl}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/about-factory.jpg';
                          }}
                        />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">#{index + 1}</span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => moveImageUp(index)}
                              disabled={index === 0}
                              className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30"
                              title="Переместить вверх"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveImageDown(index)}
                              disabled={index === formData.images.length - 1}
                              className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30"
                              title="Переместить вниз"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="Удалить"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.images.length === 0 && (
                <p className="text-sm text-gray-500 italic">Изображения не загружены</p>
              )}
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Статус товара</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => {
                        const isAvailable = e.target.checked;
                        setFormData(prev => ({
                          ...prev,
                          is_available: isAvailable,
                          on_order: !isAvailable // Если не в наличии, то под заказ
                        }));
                      }}
                      className="w-4 h-4 mr-2"
                    />
                    <span className="text-sm text-gray-700">В наличии</span>
                  </label>
                  
                  {/* Status indicator */}
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm text-gray-500">Статус:</span>
                    {formData.is_available ? (
                      <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                        В наличии
                      </span>
                    ) : formData.on_order ? (
                      <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded">
                        Под заказ
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded">
                        Снят с публикации
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Unpublish button */}
                {(formData.is_available || formData.on_order) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        is_available: false,
                        on_order: false
                      }));
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                  >
                    Снять с публикации
                  </button>
                )}
                
                {/* Publish button if unpublished */}
                {!formData.is_available && !formData.on_order && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        is_available: true,
                        on_order: false
                      }));
                    }}
                    className="mt-2 text-sm text-green-600 hover:text-green-700 underline"
                  >
                    Опубликовать товар
                  </button>
                )}
              </div>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="w-4 h-4 mr-2"
                />
                <span className="text-sm text-gray-700">Популярное</span>
              </label>
            </div>

            {/* Branding Options */}
            <BrandingManager
              brandingOptions={formData.branding_options || []}
              onChange={(newBranding) => {
                setFormData(prev => ({ ...prev, branding_options: newBranding }));
              }}
            />

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
          
          {/* Выбор количества товаров на странице */}
          <div className="mt-3 flex items-center gap-2">
            <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
              Показывать по:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Сброс на первую страницу при изменении
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>10 шт.</option>
              <option value={30}>30 шт.</option>
              <option value={50}>50 шт.</option>
              <option value={100}>100 шт.</option>
            </select>
          </div>
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
                <div className="flex gap-2 ml-auto flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkPublish}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    В наличии
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkOnOrder}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Под заказ
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkFeatured}
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Популярное
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkUnpublish}
                    className="text-red-600 hover:text-red-700"
                  >
                    <EyeOff className="w-4 h-4 mr-1" />
                    Снять с публикации
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="text-white bg-red-600 hover:bg-red-700 border-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Удалить
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currentProducts.map((product) => (
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
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
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
                      <span className="text-sm font-mono font-bold text-white bg-navy px-3 py-1 rounded-md shadow-sm">
                        {product.article}
                      </span>
                    )}
                    {product.featured && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-semibold">⭐ Популярное</span>
                    )}
                    {product.is_available ? (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-semibold">✓ В наличии</span>
                    ) : product.on_order ? (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-semibold">🕐 Под заказ</span>
                    ) : (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded font-semibold">❌ Снят с публикации</span>
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

          {/* Пагинация */}
          {filteredProducts.length > itemsPerPage && (
            <div className="flex items-center justify-between pt-6 border-t mt-6">
              <div className="text-sm text-gray-600">
                Показано {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} из {filteredProducts.length} товаров
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Назад
                </Button>
                <span className="text-sm font-medium px-3">
                  Страница {currentPage} из {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Вперёд
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
