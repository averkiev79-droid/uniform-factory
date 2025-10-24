import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

const BrandingSelector = ({ brandingOptions = [], onSelect }) => {
  const [selectedBranding, setSelectedBranding] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleAddBranding = () => {
    if (selectedBranding && selectedLocation) {
      onSelect({
        type: selectedBranding.type,
        location: selectedLocation
      });
      setSelectedBranding(null);
      setSelectedLocation(null);
      setShowModal(false);
    }
  };

  if (!brandingOptions || brandingOptions.length === 0) {
    return null;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-sm font-medium text-gray-700"
      >
        + Добавить нанесение
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Выберите нанесение</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedBranding(null);
                  setSelectedLocation(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Select branding type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Вид нанесения
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {brandingOptions.map((branding, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelectedBranding(branding);
                        setSelectedLocation(null);
                      }}
                      className={`p-3 border-2 rounded-lg text-left transition-all ${
                        selectedBranding === branding
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium">{branding.type}</div>
                      {branding.locations && branding.locations.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {branding.locations.length} {branding.locations.length === 1 ? 'место' : 'мест'}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select location */}
              {selectedBranding && selectedBranding.locations && selectedBranding.locations.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Место нанесения
                  </label>
                  <div className="space-y-2">
                    {selectedBranding.locations.map((location, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedLocation(location)}
                        className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                          selectedLocation === location
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{location.name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              Размер: {location.size}
                            </div>
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            +{location.price} ₽
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedBranding(null);
                  setSelectedLocation(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={handleAddBranding}
                disabled={!selectedBranding || !selectedLocation}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandingSelector;
