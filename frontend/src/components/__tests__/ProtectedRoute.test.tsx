import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { AuthProvider } from '../../contexts/AuthContext';
import * as authApi from '../../services/authApi';

vi.mock('../../services/authApi');

describe('ProtectedRoute', () => {
  const TestComponent = () => <div>Protected Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('shows loading state while checking authentication', async () => {
    vi.mocked(authApi.verifyToken).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );
    
    localStorage.setItem('authToken', 'test-token');

    render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText(/loading/i)).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', async () => {
    vi.mocked(authApi.verifyToken).mockResolvedValue({ valid: false });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <TestComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText(/login page/i)).toBeInTheDocument();
  });

  it('calls verifyToken when token exists in localStorage', async () => {
    const mockUser = {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      level: 1,
      xp: 0,
    };

    // Set up mock to return valid token
    vi.mocked(authApi.verifyToken).mockResolvedValue({
      valid: true,
      user: mockUser,
    });

    localStorage.setItem('authToken', 'valid-token');

    render(
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <TestComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    );

    // Verify that verifyToken is called with the stored token
    await waitFor(() => {
      expect(authApi.verifyToken).toHaveBeenCalledWith('valid-token');
    });
  });
});
