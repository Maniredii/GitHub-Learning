import { useState, FormEvent } from 'react';
import { login } from '../services/authApi';
import './LoginForm.css';

interface LoginFormProps {
  onSuccess: (token: string, userId: string) => void;
  onSwitchToRegister: () => void;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await login({ email, password });
      
      // Store JWT token and user data in localStorage
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userId', response.user.id);
      localStorage.setItem('userProgress', JSON.stringify({
        level: response.user.level,
        xp: response.user.xp,
        username: response.user.username,
      }));
      
      // Call success callback
      onSuccess(response.token, response.user.id);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Login failed. Please check your credentials.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-form-card">
        <h2 className="login-form-title">Welcome Back</h2>
        <p className="login-form-subtitle">Continue your Chrono-Coder journey</p>

        <form onSubmit={handleSubmit} className="login-form">
          {errors.general && (
            <div className="form-error-banner" role="alert">
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`form-input ${errors.email ? 'form-input-error' : ''}`}
              placeholder="your.email@example.com"
              disabled={isLoading}
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className="form-error" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`form-input ${errors.password ? 'form-input-error' : ''}`}
              placeholder="••••••••"
              disabled={isLoading}
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <span id="password-error" className="form-error" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="form-submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="form-footer">
          <p>
            New to GitQuest?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="form-link-button"
              disabled={isLoading}
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
