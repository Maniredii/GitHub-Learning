import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegistrationForm } from '../RegistrationForm';
import * as authApi from '../../services/authApi';

vi.mock('../../services/authApi');

describe('RegistrationForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnSwitchToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders registration form with all fields', () => {
    render(
      <RegistrationForm
        onSuccess={mockOnSuccess}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(
      <RegistrationForm
        onSuccess={mockOnSuccess}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    const usernameInput = screen.getByLabelText(/^username/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await user.type(emailInput, 'invalid-email');
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    await user.click(submitButton);

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  it('validates username requirements', async () => {
    const user = userEvent.setup();
    render(
      <RegistrationForm
        onSuccess={mockOnSuccess}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );

    const usernameInput = screen.getByLabelText(/^username/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Test too short
    await user.type(usernameInput, 'ab');
    await user.click(submitButton);
    expect(await screen.findByText(/username must be at least 3 characters/i)).toBeInTheDocument();

    await user.clear(usernameInput);

    // Test invalid characters
    await user.type(usernameInput, 'user@name');
    await user.click(submitButton);
    expect(await screen.findByText(/username can only contain/i)).toBeInTheDocument();
  });

  it('validates password strength', async () => {
    const user = userEvent.setup();
    render(
      <RegistrationForm
        onSuccess={mockOnSuccess}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );

    const passwordInput = screen.getByLabelText(/^password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Test too short
    await user.type(passwordInput, 'short');
    await user.click(submitButton);
    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();

    await user.clear(passwordInput);

    // Test weak password
    await user.type(passwordInput, 'weakpassword');
    await user.click(submitButton);
    expect(await screen.findByText(/password must contain uppercase, lowercase, and number/i)).toBeInTheDocument();
  });

  it('validates password confirmation match', async () => {
    const user = userEvent.setup();
    render(
      <RegistrationForm
        onSuccess={mockOnSuccess}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );

    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password456');
    await user.click(submitButton);

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('submits form with valid data and stores token', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      token: 'test-token',
      user: {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        level: 1,
        xp: 0,
      },
    };

    vi.mocked(authApi.register).mockResolvedValue(mockResponse);

    render(
      <RegistrationForm
        onSuccess={mockOnSuccess}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^username/i), 'testuser');
    await user.type(screen.getByLabelText(/^password/i), 'Password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123',
      });
    });

    expect(localStorage.getItem('authToken')).toBe('test-token');
    expect(localStorage.getItem('userId')).toBe('user-123');
    expect(mockOnSuccess).toHaveBeenCalledWith('test-token', 'user-123');
  });

  it('displays error message on registration failure', async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.register).mockRejectedValue(new Error('Email already exists'));

    render(
      <RegistrationForm
        onSuccess={mockOnSuccess}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^username/i), 'testuser');
    await user.type(screen.getByLabelText(/^password/i), 'Password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();
  });

  it('switches to login form when link is clicked', async () => {
    const user = userEvent.setup();
    render(
      <RegistrationForm
        onSuccess={mockOnSuccess}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );

    const loginLink = screen.getByRole('button', { name: /sign in/i });
    await user.click(loginLink);

    expect(mockOnSwitchToLogin).toHaveBeenCalled();
  });
});
