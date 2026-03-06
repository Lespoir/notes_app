import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';

// Tests for the LoginForm presentational component (features 1.2, 1.3, 1.4).
// The component receives all state/handlers as props from the screen hook.
// These tests will be red until LoginForm is implemented.

const defaultProps = {
  email: '',
  password: '',
  isPasswordVisible: false,
  isLoading: false,
  errors: {},
  onEmailChange: vi.fn(),
  onPasswordChange: vi.fn(),
  onTogglePasswordVisibility: vi.fn(),
  onSubmit: vi.fn(),
};

describe('LoginForm', () => {
  describe('rendering', () => {
    it('renders an email input field', () => {
      render(<LoginForm {...defaultProps} />);
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    });

    it('renders a password input field', () => {
      render(<LoginForm {...defaultProps} />);
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders a submit button', () => {
      render(<LoginForm {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /log in|login|sign in/i }),
      ).toBeInTheDocument();
    });

    it('renders a link to navigate to the sign-up screen (feature 1.4)', () => {
      render(<LoginForm {...defaultProps} />);
      expect(
        screen.getByRole('link', { name: /sign up|create account|register/i }),
      ).toBeInTheDocument();
    });
  });

  describe('password field type (feature 1.3 — password toggle)', () => {
    it('renders password input as type="password" when isPasswordVisible is false', () => {
      render(<LoginForm {...defaultProps} isPasswordVisible={false} />);
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
    });

    it('renders password input as type="text" when isPasswordVisible is true', () => {
      render(<LoginForm {...defaultProps} isPasswordVisible={true} />);
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'text');
    });
  });

  describe('password visibility toggle button (feature 1.3)', () => {
    it('renders a toggle button for password visibility', () => {
      render(<LoginForm {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /show password|hide password|toggle password/i }),
      ).toBeInTheDocument();
    });

    it('calls onTogglePasswordVisibility when the toggle button is clicked', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(<LoginForm {...defaultProps} onTogglePasswordVisibility={onToggle} />);
      await user.click(
        screen.getByRole('button', { name: /show password|hide password|toggle password/i }),
      );
      expect(onToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('field interactions', () => {
    it('calls onEmailChange when the user types in the email field', async () => {
      const user = userEvent.setup();
      const onEmailChange = vi.fn();
      render(<LoginForm {...defaultProps} onEmailChange={onEmailChange} />);
      await user.type(screen.getByRole('textbox', { name: /email/i }), 'a');
      expect(onEmailChange).toHaveBeenCalled();
    });

    it('calls onPasswordChange when the user types in the password field', async () => {
      const user = userEvent.setup();
      const onPasswordChange = vi.fn();
      render(<LoginForm {...defaultProps} onPasswordChange={onPasswordChange} />);
      await user.type(screen.getByLabelText(/password/i), 'a');
      expect(onPasswordChange).toHaveBeenCalled();
    });

    it('calls onSubmit when the submit button is clicked', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<LoginForm {...defaultProps} onSubmit={onSubmit} />);
      await user.click(screen.getByRole('button', { name: /log in|login|sign in/i }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('field value binding', () => {
    it('displays the email value from props', () => {
      render(<LoginForm {...defaultProps} email="user@example.com" />);
      expect(screen.getByRole('textbox', { name: /email/i })).toHaveValue('user@example.com');
    });

    it('displays the password value from props', () => {
      render(<LoginForm {...defaultProps} password="secret" />);
      expect(screen.getByLabelText(/password/i)).toHaveValue('secret');
    });
  });

  describe('error display', () => {
    it('displays an email error message when errors.email is set', () => {
      render(
        <LoginForm {...defaultProps} errors={{ email: 'Invalid email address' }} />,
      );
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });

    it('displays a password error message when errors.password is set', () => {
      render(
        <LoginForm {...defaultProps} errors={{ password: 'Password is required' }} />,
      );
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('displays a server error message when errors.server is set', () => {
      render(
        <LoginForm {...defaultProps} errors={{ server: 'Invalid credentials' }} />,
      );
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('does not display error messages when errors is empty', () => {
      render(<LoginForm {...defaultProps} errors={{}} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('disables the submit button when isLoading is true', () => {
      render(<LoginForm {...defaultProps} isLoading={true} />);
      expect(
        screen.getByRole('button', { name: /log in|login|sign in/i }),
      ).toBeDisabled();
    });

    it('enables the submit button when isLoading is false', () => {
      render(<LoginForm {...defaultProps} isLoading={false} />);
      expect(
        screen.getByRole('button', { name: /log in|login|sign in/i }),
      ).not.toBeDisabled();
    });
  });
});
