import { ProfileView } from './ProfileView';

/**
 * Example 1: Basic usage with token
 */
export function BasicProfileExample() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

  return <ProfileView token={token} />;
}

/**
 * Example 2: With navigation callback
 */
export function ProfileWithNavigationExample() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

  const handleBack = () => {
    console.log('Navigating back to dashboard');
    // Navigate to dashboard or previous page
  };

  return <ProfileView token={token} onNavigateBack={handleBack} />;
}

/**
 * Example 3: Integrated with authentication context
 */
export function ProfileWithAuthExample() {
  // In a real app, you'd get this from your auth context/store
  const { token, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in to view your profile</div>;
  }

  return <ProfileView token={token} />;
}

/**
 * Example 4: As a route component
 */
export function ProfileRoute() {
  const navigate = useNavigate();
  const { token } = useAuth();

  return (
    <div className="profile-page">
      <ProfileView token={token} onNavigateBack={() => navigate('/dashboard')} />
    </div>
  );
}

/**
 * Mock useAuth and useNavigate for examples
 */
function useAuth() {
  return {
    token: 'mock-token',
    isAuthenticated: true,
  };
}

function useNavigate() {
  return (path: string) => console.log('Navigate to:', path);
}
