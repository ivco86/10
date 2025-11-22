import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { suppliersApi } from '../api/suppliers';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/common/Toast';

interface SupplierDetail {
  id: number;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  tax_number: string | null;
  registration_number: string | null;
  bank_account: string | null;
  bank_name: string | null;
  payment_terms: string | null;
  min_order_amount: number | null;
  delivery_days: number | null;
  notes: string | null;
  is_active: boolean;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  supplier_code: string;
  last_price: number;
  last_delivery: string;
}

export function SupplierDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<SupplierDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<SupplierDetail>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'info' | 'products' | 'orders'>('info');
  const { toasts, removeToast, success, error: showError } = useToast();
  const isNew = id === 'new';

  useEffect(() => {
    if (!isNew && id) {
      loadSupplier(parseInt(id));
      loadProducts(parseInt(id));
    } else {
      setIsEditing(true);
      setFormData({
        is_active: true,
        country: 'България',
      });
    }
  }, [id, isNew]);

  const loadSupplier = async (supplierId: number) => {
    try {
      const { data } = await suppliersApi.get(supplierId);
      setSupplier(data);
      setFormData(data);
    } catch (err) {
      showError('Грешка при зареждане на доставчика');
    }
  };

  const loadProducts = async (supplierId: number) => {
    try {
      const { data } = await suppliersApi.getProducts(supplierId);
      setProducts(data);
    } catch (err) {
      console.error('Could not load products');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Името е задължително';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Невалиден email адрес';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showError('Моля, коригирайте грешките във формата');
      return;
    }

    try {
      if (isNew) {
        const { data } = await suppliersApi.create(formData);
        success('Доставчикът беше създаден успешно!');
        navigate(`/suppliers/${data.id}`);
      } else if (supplier?.id) {
        await suppliersApi.update(supplier.id, formData);
        await loadSupplier(supplier.id);
        setIsEditing(false);
        success('Доставчикът беше запазен успешно!');
      }
    } catch (err) {
      showError('Грешка при запазване на доставчика');
    }
  };

  const handleDelete = async () => {
    if (!supplier?.id) return;
    if (confirm(`Сигурни ли сте, че искате да изтриете доставчик "${supplier.name}"?`)) {
      try {
        await suppliersApi.delete(supplier.id);
        success('Доставчикът беше изтрит');
        navigate('/suppliers');
      } catch (err) {
        showError('Грешка при изтриване на доставчика');
      }
    }
  };

  if (!isNew && !supplier) {
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
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/suppliers')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Назад
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isNew ? 'Нов доставчик' : formData.name || 'Доставчик'}
              </h1>
              {!isNew && supplier && (
                <div className="flex gap-3 mt-1 text-sm text-gray-600">
                  {supplier.tax_number && <span>ДДС: {supplier.tax_number}</span>}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      supplier.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {supplier.is_active ? 'Активен' : 'Неактивен'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  {isNew ? 'Създай' : 'Запази'}
                </button>
                {!isNew && (
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(supplier!);
                      setErrors({});
                    }}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                  >
                    Отказ
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Редакция
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                >
                  Изтрий
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        {!isNew && (
          <div className="flex gap-4 mt-4 border-b">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Информация
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Продукти ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              История на поръчките
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-6xl mx-auto">
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Основна информация
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Име на доставчик *
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Контактно лице
                  </label>
                  <input
                    type="text"
                    value={formData.contact_person || ''}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded disabled:bg-gray-100 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ДДС номер
                  </label>
                  <input
                    type="text"
                    value={formData.tax_number || ''}
                    onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ЕИК/Булстат
                  </label>
                  <input
                    type="text"
                    value={formData.registration_number || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, registration_number: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active ?? true}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      disabled={!isEditing}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Активен доставчик</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Адрес
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Адрес</label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Град</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Пощенски код
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code || ''}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Държава</label>
                  <input
                    type="text"
                    value={formData.country || ''}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Banking & Payment */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Банкова информация и плащания
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Име на банка
                  </label>
                  <input
                    type="text"
                    value={formData.bank_name || ''}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IBAN</label>
                  <input
                    type="text"
                    value={formData.bank_account || ''}
                    onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Условия за плащане
                  </label>
                  <input
                    type="text"
                    placeholder="напр. 30 дни"
                    value={formData.payment_terms || ''}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Минимална сума за поръчка (лв.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.min_order_amount || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, min_order_amount: parseFloat(e.target.value) || null })
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Срок на доставка (дни)
                  </label>
                  <input
                    type="number"
                    value={formData.delivery_days || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, delivery_days: parseInt(e.target.value) || null })
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Бележки
              </h2>

              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={!isEditing}
                rows={4}
                className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                placeholder="Допълнителна информация за доставчика..."
              />
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-gray-500">Няма продукти от този доставчик</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Продукт
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Код на доставчик
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Последна цена
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Последна доставка
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{product.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.sku}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.supplier_code}</td>
                        <td className="px-6 py-4 text-sm font-medium">{product.last_price.toFixed(2)} лв.</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(product.last_delivery).toLocaleDateString('bg-BG')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow">
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500">Историята на поръчките ще бъде налична скоро</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
