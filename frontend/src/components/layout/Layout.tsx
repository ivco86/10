import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col sidebar-scroll">
        {/* Top Links */}
        <div className="py-4 border-b-2 border-gray-200">
          <Link
            to="/pos"
            className={`flex items-center px-5 py-3 mx-2 rounded text-blue-600 hover:bg-blue-50 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all ${
              isActive('/pos') ? 'bg-blue-50 border-l-4 border-blue-500 pl-4' : ''
            }`}
          >
            <i className="fa-solid fa-cash-register text-xl w-6 text-center mr-3"></i>
            <span className="font-semibold text-base">КАСА</span>
          </Link>
          <Link
            to="/"
            className={`flex items-center px-5 py-3 mx-2 rounded text-blue-600 hover:bg-blue-50 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all ${
              isActive('/') ? 'bg-blue-50 border-l-4 border-blue-500 pl-4' : ''
            }`}
          >
            <i className="fa-solid fa-house text-xl w-6 text-center mr-3"></i>
            <span className="font-semibold text-base">НАЧАЛО</span>
          </Link>
        </div>

        {/* Menu Groups */}
        <nav className="flex-1 overflow-y-auto">
          {/* Group 1: ПРОДУКТИ */}
          <div className="mt-1">
            <div className="bg-blue-500 text-white px-5 py-3 text-xs font-bold uppercase tracking-wider">
              ПРОДУКТИ
            </div>
            <div className="bg-gray-50">
              <Link
                to="/products"
                className={`flex items-center px-5 py-3 text-sm text-blue-900 hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all border-l-4 border-transparent ${
                  isActive('/products') ? 'bg-blue-100 border-l-4 border-blue-500 pl-4 font-semibold' : ''
                }`}
              >
                <i className="fa-solid fa-box text-blue-500 text-sm w-5 text-center mr-3"></i>
                <span>Продукти</span>
              </Link>
              <button
                onClick={() => {
                  navigate('/products');
                  setTimeout(() => {
                    const event = new CustomEvent('openProductForm');
                    window.dispatchEvent(event);
                  }, 100);
                }}
                className="w-full flex items-center px-5 py-3 text-sm text-blue-900 hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all border-l-4 border-transparent text-left"
              >
                <i className="fa-solid fa-plus-circle text-blue-500 text-sm w-5 text-center mr-3"></i>
                <span>Добави нов продукт</span>
              </button>
              <a
                href="#"
                className="flex items-center px-5 py-3 text-sm text-blue-900 hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all border-l-4 border-transparent"
              >
                <i className="fa-solid fa-tags text-blue-500 text-sm w-5 text-center mr-3"></i>
                <span>Бързи цени</span>
              </a>
              <a
                href="#"
                className="flex items-center px-5 py-3 text-sm text-blue-900 hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all border-l-4 border-transparent"
              >
                <i className="fa-solid fa-calendar-xmark text-blue-500 text-sm w-5 text-center mr-3"></i>
                <span>Срок на годност</span>
              </a>
              <a
                href="#"
                className="flex items-center px-5 py-3 text-sm text-blue-900 hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all border-l-4 border-transparent"
              >
                <i className="fa-solid fa-percent text-blue-500 text-sm w-5 text-center mr-3"></i>
                <span>Промоции</span>
              </a>
              <a
                href="#"
                className="flex items-center px-5 py-3 text-sm text-blue-900 hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all border-l-4 border-transparent"
              >
                <i className="fa-solid fa-layer-group text-blue-500 text-sm w-5 text-center mr-3"></i>
                <span>Категории</span>
              </a>
              <a
                href="#"
                className="flex items-center px-5 py-3 text-sm text-blue-900 hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all border-l-4 border-transparent"
              >
                <i className="fa-solid fa-industry text-blue-500 text-sm w-5 text-center mr-3"></i>
                <span>Производители</span>
              </a>
              <Link
                to="/suppliers"
                className={`flex items-center px-5 py-3 text-sm text-blue-900 hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all border-l-4 border-transparent ${
                  isActive('/suppliers') ? 'bg-blue-100 border-l-4 border-blue-500 pl-4 font-semibold' : ''
                }`}
              >
                <i className="fa-solid fa-truck text-blue-500 text-sm w-5 text-center mr-3"></i>
                <span>Доставчици</span>
              </Link>
              <a
                href="#"
                className="flex items-center px-5 py-3 text-sm text-blue-900 hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all border-l-4 border-transparent"
              >
                <i className="fa-solid fa-tag text-blue-500 text-sm w-5 text-center mr-3"></i>
                <span>Етикети</span>
              </a>
              <a
                href="#"
                className="flex items-center px-5 py-3 text-sm text-blue-900 hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all border-l-4 border-transparent"
              >
                <i className="fa-solid fa-money-bill-trend-up text-blue-500 text-sm w-5 text-center mr-3"></i>
                <span>Промяна на цени</span>
              </a>
              <a
                href="#"
                className="flex items-center px-5 py-3 text-sm text-blue-900 hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all border-l-4 border-transparent"
              >
                <i className="fa-solid fa-trash-can text-blue-500 text-sm w-5 text-center mr-3"></i>
                <span>Кошче</span>
              </a>
            </div>
          </div>

          {/* Group 2: МАГАЗИНИ */}
          <div className="mt-1">
            <div className="bg-blue-500 text-white px-5 py-3 text-xs font-bold uppercase tracking-wider">
              МАГАЗИНИ
            </div>
            <div className="bg-gray-50">
              <a
                href="#"
                className="flex items-center px-5 py-3 text-sm text-blue-900 hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all border-l-4 border-transparent"
              >
                <i className="fa-solid fa-scale-balanced text-blue-500 text-sm w-5 text-center mr-3"></i>
                <span>Баланс при приключване</span>
              </a>
            </div>
          </div>

          {/* Group 3: СТОКИ */}
          <div className="mt-1">
            <div className="bg-blue-500 text-white px-5 py-3 text-xs font-bold uppercase tracking-wider">
              СТОКИ
            </div>
            <div className="bg-gray-50">
              <a
                href="#"
                className="flex items-center px-5 py-3 text-sm text-blue-900 hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all border-l-4 border-transparent"
              >
                <i className="fa-solid fa-truck-ramp-box text-blue-500 text-sm w-5 text-center mr-3"></i>
                <span>Доставки</span>
              </a>
              <a
                href="#"
                className="flex items-center px-5 py-3 text-sm text-blue-900 hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all border-l-4 border-transparent"
              >
                <i className="fa-solid fa-box-archive text-blue-500 text-sm w-5 text-center mr-3"></i>
                <span>Отписани продукти</span>
              </a>
              <a
                href="#"
                className="flex items-center px-5 py-3 text-sm text-blue-900 hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all border-l-4 border-transparent"
              >
                <i className="fa-solid fa-clipboard-list text-blue-500 text-sm w-5 text-center mr-3"></i>
                <span>Списък заявки</span>
              </a>
            </div>
          </div>

          {/* Group 4: СТАТИСТИКИ */}
          <div className="mt-1">
            <div className="bg-blue-500 text-white px-5 py-3 text-xs font-bold uppercase tracking-wider">
              СТАТИСТИКИ
            </div>
            <div className="bg-gray-50">
              <a
                href="#"
                className="flex items-center px-5 py-3 text-sm text-blue-900 hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all border-l-4 border-transparent"
              >
                <i className="fa-solid fa-warehouse text-blue-500 text-sm w-5 text-center mr-3"></i>
                <span>Наличности</span>
              </a>
              <a
                href="#"
                className="flex items-center px-5 py-3 text-sm text-blue-900 hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all border-l-4 border-transparent"
              >
                <i className="fa-solid fa-chart-line text-blue-500 text-sm w-5 text-center mr-3"></i>
                <span>Статистики</span>
              </a>
              <a
                href="#"
                className="flex items-center px-5 py-3 text-sm text-blue-900 hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all border-l-4 border-transparent"
              >
                <i className="fa-solid fa-triangle-exclamation text-blue-500 text-sm w-5 text-center mr-3"></i>
                <span>Проблеми</span>
              </a>
              <a
                href="#"
                className="flex items-center px-5 py-3 text-sm text-blue-900 hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all border-l-4 border-transparent"
              >
                <i className="fa-solid fa-ban text-blue-500 text-sm w-5 text-center mr-3"></i>
                <span>Непродаваеми продукти</span>
              </a>
            </div>
          </div>

          {/* Group 5: ПОДДРЪЖКА */}
          <div className="mt-1">
            <div className="bg-blue-500 text-white px-5 py-3 text-xs font-bold uppercase tracking-wider">
              ПОДДРЪЖКА
            </div>
            <div className="bg-gray-50">
              <a
                href="#"
                className="flex items-center px-5 py-3 text-sm text-blue-900 hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 hover:pl-4 transition-all border-l-4 border-transparent"
              >
                <i className="fa-solid fa-screwdriver-wrench text-blue-500 text-sm w-5 text-center mr-3"></i>
                <span>Поддръжка</span>
              </a>
            </div>
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="text-sm text-gray-600 mb-2">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            Изход
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <h1 className="text-xl font-bold text-gray-900">POS Terminal</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
