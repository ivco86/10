import { useState, useEffect } from 'react';
import { Product } from '../types';
import { productsApi } from '../api/products';
import { salesApi } from '../api/sales';
import { useCartStore } from '../store/cartStore';

export function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashReceived, setCashReceived] = useState('');
  const { items, addItem, removeItem, updateQuantity, clearCart, getSubtotal, getVAT, getTotal } = useCartStore();

  useEffect(() => {
    loadProducts();
  }, []);

  const normalizeProduct = (p: Product): Product => ({
    ...p,
    price: Number(p.price || 0),
    vat_rate: Number(p.vat_rate || 0),
    stock_quantity: Number(p.stock_quantity || 0),
  });

  const loadProducts = async () => {
    const { data } = await productsApi.list();
    setProducts(data.items.map(normalizeProduct));
  };

  const handleSearch = async (q: string) => {
    setSearch(q);
    if (q.length >= 2) {
      const { data } = await productsApi.search(q);
      setProducts(Array.isArray(data) ? data.map(normalizeProduct) : data.items?.map(normalizeProduct) || []);
    } else {
      loadProducts();
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    try {
      await salesApi.create({
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          discount_amount: i.discount
        })),
        payment_method: paymentMethod,
        cash_received: paymentMethod === 'cash' ? parseFloat(cashReceived) : undefined
      });
      clearCart();
      setCashReceived('');
      alert('Sale completed!');
    } catch (err) {
      alert('Error processing sale');
    }
  };

  const change = paymentMethod === 'cash' && cashReceived
    ? parseFloat(cashReceived) - getTotal()
    : 0;

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)]">
      {/* Products */}
      <div className="flex-1 flex flex-col">
        <input
          type="text"
          placeholder="Search products or scan barcode..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg mb-4 text-lg"
          autoFocus
        />
        <div className="grid grid-cols-3 gap-3 overflow-y-auto">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => addItem(p)}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md text-left"
            >
              <div className="font-medium">{p.name}</div>
              <div className="text-blue-600 font-bold">${Number(p.price || 0).toFixed(2)}</div>
              <div className="text-sm text-gray-500">Stock: {p.stock_quantity}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="w-96 bg-white rounded-lg shadow flex flex-col">
        <div className="p-4 border-b font-bold text-lg">Cart</div>
        <div className="flex-1 overflow-y-auto p-4">
          {items.map((item) => (
            <div key={item.product.id} className="flex items-center justify-between py-2 border-b">
              <div className="flex-1">
                <div className="font-medium">{item.product.name}</div>
                <div className="text-gray-600">${Number(item.product.price || 0).toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="w-8 h-8 bg-gray-200 rounded"
                >-</button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="w-8 h-8 bg-gray-200 rounded"
                >+</button>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="text-red-500 ml-2"
                >X</button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t">
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>${getSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>VAT:</span>
            <span>${getVAT().toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-xl mb-4">
            <span>Total:</span>
            <span>${getTotal().toFixed(2)}</span>
          </div>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`flex-1 py-2 rounded ${paymentMethod === 'cash' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >Cash</button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 py-2 rounded ${paymentMethod === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >Card</button>
          </div>
          {paymentMethod === 'cash' && (
            <div className="mb-4">
              <input
                type="number"
                placeholder="Cash received"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
              {change > 0 && <div className="text-green-600 mt-2">Change: ${change.toFixed(2)}</div>}
            </div>
          )}
          <button
            onClick={handleCheckout}
            disabled={items.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400"
          >
            Complete Sale
          </button>
        </div>
      </div>
    </div>
  );
}
