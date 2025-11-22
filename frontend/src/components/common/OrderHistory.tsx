interface Order {
  id: number;
  order_number: string;
  supplier_name: string;
  order_date: string;
  delivery_date?: string;
  quantity: number;
  status: 'pending' | 'delivered' | 'cancelled';
  total_cost: number;
}

interface OrderHistoryProps {
  orders: Order[];
}

export function OrderHistory({ orders }: OrderHistoryProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('bg-BG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: Order['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
    };

    const labels = {
      pending: 'В изчакване',
      delivered: 'Доставена',
      cancelled: 'Отказана',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-gray-500 mb-4">Няма данни за поръчки</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Създай поръчка
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              № Поръчка
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              Доставчик
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              Дата на поръчка
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              Дата на доставка
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              Количество
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              Обща стойност
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              Статус
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-blue-600">
                {order.order_number}
              </td>
              <td className="px-4 py-3 text-sm">{order.supplier_name}</td>
              <td className="px-4 py-3 text-sm">{formatDate(order.order_date)}</td>
              <td className="px-4 py-3 text-sm">
                {order.delivery_date ? formatDate(order.delivery_date) : '-'}
              </td>
              <td className="px-4 py-3 text-sm font-medium">{order.quantity}</td>
              <td className="px-4 py-3 text-sm font-medium">
                {order.total_cost.toFixed(2)} лв.
              </td>
              <td className="px-4 py-3 text-sm">{getStatusBadge(order.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface SupplierInfoProps {
  supplier?: {
    name: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    manufacturer_code?: string;
    min_order_quantity?: number;
  } | null;
}

export function SupplierInfo({ supplier }: SupplierInfoProps) {
  if (!supplier) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-500 mb-3">Няма данни за основен доставчик</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Добави доставчик
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h4 className="font-semibold text-gray-900 mb-4">Основен доставчик</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">Име на доставчик</label>
          <p className="font-medium">{supplier.name}</p>
        </div>
        {supplier.contact_person && (
          <div>
            <label className="text-sm text-gray-600">Контактно лице</label>
            <p className="font-medium">{supplier.contact_person}</p>
          </div>
        )}
        {supplier.phone && (
          <div>
            <label className="text-sm text-gray-600">Телефон</label>
            <p className="font-medium">{supplier.phone}</p>
          </div>
        )}
        {supplier.email && (
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <p className="font-medium">{supplier.email}</p>
          </div>
        )}
        {supplier.manufacturer_code && (
          <div>
            <label className="text-sm text-gray-600">Код на производител</label>
            <p className="font-medium">{supplier.manufacturer_code}</p>
          </div>
        )}
        {supplier.min_order_quantity && (
          <div>
            <label className="text-sm text-gray-600">Минимално количество</label>
            <p className="font-medium">{supplier.min_order_quantity} бр.</p>
          </div>
        )}
      </div>
    </div>
  );
}
