import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi } from '../api/products';
import { categoriesApi } from '../api/categories';
import { ImageUpload } from '../components/common/ImageUpload';
import { CategoryMultiSelect } from '../components/common/CategoryMultiSelect';
import { BatchTable } from '../components/common/BatchTable';
import { StockChart } from '../components/common/StockChart';
import { AuditTimeline } from '../components/common/AuditTimeline';
import { PricingCalculator } from '../components/common/PricingCalculator';
import { TagsInput } from '../components/common/TagsInput';
import { OrderHistory, SupplierInfo } from '../components/common/OrderHistory';
import { ToastContainer } from '../components/common/Toast';
import { useToast } from '../hooks/useToast';

interface ProductDetail {
  id: number;
  name: string;
  sku: string | null;
  barcode: string | null;
  price: number;
  cost_price: number | null;
  vat_rate: number;
  margin_percent?: number;
  stock_quantity: number;
  min_stock_level: number;
  category_ids?: number[];
  category_id: number | null;
  description: string | null;
  image_url: string | null;
  tags?: string[];
  is_active: boolean;
}

type Section = 'general' | 'pricing' | 'inventory' | 'supply' | 'analytics';

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<Section>('general');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ProductDetail>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    if (id) {
      loadProduct(parseInt(id));
    }
    loadCategories();
  }, [id]);

  const loadCategories = async () => {
    try {
      const { data } = await categoriesApi.list();
      setCategories(data);
    } catch (err) {
      showError('Грешка при зареждане на категориите');
    }
  };

  const calculateInitialMargin = (price: number, costPrice: number, vatRate: number): number => {
    if (!price || !costPrice) return 0;
    const priceBeforeVat = price / (1 + vatRate / 100);
    return ((priceBeforeVat - costPrice) / costPrice) * 100;
  };

  const loadProduct = async (productId: number) => {
    try {
      const { data } = await productsApi.get(productId);
      // Initialize with defaults and calculate margin if not present
      const productData = {
        ...data,
        category_ids: data.category_id ? [data.category_id] : [],
        tags: data.tags || [],
        cost_price: data.cost_price || 0,
        margin_percent: data.margin_percent !== undefined
          ? data.margin_percent
          : calculateInitialMargin(data.price || 0, data.cost_price || 0, data.vat_rate || 20),
      };
      setProduct(productData);
      setFormData(productData);
    } catch (err) {
      showError('Грешка при зареждане на продукта');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Името е задължително';
    }

    if (formData.price !== undefined && formData.price < 0) {
      newErrors.price = 'Цената не може да е отрицателна';
    }

    if (formData.cost_price !== undefined && formData.cost_price !== null && formData.cost_price < 0) {
      newErrors.cost_price = 'Доставната цена не може да е отрицателна';
    }

    if (formData.stock_quantity !== undefined && formData.stock_quantity < 0) {
      newErrors.stock_quantity = 'Наличността не може да е отрицателна';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!product?.id) return;

    if (!validateForm()) {
      showError('Моля, коригирайте грешките във формата');
      return;
    }

    try {
      // Convert category_ids back to category_id for API
      const dataToSave = {
        ...formData,
        category_id: formData.category_ids && formData.category_ids.length > 0
          ? formData.category_ids[0]
          : null,
      };

      await productsApi.update(product.id, dataToSave);
      await loadProduct(product.id);
      setIsEditing(false);
      success('Продуктът беше запазен успешно!');
    } catch (err) {
      showError('Грешка при запазване на продукта');
    }
  };

  const handleDelete = async () => {
    if (!product?.id) return;
    if (confirm('Сигурни ли сте, че искате да изтриете този продукт?')) {
      try {
        await productsApi.delete(product.id);
        success('Продуктът беше изтрит');
        navigate('/products');
      } catch (err) {
        showError('Грешка при изтриване на продукта');
      }
    }
  };

  const scrollToSection = (section: Section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateBarcode = () => {
    const barcode = 'BAR' + Date.now().toString().slice(-10);
    setFormData({ ...formData, barcode });
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Зареждане...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ЗОНА Б: Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 border-b">
          <button
            onClick={() => navigate('/products')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад към продукти
          </button>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => scrollToSection('general')}
                className={`w-full text-left px-4 py-3 rounded transition-colors ${
                  activeSection === 'general'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span>Основна информация</span>
                </div>
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('pricing')}
                className={`w-full text-left px-4 py-3 rounded transition-colors ${
                  activeSection === 'pricing'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Ценообразуване</span>
                </div>
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('inventory')}
                className={`w-full text-left px-4 py-3 rounded transition-colors ${
                  activeSection === 'inventory'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Складови наличности</span>
                </div>
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('supply')}
                className={`w-full text-left px-4 py-3 rounded transition-colors ${
                  activeSection === 'supply'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                  <span>Доставки</span>
                </div>
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('analytics')}
                className={`w-full text-left px-4 py-3 rounded transition-colors ${
                  activeSection === 'analytics'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Анализи и История</span>
                </div>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ЗОНА А: Sticky Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 sticky top-0 z-10">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                  {product.name}
                </h1>
                <div className="flex flex-wrap gap-3 md:gap-4 mt-2 text-xs md:text-sm text-gray-600">
                  <span>
                    SKU: <strong>{product.sku || 'N/A'}</strong>
                  </span>
                  <span>
                    Цена:{' '}
                    <strong className="text-green-600">{Number(product.price || 0).toFixed(2)} лв.</strong>
                  </span>
                  <span>
                    Наличност:{' '}
                    <strong
                      className={
                        product.stock_quantity <= product.min_stock_level
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }
                    >
                      {product.stock_quantity}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded hover:bg-blue-700 transition-colors text-sm md:text-base"
                  >
                    Запази
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(product);
                      setErrors({});
                    }}
                    className="bg-gray-300 text-gray-700 px-4 md:px-6 py-2 rounded hover:bg-gray-400 transition-colors text-sm md:text-base"
                  >
                    Отказ
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded hover:bg-blue-700 transition-colors text-sm md:text-base"
                  >
                    Редакция
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 md:px-6 py-2 rounded hover:bg-red-700 transition-colors text-sm md:text-base"
                  >
                    Изтрий
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ЗОНА В: Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Секция 1: General Info */}
          <section id="general" className="bg-white rounded-lg shadow p-4 md:p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Основна информация и категоризация
            </h2>

            {/* Image Upload */}
            <div className="mb-6">
              <ImageUpload
                currentImage={formData.image_url}
                onImageChange={(url) => setFormData({ ...formData, image_url: url })}
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Име на продукта *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded disabled:bg-gray-100 ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                <input
                  type="text"
                  value={formData.sku || ''}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Баркод</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.barcode || ''}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    disabled={!isEditing}
                    className="flex-1 px-3 py-2 border rounded disabled:bg-gray-100"
                  />
                  {isEditing && (
                    <button
                      onClick={generateBarcode}
                      className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 whitespace-nowrap"
                    >
                      Генерирай
                    </button>
                  )}
                </div>
              </div>

              <div>
                <CategoryMultiSelect
                  categories={categories}
                  selectedIds={formData.category_ids || []}
                  onSelect={(ids) => setFormData({ ...formData, category_ids: ids })}
                  disabled={!isEditing}
                />
              </div>

              <div className="md:col-span-2">
                <TagsInput
                  tags={formData.tags || []}
                  onChange={(tags) => setFormData({ ...formData, tags })}
                  disabled={!isEditing}
                  placeholder="Добавете етикети за бързо търсене..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                />
              </div>
            </div>
          </section>

          {/* Секция 2: Pricing */}
          <section id="pricing" className="bg-white rounded-lg shadow p-4 md:p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ценообразуване и маржове
            </h2>

            <PricingCalculator
              data={{
                cost_price: formData.cost_price || 0,
                vat_rate: formData.vat_rate || 20,
                margin_percent: formData.margin_percent,
                price: formData.price || 0,
              }}
              onChange={(pricingData) => setFormData({ ...formData, ...pricingData })}
              disabled={!isEditing}
            />
          </section>

          {/* Секция 3: Inventory */}
          <section id="inventory" className="bg-white rounded-lg shadow p-4 md:p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Складови наличности и партиди
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Текуща наличност
                </label>
                <input
                  type="number"
                  value={formData.stock_quantity || 0}
                  onChange={(e) => {
                    setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 });
                    if (errors.stock_quantity) setErrors({ ...errors, stock_quantity: '' });
                  }}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded disabled:bg-gray-100 ${
                    errors.stock_quantity ? 'border-red-500' : ''
                  }`}
                />
                {errors.stock_quantity && (
                  <p className="text-red-500 text-xs mt-1">{errors.stock_quantity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Минимално ниво
                </label>
                <input
                  type="number"
                  value={formData.min_stock_level || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, min_stock_level: parseInt(e.target.value) || 0 })
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                />
              </div>
            </div>

            {product.stock_quantity <= product.min_stock_level && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-red-700 font-medium">Предупреждение за ниско ниво!</p>
                  <p className="text-red-600 text-sm">Текущата наличност е на или под минималното ниво.</p>
                </div>
              </div>
            )}

            {/* Batch Management */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Управление на партиди</h3>
              <BatchTable
                batches={[
                  // Mock data - replace with API call
                  {
                    id: 1,
                    delivery_date: '2024-01-15',
                    expiry_date: '2024-12-31',
                    quantity: 50,
                    location: 'Основен магазин',
                  },
                  {
                    id: 2,
                    delivery_date: '2024-02-01',
                    expiry_date: '2024-03-15',
                    quantity: 30,
                    location: 'Склад',
                  },
                ]}
                onMarkDefective={(id) => console.log('Mark defective:', id)}
                onMove={(id) => console.log('Move batch:', id)}
              />
            </div>
          </section>

          {/* Секция 4: Supply Chain */}
          <section id="supply" className="bg-white rounded-lg shadow p-4 md:p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
              Доставки и снабдяване
            </h2>

            {/* Supplier Info */}
            <div className="mb-8">
              <SupplierInfo
                supplier={null} // Mock - replace with actual data
              />
            </div>

            {/* Order History */}
            <div>
              <h3 className="text-lg font-semibold mb-4">История на поръчките</h3>
              <OrderHistory
                orders={[
                  // Mock data - replace with API call
                ]}
              />
            </div>
          </section>

          {/* Секция 5: Analytics */}
          <section id="analytics" className="bg-white rounded-lg shadow p-4 md:p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Анализи и история
            </h2>

            {/* Stock Chart */}
            <div className="mb-8">
              <StockChart
                data={[
                  // Mock data - replace with API call
                  { date: '2024-01-01', stock: 100 },
                  { date: '2024-01-05', stock: 120 },
                  { date: '2024-01-10', stock: 90 },
                  { date: '2024-01-15', stock: 150 },
                  { date: '2024-01-20', stock: 110 },
                  { date: '2024-01-25', stock: 95 },
                  { date: '2024-01-30', stock: 130 },
                ]}
              />
            </div>

            {/* Audit Log */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Хронология на промените</h3>
              <AuditTimeline
                entries={[
                  // Mock data - replace with API call
                  {
                    id: 1,
                    user: 'Иван Петров',
                    action: 'промени продукта',
                    field: 'price',
                    old_value: '4.59',
                    new_value: '4.99',
                    timestamp: '2024-01-15T14:30:00Z',
                  },
                  {
                    id: 2,
                    user: 'Ева Иванова',
                    action: 'добави наличност',
                    field: 'stock_quantity',
                    old_value: '50',
                    new_value: '100',
                    timestamp: '2024-01-10T09:15:00Z',
                  },
                  {
                    id: 3,
                    user: 'Администратор',
                    action: 'създаде продукта',
                    timestamp: '2024-01-01T10:00:00Z',
                  },
                ]}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
