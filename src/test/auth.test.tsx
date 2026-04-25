import { render, screen, fireEvent } from '@testing-library/react';
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

// Mock the dropdown-menu components to avoid Base UI context requirements in tests
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) =>
    asChild ? <>{children}</> : <button>{children}</button>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick, asChild }: { children: React.ReactNode; onClick?: () => void; asChild?: boolean }) =>
    asChild ? <>{children}</> : <div role="menuitem" onClick={onClick}>{children}</div>,
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}));

const mockUser = {
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/avatar.jpg',
  role: 'user' as const,
};

describe('Auth & Profile Navigation', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      logout: mockLogout,
      loading: false,
    });
  });

  it('Sign-out button calls logout function', () => {
    render(<UserAccountNav user={mockUser} />);

    const signOutBtn = screen.getByText(/sign out/i);
    fireEvent.click(signOutBtn);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('Account Settings link points to profile page', () => {
    render(<UserAccountNav user={mockUser} />);

    const profileLink = screen.getByRole('link', { name: /account settings/i });
    expect(profileLink).toHaveAttribute('href', '/dashboard/profile');
  });
});
