interface DataPoint {
  date: string;
  stock: number;
}

interface StockChartProps {
  data: DataPoint[];
}

export function StockChart({ data }: StockChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No stock history available</p>
      </div>
    );
  }

  const maxStock = Math.max(...data.map(d => d.stock));
  const minStock = Math.min(...data.map(d => d.stock));
  const range = maxStock - minStock || 1;

  const getY = (value: number) => {
    return 100 - ((value - minStock) / range) * 80; // 80% of height for data, 20% for padding
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
  };

  return (
    <div>
      <div className="flex justify-between mb-2 text-sm text-gray-600">
        <span>Stock Level History</span>
        <span>Last 30 days</span>
      </div>
      <div className="relative h-64 bg-gray-50 rounded-lg p-4">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
          <span>{maxStock}</span>
          <span>{Math.round((maxStock + minStock) / 2)}</span>
          <span>{minStock}</span>
        </div>

        {/* Chart area */}
        <svg className="w-full h-full ml-8" viewBox="0 0 400 200" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="400"
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          ))}

          {/* Line */}
          <polyline
            points={data.map((d, i) => {
              const x = (i / (data.length - 1)) * 400;
              const y = getY(d.stock);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
          />

          {/* Points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 400;
            const y = getY(d.stock);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill="#3b82f6"
              />
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500 ml-8">
          <span>{formatDate(data[0].date)}</span>
          <span>{formatDate(data[Math.floor(data.length / 2)].date)}</span>
          <span>{formatDate(data[data.length - 1].date)}</span>
        </div>
      </div>
    </div>
  );
}
