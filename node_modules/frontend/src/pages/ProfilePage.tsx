import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProfileView } from '../components/ProfileView';

/**
 * ProfilePage - Full page wrapper for the ProfileView component
 *
 * This page component demonstrates how to integrate ProfileView
 * into a real application with routing and authentication.
 */

export function ProfilePage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  if (!token) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-page-container">
      <ProfileView token={token} onNavigateBack={() => navigate('/dashboard')} />
    </div>
  );
}

/**
 * Example usage with React Router:
 *
 * import { useNavigate } from 'react-router-dom';
 * import { ProfilePage } from './pages/ProfilePage';
 *
 * function App() {
 *   const navigate = useNavigate();
 *   const token = localStorage.getItem('authToken') || '';
 *
 *   return (
 *     <Routes>
 *       <Route
 *         path="/profile"
 *         element={
 *           <ProfilePage
 *             token={token}
 *             onNavigateBack={() => navigate('/dashboard')}
 *           />
 *         }
 *       />
 *     </Routes>
 *   );
 * }
 */
