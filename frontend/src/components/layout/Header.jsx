import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaSignOutAlt, FaUser, FaTachometerAlt } from 'react-icons/fa';

const Header = () => {
  const { logout, isAuthenticated, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          {isAuthenticated && (
            <div className="header-left">
              <Link to="/dashboard" className="dashboard-link">
                <FaTachometerAlt />
                <span className="dashboard-text">Dashboard</span>
              </Link>
            </div>
          )}
          <h1 className="app-title">Task Manager</h1>
          {isAuthenticated && (
            <div className="header-actions">
              <div className="user-info">
                <FaUser className="user-icon" />
                <span className="user-name">{user?.name}</span>
              </div>
              <button 
                className="logout-btn"
                onClick={handleLogout}
                title="Logout"
              >
                <FaSignOutAlt />
                <span className="logout-text">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;