import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Design from './pages/Design';
import Export from './pages/Export';
import useAuthStore from './store/authStore';

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`inline-flex items-center px-4 py-2 text-sm font-medium transition-colors ${
        isActive 
          ? 'text-gray-900 border-b-2 border-gray-900' 
          : 'text-gray-700 hover:text-gray-900'
      }`}
    >
      {children}
    </Link>
  );
};

const Navigation = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-xl font-bold text-gray-900 mr-8 hover:text-gray-700 transition-all duration-200 hover:scale-105"
            >
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                VistoAPP
              </span>
            </Link>
            <div className="hidden md:flex space-x-1">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/about">About</NavLink>
              <NavLink to="/contact">Contact</NavLink>
            </div>
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <Link 
                to="/dashboard" 
                className="inline-flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username || 'User'}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-xs font-semibold">
                      {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors duration-200"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/design" element={<Design />} />
          <Route path="/dashboard/export" element={<Export />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
