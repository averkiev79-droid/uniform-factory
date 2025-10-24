import React, { useState } from 'react';
import { Plus, X, Edit2, Save } from 'lucide-react';
import { Button } from '../ui/button';

const BrandingManager = ({ brandingOptions = [], onChange }) => {
  const [editingIndex, setEditingIndex] = useState(null);

  const addBrandingType = () => {
    const newBranding = {
      type: '',
      locations: []
    };
    onChange([...brandingOptions, newBranding]);
    setEditingIndex(brandingOptions.length);
  };

  const updateBrandingType = (index, field, value) => {
    const updated = [...brandingOptions];
    updated[index][field] = value;
    onChange(updated);
  };

  const removeBrandingType = (index) => {
    onChange(brandingOptions.filter((_, i) => i !== index));
  };

  const addLocation = (brandingIndex) => {
    const updated = [...brandingOptions];
    if (!updated[brandingIndex].locations) {
      updated[brandingIndex].locations = [];
    }
    updated[brandingIndex].locations.push({
      name: '',
      size: '',
      price: 0
    });
    onChange(updated);
  };

  const updateLocation = (brandingIndex, locationIndex, field, value) => {
    const updated = [...brandingOptions];
    updated[brandingIndex].locations[locationIndex][field] = value;
    onChange(updated);
  };

  const removeLocation = (brandingIndex, locationIndex) => {
    const updated = [...brandingOptions];
    updated[brandingIndex].locations = updated[brandingIndex].locations.filter((_, i) => i !== locationIndex);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Варианты нанесения
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addBrandingType}
        >
          <Plus className="w-4 h-4 mr-1" />
          Добавить вид нанесения
        </Button>
      </div>

      {brandingOptions.length === 0 && (
        <p className="text-sm text-gray-500 italic">Нет вариантов нанесения</p>
      )}

      {brandingOptions.map((branding, brandingIndex) => (
        <div key={brandingIndex} className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Вид нанесения</label>
              <input
                type="text"
                value={branding.type}
                onChange={(e) => updateBrandingType(brandingIndex, 'type', e.target.value)}
                placeholder="Например: Вышивка, Шелкография, Термопечать"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => removeBrandingType(brandingIndex)}
              className="text-red-600 hover:text-red-700 mt-6"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Locations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600">Места нанесения</label>
              <button
                type="button"
                onClick={() => addLocation(brandingIndex)}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Добавить место
              </button>
            </div>

            {branding.locations && branding.locations.length > 0 ? (
              <div className="space-y-2">
                {branding.locations.map((location, locationIndex) => (
                  <div key={locationIndex} className="flex gap-2 items-start bg-white p-2 rounded border">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={location.name}
                        onChange={(e) => updateLocation(brandingIndex, locationIndex, 'name', e.target.value)}
                        placeholder="Место (например: Грудь слева)"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="text"
                        value={location.size}
                        onChange={(e) => updateLocation(brandingIndex, locationIndex, 'size', e.target.value)}
                        placeholder="10×10"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        value={location.price}
                        onChange={(e) => updateLocation(brandingIndex, locationIndex, 'price', parseInt(e.target.value) || 0)}
                        placeholder="Цена"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLocation(brandingIndex, locationIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">Нет мест нанесения</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BrandingManager;
