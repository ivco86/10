interface AuditEntry {
  id: number;
  user: string;
  action: string;
  field?: string;
  old_value?: string;
  new_value?: string;
  timestamp: string;
}

interface AuditTimelineProps {
  entries: AuditEntry[];
}

export function AuditTimeline({ entries }: AuditTimelineProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No edit history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => (
        <div key={entry.id} className="flex gap-4">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-blue-600 rounded-full" />
            {index < entries.length - 1 && (
              <div className="w-0.5 h-full bg-gray-300 my-1" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium text-gray-900">{entry.user}</span>
                  <span className="text-gray-600 ml-2">{entry.action}</span>
                </div>
                <span className="text-sm text-gray-500">{formatTime(entry.timestamp)}</span>
              </div>

              {entry.field && (
                <div className="text-sm text-gray-700 mt-2">
                  Changed <span className="font-semibold">{entry.field}</span>
                  {entry.old_value && entry.new_value && (
                    <>
                      {' '}from <span className="bg-red-100 px-2 py-0.5 rounded">{entry.old_value}</span>
                      {' '}to <span className="bg-green-100 px-2 py-0.5 rounded">{entry.new_value}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
