import { useState, useEffect } from 'react';

interface PricingData {
  cost_price: number;
  vat_rate: number;
  margin_percent?: number;
  price: number;
}

interface PricingCalculatorProps {
  data: PricingData;
  onChange: (data: Partial<PricingData>) => void;
  disabled?: boolean;
}

export function PricingCalculator({ data, onChange, disabled }: PricingCalculatorProps) {
  const [calculationMode, setCalculationMode] = useState<'margin' | 'price'>('margin');

  // Normalize data to ensure numbers
  const normalizedData = {
    cost_price: Number(data.cost_price || 0),
    vat_rate: Number(data.vat_rate || 0),
    margin_percent: data.margin_percent !== undefined ? Number(data.margin_percent) : undefined,
    price: Number(data.price || 0),
  };

  const calculatePrice = (costPrice: number, marginPercent: number, vatRate: number): number => {
    if (!costPrice || marginPercent === undefined) return 0;
    const priceBeforeVat = costPrice * (1 + marginPercent / 100);
    return priceBeforeVat * (1 + vatRate / 100);
  };

  const calculateMargin = (price: number, costPrice: number, vatRate: number): number => {
    if (!price || !costPrice) return 0;
    const priceBeforeVat = price / (1 + vatRate / 100);
    return ((priceBeforeVat - costPrice) / costPrice) * 100;
  };

  const calculateProfit = (): number => {
    if (!normalizedData.price || !normalizedData.cost_price) return 0;
    const priceBeforeVat = normalizedData.price / (1 + normalizedData.vat_rate / 100);
    return priceBeforeVat - normalizedData.cost_price;
  };

  const handleCostPriceChange = (value: number) => {
    if (calculationMode === 'margin' && normalizedData.margin_percent !== undefined) {
      const newPrice = calculatePrice(value, normalizedData.margin_percent, normalizedData.vat_rate);
      onChange({ cost_price: value, price: newPrice });
    } else if (calculationMode === 'price') {
      const newMargin = calculateMargin(normalizedData.price, value, normalizedData.vat_rate);
      onChange({ cost_price: value, margin_percent: newMargin });
    } else {
      onChange({ cost_price: value });
    }
  };

  const handleVatRateChange = (value: number) => {
    if (calculationMode === 'margin' && normalizedData.margin_percent !== undefined) {
      const newPrice = calculatePrice(normalizedData.cost_price, normalizedData.margin_percent, value);
      onChange({ vat_rate: value, price: newPrice });
    } else if (calculationMode === 'price') {
      const newMargin = calculateMargin(normalizedData.price, normalizedData.cost_price, value);
      onChange({ vat_rate: value, margin_percent: newMargin });
    } else {
      onChange({ vat_rate: value });
    }
  };

  const handleMarginChange = (value: number) => {
    setCalculationMode('margin');
    const newPrice = calculatePrice(normalizedData.cost_price, value, normalizedData.vat_rate);
    onChange({ margin_percent: value, price: newPrice });
  };

  const handlePriceChange = (value: number) => {
    setCalculationMode('price');
    const newMargin = calculateMargin(value, normalizedData.cost_price, normalizedData.vat_rate);
    onChange({ price: value, margin_percent: newMargin });
  };

  // Calculate margin if not set
  useEffect(() => {
    if (normalizedData.margin_percent === undefined && normalizedData.price && normalizedData.cost_price) {
      const margin = calculateMargin(normalizedData.price, normalizedData.cost_price, normalizedData.vat_rate);
      onChange({ margin_percent: margin });
    }
  }, []);

  const profit = calculateProfit();
  const marginPercent = normalizedData.margin_percent ?? calculateMargin(normalizedData.price, normalizedData.cost_price, normalizedData.vat_rate);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cost Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Доставна цена (без ДДС)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              value={normalizedData.cost_price || ''}
              onChange={(e) => handleCostPriceChange(parseFloat(e.target.value) || 0)}
              disabled={disabled}
              className="w-full px-3 py-2 border rounded disabled:bg-gray-100 pr-12"
              placeholder="0.00"
            />
            <span className="absolute right-3 top-2 text-gray-500">лв.</span>
          </div>
        </div>

        {/* VAT Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ДДС ставка
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={normalizedData.vat_rate || ''}
              onChange={(e) => handleVatRateChange(parseFloat(e.target.value) || 0)}
              disabled={disabled}
              className="w-full px-3 py-2 border rounded disabled:bg-gray-100 pr-8"
              placeholder="20"
            />
            <span className="absolute right-3 top-2 text-gray-500">%</span>
          </div>
        </div>

        {/* Margin Percent */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Надценка (Марж)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              value={marginPercent.toFixed(2)}
              onChange={(e) => handleMarginChange(parseFloat(e.target.value) || 0)}
              disabled={disabled}
              className={`w-full px-3 py-2 border rounded disabled:bg-gray-100 pr-8 ${
                calculationMode === 'margin' ? 'border-blue-500 ring-1 ring-blue-500' : ''
              }`}
              placeholder="0"
            />
            <span className="absolute right-3 top-2 text-gray-500">%</span>
          </div>
          {calculationMode === 'margin' && !disabled && (
            <p className="text-xs text-blue-600 mt-1">
              Цената се изчислява автоматично
            </p>
          )}
        </div>
      </div>

      {/* Selling Price - Full Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Продажна цена (с ДДС)
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.01"
            min="0"
            value={normalizedData.price.toFixed(2)}
            onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
            disabled={disabled}
            className={`w-full md:w-1/3 px-3 py-2 border rounded disabled:bg-gray-100 pr-12 text-lg font-semibold ${
              calculationMode === 'price' ? 'border-blue-500 ring-1 ring-blue-500' : ''
            }`}
            placeholder="0.00"
          />
          <span className="absolute left-80 top-2 text-gray-500 text-lg">лв.</span>
        </div>
        {calculationMode === 'price' && !disabled && (
          <p className="text-xs text-blue-600 mt-1">
            Маржът се изчислява автоматично
          </p>
        )}
      </div>

      {/* Profit Display */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Надценка (Марж)</p>
            <p className="text-2xl font-bold text-green-700">
              {marginPercent.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Печалба на единица</p>
            <p className="text-2xl font-bold text-green-700">
              {profit.toFixed(2)} лв.
            </p>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="mt-4 pt-4 border-t border-green-200 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Доставна цена:</span>
            <span className="font-medium">{normalizedData.cost_price.toFixed(2)} лв.</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Печалба:</span>
            <span className="font-medium text-green-700">+{profit.toFixed(2)} лв.</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Цена без ДДС:</span>
            <span className="font-medium">
              {(normalizedData.price / (1 + normalizedData.vat_rate / 100)).toFixed(2)} лв.
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">ДДС ({normalizedData.vat_rate}%):</span>
            <span className="font-medium">
              +{(normalizedData.price - normalizedData.price / (1 + normalizedData.vat_rate / 100)).toFixed(2)} лв.
            </span>
          </div>
          <div className="flex justify-between border-t border-green-300 pt-1 mt-1">
            <span className="font-semibold text-gray-900">Крайна цена:</span>
            <span className="font-bold text-green-700">{normalizedData.price.toFixed(2)} лв.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
