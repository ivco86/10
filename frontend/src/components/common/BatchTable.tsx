interface Batch {
  id: number;
  delivery_date: string;
  expiry_date: string;
  quantity: number;
  location: string;
}

interface BatchTableProps {
  batches: Batch[];
  onMarkDefective?: (batchId: number) => void;
  onMove?: (batchId: number) => void;
}

export function BatchTable({ batches, onMarkDefective, onMove }: BatchTableProps) {
  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getRowClass = (expiryDate: string) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days < 0) return 'bg-red-100 border-red-300';
    if (days <= 30) return 'bg-orange-100 border-orange-300';
    return '';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  if (batches.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-lg">
        <p className="text-gray-500 mb-4">No active batches</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Batch
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Delivery Date</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Expiry Date</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Days Left</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Location</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch) => {
            const daysLeft = getDaysUntilExpiry(batch.expiry_date);
            return (
              <tr key={batch.id} className={`border-b ${getRowClass(batch.expiry_date)}`}>
                <td className="px-4 py-3 text-sm">{formatDate(batch.delivery_date)}</td>
                <td className="px-4 py-3 text-sm">{formatDate(batch.expiry_date)}</td>
                <td className="px-4 py-3 text-sm">
                  {daysLeft < 0 ? (
                    <span className="text-red-700 font-bold">Expired</span>
                  ) : daysLeft <= 30 ? (
                    <span className="text-orange-700 font-bold">{daysLeft} days</span>
                  ) : (
                    <span>{daysLeft} days</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-medium">{batch.quantity}</td>
                <td className="px-4 py-3 text-sm">{batch.location}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    {onMarkDefective && (
                      <button
                        onClick={() => onMarkDefective(batch.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Mark Defective
                      </button>
                    )}
                    {onMove && (
                      <button
                        onClick={() => onMove(batch.id)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Move
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
