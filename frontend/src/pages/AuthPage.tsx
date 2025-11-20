import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegistrationForm } from '../components/RegistrationForm';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'login' | 'register';

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleAuthSuccess = async (token: string, userId: string) => {
    // Fetch user data and update auth context
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        login(token, userData);
        
        // Redirect to last accessed quest or dashboard
        const lastQuest = localStorage.getItem('lastQuestId');
        if (lastQuest) {
          navigate(`/quest/${lastQuest}`);
        } else {
          navigate('/dashboard');
        }
      } else {
        // Fallback: navigate to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Fallback: navigate to dashboard
      navigate('/dashboard');
    }
  };

  return (
    <>
      {mode === 'login' ? (
        <LoginForm
          onSuccess={handleAuthSuccess}
          onSwitchToRegister={() => setMode('register')}
        />
      ) : (
        <RegistrationForm
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={() => setMode('login')}
        />
      )}
    </>
  );
}
