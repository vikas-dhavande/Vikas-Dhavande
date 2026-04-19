import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UserAccountNav } from '@/components/layout/UserAccountNav';
import { ProfileModals } from '@/components/auth/ProfileModals';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import * as React from 'react';

// Mock useAuth hook
vi.mock('@/hooks/useAuth', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

const mockUser = {
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/avatar.jpg',
};

describe('Auth & Profile Flows', () => {
  const mockLogout = vi.fn();
  const mockCheckAuth = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      logout: mockLogout,
      checkAuth: mockCheckAuth,
      loading: false,
    });
  });

  it('Sign-out button calls logout function', async () => {
    render(<UserAccountNav user={mockUser} />);
    
    // Open dropdown
    const trigger = screen.getByRole('button', { name: /test user/i });
    fireEvent.click(trigger);

    // Find and click sign out
    const signOutBtn = screen.getByText(/sign out/i);
    fireEvent.click(signOutBtn);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  describe('Profile Modals', () => {
    it('Password modal validates matching passwords', async () => {
      render(<ProfileModals />);
      
      // Trigger modal via event
      window.dispatchEvent(new CustomEvent('open-profile-modal', { detail: 'password' }));

      await waitFor(() => {
        expect(screen.getByText(/change password/i)).toBeInTheDocument();
      });

      const passwordInput = screen.getByLabelText(/^new password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitBtn = screen.getByRole('button', { name: /update password/i });

      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmInput, { target: { value: 'different' } });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    it('Password modal validates password length', async () => {
      render(<ProfileModals />);
      window.dispatchEvent(new CustomEvent('open-profile-modal', { detail: 'password' }));

      await waitFor(() => screen.getByText(/change password/i));

      const passwordInput = screen.getByLabelText(/^new password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitBtn = screen.getByRole('button', { name: /update password/i });

      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.change(confirmInput, { target: { value: '123' } });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });

    it('Email modal pre-fills current email', async () => {
      render(<ProfileModals />);
      window.dispatchEvent(new CustomEvent('open-profile-modal', { detail: 'email' }));

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
        expect(emailInput.value).toBe(mockUser.email);
      });
    });

    it('Image modal pre-fills current image URL', async () => {
      render(<ProfileModals />);
      window.dispatchEvent(new CustomEvent('open-profile-modal', { detail: 'image' }));

      await waitFor(() => {
        const imageInput = screen.getByLabelText(/image url/i) as HTMLInputElement;
        expect(imageInput.value).toBe(mockUser.picture);
      });
    });
  });
});
