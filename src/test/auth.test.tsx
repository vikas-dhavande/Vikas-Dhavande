import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UserAccountNav } from '@/components/layout/UserAccountNav';
import { useAuth } from '@/hooks/useAuth';
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

describe('Auth & Profile Navigation', () => {
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

  it('Account Settings link points to profile page', async () => {
    render(<UserAccountNav user={mockUser} />);
    
    // Open dropdown
    const trigger = screen.getByRole('button', { name: /test user/i });
    fireEvent.click(trigger);

    const profileLink = screen.getByRole('link', { name: /account settings/i });
    expect(profileLink).toHaveAttribute('href', '/dashboard/profile');
  });
});
