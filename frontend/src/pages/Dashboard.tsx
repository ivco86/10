import { Link } from 'react-router-dom';

export function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-3 gap-6">
        <Link to="/pos" className="bg-blue-600 text-white p-6 rounded-lg text-center hover:bg-blue-700">
          <div className="text-3xl mb-2">POS</div>
          <div>Start selling</div>
        </Link>
        <Link to="/products" className="bg-green-600 text-white p-6 rounded-lg text-center hover:bg-green-700">
          <div className="text-3xl mb-2">Products</div>
          <div>Manage inventory</div>
        </Link>
        <Link to="/reports" className="bg-purple-600 text-white p-6 rounded-lg text-center hover:bg-purple-700">
          <div className="text-3xl mb-2">Reports</div>
          <div>View sales data</div>
        </Link>
      </div>
    </div>
  );
}
