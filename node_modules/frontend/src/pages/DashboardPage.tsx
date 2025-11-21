import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

export function DashboardPage() {
  const navigate = useNavigate();

  const handleStartQuest = () => {
    // Navigate to quests page
    navigate('/quests');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>GitQuest Dashboard</h1>
      </header>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome to GitQuest!</h2>
          <p className="user-stats">
            Start your journey to master Git
          </p>
        </div>

        <div className="dashboard-actions">
          <button onClick={handleStartQuest} className="action-button primary">
            Start Learning
          </button>
        </div>

        <div className="dashboard-info">
          <p>Your adventure as a Chrono-Coder begins now...</p>
        </div>
      </div>
    </div>
  );
}
