import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  const handleStartQuest = () => {
    // Navigate to first quest or progress map
    navigate('/map');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>GitQuest Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome back, {user?.username}!</h2>
          <p className="user-stats">
            Level {user?.level} • {user?.xp} XP
          </p>
        </div>

        <div className="dashboard-actions">
          <button onClick={handleStartQuest} className="action-button primary">
            Continue Journey
          </button>
          <button onClick={handleViewProfile} className="action-button secondary">
            View Profile
          </button>
        </div>

        <div className="dashboard-info">
          <p>Your adventure as a Chrono-Coder continues...</p>
        </div>
      </div>
    </div>
  );
}
