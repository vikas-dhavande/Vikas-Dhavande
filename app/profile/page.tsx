'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { client } from '@/lib/appwrite';
import { Account, Storage, ID, Models } from 'appwrite';
import { useTheme } from 'next-themes';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Blobatar } from '@/components/ui/blobatar';
import { Separator } from '@/components/ui/separator';
import { HairlineAccent } from '@/components/ui/hairline-accent';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Loader2,
  Mail,
  Camera,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Upload,
  CheckCircle2,
  Calendar,
  Smartphone,
  Laptop,
  Globe,
  Trash2,
  LogOut,
  MapPin,
  FileText,
  KeyRound,
  RefreshCw,
  Sun,
  Moon,
  Monitor,
  X,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, checkAuth, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  // Component state
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('profile');

  // Profile form state
  const [name, setName] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);

  // Avatar state
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  // Email state
  const [newEmail, setNewEmail] = React.useState('');
  const [emailPassword, setEmailPassword] = React.useState('');
  const [isVerifyingEmail, setIsVerifyingEmail] = React.useState(false);

  // Sessions state
  const [sessions, setSessions] = React.useState<Models.Session[]>([]);
  const [loadingSessions, setLoadingSessions] = React.useState(false);

  // Preferences state
  const [language, setLanguage] = React.useState('en');
  const [emailNotifications, setEmailNotifications] = React.useState(true);

  // Danger zone state
  const [deleteConfirmation, setDeleteConfirmation] = React.useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false);

  // Initialize from user session
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setNewEmail(user.email || '');
      setPreviewUrl(user.picture || null);
      setPhone(user.phone || '');

      const prefs = user.prefs || {};
      setBio(prefs.bio || '');
      setLocation(prefs.location || '');
      setLanguage(prefs.language || 'en');
      setEmailNotifications(prefs.emailNotifications !== false);
    }
  }, [user]);

  // Load sessions when entering security tab
  const fetchSessions = React.useCallback(async () => {
    setLoadingSessions(true);
    try {
      const account = new Account(client);
      const res = await account.listSessions();
      setSessions(res.sessions || []);
    } catch (err: any) {
      console.warn('Could not fetch active sessions:', err?.message);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  React.useEffect(() => {
    if (activeTab === 'security' && isAuthenticated) {
      void fetchSessions();
    }
  }, [activeTab, isAuthenticated, fetchSessions]);

  // Loading state
  if (authLoading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[600px] flex-col items-center justify-center gap-4 text-center px-4">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Authentication Required</h1>
        <p className="text-muted-foreground max-w-sm">
          Please sign in to your account to view and manage your profile settings.
        </p>
        <Button onClick={() => router.push('/sign-in?redirect=/profile')}>Sign In</Button>
      </div>
    );
  }

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;
    return score;
  };

  const strength = getPasswordStrength(newPassword);

  // 1. Save Profile Changes (Name, Bio, Location, Phone)
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const account = new Account(client);

      // Update display name if changed
      if (name.trim() !== user?.name) {
        await account.updateName({ name: name.trim() });
      }

      // Update preferences (bio, location, language, email notifications)
      await account.updatePrefs({
        ...user?.prefs,
        bio: bio.trim(),
        location: location.trim(),
        language,
        emailNotifications,
      });

      toast.success('Profile updated successfully');
      setIsEditingProfile(false);
      await checkAuth();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // 2. Avatar Drag & Drop and Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Avatar file size must be less than 2MB');
        return;
      }
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files (JPG, PNG, WebP) are allowed');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Avatar file size must be less than 2MB');
        return;
      }
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setLoading(true);
    try {
      const storage = new Storage(client);
      const account = new Account(client);
      const bucketId =
        process.env.NEXT_PUBLIC_APPWRITE_AVATARS_BUCKET_ID ||
        process.env.NEXT_PUBLIC_APPWRITE_RESOURCES_BUCKET_ID ||
        'resources';

      const file = await storage.createFile({
        bucketId,
        fileId: ID.unique(),
        file: avatarFile,
      });

      const fileUrl = storage.getFileView({
        bucketId,
        fileId: file.$id,
      }).toString();

      // Persist avatar URL into preferences
      await account.updatePrefs({
        ...user?.prefs,
        avatarUrl: fileUrl,
      });

      setPreviewUrl(fileUrl);
      setAvatarFile(null);
      toast.success('Profile picture updated successfully');
      await checkAuth();
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setLoading(true);
    try {
      const account = new Account(client);
      await account.updatePrefs({
        ...user?.prefs,
        avatarUrl: '',
      });
      setPreviewUrl(null);
      setAvatarFile(null);
      toast.success('Profile picture removed');
      await checkAuth();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove avatar');
    } finally {
      setLoading(false);
    }
  };

  // 3. Security: Password Update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const account = new Account(client);
      await account.updatePassword({
        password: newPassword,
        oldPassword: currentPassword || undefined,
      });
      toast.success('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  // 4. Security: Email Update
  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmail.trim() === user?.email) {
      toast.info('No changes made to email address');
      return;
    }
    if (!emailPassword) {
      toast.error('Please enter your current password to change your email');
      return;
    }

    setLoading(true);
    try {
      const account = new Account(client);
      await account.updateEmail({
        email: newEmail.trim(),
        password: emailPassword,
      });
      toast.success('Email address updated. Please verify your new email.');
      setEmailPassword('');
      await checkAuth();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update email address');
    } finally {
      setLoading(false);
    }
  };

  // 5. Security: Resend Verification Email
  const handleResendVerification = async () => {
    setIsVerifyingEmail(true);
    try {
      const account = new Account(client);
      await account.createVerification({
        url: `${window.location.origin}/profile`,
      });
      toast.success('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send verification email');
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // 6. Security: Sessions Revocation
  const handleRevokeSession = async (sessionId: string) => {
    try {
      const account = new Account(client);
      await account.deleteSession({ sessionId });
      toast.success('Session revoked');
      setSessions((prev) => prev.filter((s) => s.$id !== sessionId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to revoke session');
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      const account = new Account(client);
      const otherSessions = sessions.filter((s) => !s.current);
      for (const s of otherSessions) {
        await account.deleteSession({ sessionId: s.$id });
      }
      toast.success('All other sessions revoked');
      setSessions((prev) => prev.filter((s) => s.current));
    } catch (err: any) {
      toast.error(err.message || 'Failed to revoke other sessions');
    }
  };

  // 7. Preferences: Save Language & Notification settings
  const handleSavePreferences = async (newLang: string, newNotif: boolean) => {
    setLanguage(newLang);
    setEmailNotifications(newNotif);
    try {
      const account = new Account(client);
      await account.updatePrefs({
        ...user?.prefs,
        language: newLang,
        emailNotifications: newNotif,
      });
      toast.success('Preferences updated');
      await checkAuth();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save preferences');
    }
  };

  // 8. Danger Zone: Delete Account
  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const res = await fetch('/api/user/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      toast.success('Your account has been deleted permanently.');
      setIsDeleteDialogOpen(false);
      window.location.href = '/sign-in';
    } catch (err: any) {
      toast.error(err.message || 'Could not delete account');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="container max-w-5xl py-8 px-4 md:px-8 space-y-8">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-card/60 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative group shrink-0">
            <Blobatar
              name={user?.name || user?.email || 'User'}
              src={previewUrl || undefined}
              className="h-24 w-24 md:h-28 md:w-28 ring-4 ring-background shadow-xl rounded-full"
            />
            <label
              htmlFor="header-avatar-upload"
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
              title="Change picture"
            >
              <Camera className="h-6 w-6" />
              <input
                id="header-avatar-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {user?.name}
              </h1>
              <Badge variant="outline" className="capitalize text-xs">
                {user?.role}
              </Badge>
              {user?.emailVerification ? (
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10 text-xs gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/10 text-xs gap-1">
                  <AlertCircle className="h-3 w-3" /> Unverified
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-2">
              <Mail className="h-3.5 w-3.5" /> {user?.email}
            </p>

            {formattedDate && (
              <p className="text-xs text-muted-foreground flex items-center justify-center md:justify-start gap-2 pt-1">
                <Calendar className="h-3.5 w-3.5" /> Member since {formattedDate}
              </p>
            )}

            {bio && !isEditingProfile && (
              <p className="text-sm text-foreground/80 pt-2 italic max-w-xl">
                &ldquo;{bio}&rdquo;
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab('profile');
                setIsEditingProfile(!isEditingProfile);
              }}
            >
              {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4 mr-1.5" /> Log Out
            </Button>
          </div>
        </div>

        {/* Unverified banner */}
        {!user?.emailVerification && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-500 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Your email address is unverified. Verify to secure your account.</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={isVerifyingEmail}
              onClick={handleResendVerification}
              className="border-amber-500/30 hover:bg-amber-500/10 text-amber-500 h-7 text-xs"
            >
              {isVerifyingEmail && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
              Resend Verification Email
            </Button>
          </div>
        )}
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* TAB 1: PROFILE */}
        <TabsContent value="profile" className="space-y-6">
          {/* Avatar Management Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Upload a custom photo or utilize your default generative Blobatar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div
                className={cn(
                  'relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-colors',
                  isDragging ? 'border-primary bg-primary/5' : 'border-border',
                  avatarFile ? 'bg-muted/40' : ''
                )}
                onDragOver={(e: React.DragEvent) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Drag &amp; drop an avatar image, or browse</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, or WebP (max 2MB)</p>
                  </div>
                </div>
                <Input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                />
              </div>

              {avatarFile && (
                <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-border">
                      <img src={previewUrl!} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium truncate max-w-[200px]">{avatarFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(avatarFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAvatarFile(null);
                        setPreviewUrl(user?.picture || null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleAvatarUpload} disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Avatar
                    </Button>
                  </div>
                </div>
              )}

              {user?.picture && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={loading}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remove Custom Avatar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your display name, location, and short biography.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveProfile}>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">Full Name *</Label>
                    <Input
                      id="profile-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="profile-location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, Country"
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="profile-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="profile-bio">Bio</Label>
                    <span className="text-[10px] text-muted-foreground">
                      {bio.length}/200 characters
                    </span>
                  </div>
                  <textarea
                    id="profile-bio"
                    value={bio}
                    maxLength={200}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Brief summary about yourself..."
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-2 border-t border-border pt-4">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Profile
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* TAB 2: SECURITY */}
        <TabsContent value="security" className="space-y-6">
          {/* Change Password Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Ensure your account uses a secure password of at least 8 characters.
                </CardDescription>
              </div>
              <div className="shrink-0">
                <HairlineAccent figure="padlock" size="compact" intensity={0.5} />
              </div>
            </CardHeader>
            <form onSubmit={handlePasswordUpdate}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-pwd">Current Password</Label>
                  <Input
                    id="current-pwd"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-pwd">New Password</Label>
                  <Input
                    id="new-pwd"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  {newPassword && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full transition-all duration-300',
                            strength <= 25
                              ? 'bg-destructive'
                              : strength <= 50
                              ? 'bg-orange-500'
                              : strength <= 75
                              ? 'bg-yellow-500'
                              : 'bg-emerald-500'
                          )}
                          style={{ width: `${strength}%` }}
                        />
                      </div>
                      <p className="text-[11px] flex items-center gap-1.5 text-muted-foreground">
                        {strength < 100 ? (
                          <ShieldAlert className="h-3 w-3 text-orange-500" />
                        ) : (
                          <ShieldCheck className="h-3 w-3 text-emerald-500" />
                        )}
                        Password Strength:{' '}
                        {strength <= 25
                          ? 'Weak'
                          : strength <= 50
                          ? 'Fair'
                          : strength <= 75
                          ? 'Good'
                          : 'Strong'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-pwd">Confirm New Password</Label>
                  <Input
                    id="confirm-pwd"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-between border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters long.
                </p>
                <Button type="submit" disabled={loading || !newPassword}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Password
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Change Email Card */}
          <Card>
            <CardHeader>
              <CardTitle>Email Address</CardTitle>
              <CardDescription>
                Update the primary email address used to log into your account.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleEmailUpdate}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sec-email">New Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="sec-email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-pwd">Current Password (Required)</Label>
                  <Input
                    id="email-pwd"
                    type="password"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    placeholder="Verify with current password"
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-between border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  Requires current password for security verification.
                </p>
                <Button
                  type="submit"
                  disabled={loading || newEmail === user?.email || !emailPassword}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Email
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Active Sessions Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Devices and browsers currently logged into your account.</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRevokeAllOtherSessions}
                disabled={sessions.length <= 1}
              >
                Revoke All Others
              </Button>
            </CardHeader>
            <CardContent>
              {loadingSessions ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No active session information available.
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {sessions.map((sess) => (
                    <div key={sess.$id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                          {sess.osName?.toLowerCase().includes('windows') ||
                          sess.osName?.toLowerCase().includes('mac') ||
                          sess.osName?.toLowerCase().includes('linux') ? (
                            <Laptop className="h-5 w-5" />
                          ) : (
                            <Smartphone className="h-5 w-5" />
                          )}
                        </div>
                        <div className="space-y-0.5 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {sess.clientName || 'Browser'} on {sess.osName || 'Device'}
                            </span>
                            {sess.current && (
                              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                                This Device
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {sess.ip} {sess.countryName ? `• ${sess.countryName}` : ''}
                          </p>
                        </div>
                      </div>

                      {!sess.current && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeSession(sess.$id)}
                          className="text-muted-foreground hover:text-destructive text-xs"
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions that will permanently delete your account and associated data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-destructive/20 bg-background/80">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">Delete Account</p>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your profile, authentication credentials, and sessions.
                  </p>
                </div>

                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-destructive">Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete your account,
                        cancel all sessions, and remove your credentials.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                      <p className="text-xs text-muted-foreground">
                        Please type <span className="font-bold text-foreground">DELETE</span> or your
                        email (<span className="font-semibold text-foreground">{user?.email}</span>) to
                        confirm:
                      </p>
                      <Input
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="Type DELETE or email"
                      />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setIsDeleteDialogOpen(false);
                          setDeleteConfirmation('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={
                          isDeletingAccount ||
                          (deleteConfirmation.trim().toLowerCase() !== 'delete' &&
                            deleteConfirmation.trim().toLowerCase() !== user?.email?.toLowerCase())
                        }
                        onClick={handleDeleteAccount}
                      >
                        {isDeletingAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Permanently Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: PREFERENCES */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interface &amp; Theme</CardTitle>
              <CardDescription>
                Customize your interface theme and visual preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Theme Preference</Label>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  <Button
                    type="button"
                    variant={theme === 'light' ? 'default' : 'outline'}
                    className="flex flex-col gap-1.5 h-18 text-xs font-medium"
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="h-5 w-5" /> Light
                  </Button>
                  <Button
                    type="button"
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    className="flex flex-col gap-1.5 h-18 text-xs font-medium"
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="h-5 w-5" /> Dark
                  </Button>
                  <Button
                    type="button"
                    variant={theme === 'system' ? 'default' : 'outline'}
                    className="flex flex-col gap-1.5 h-18 text-xs font-medium"
                    onClick={() => setTheme('system')}
                  >
                    <Monitor className="h-5 w-5" /> System
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive announcements, article alerts, and platform notifications.
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={(checked) => handleSavePreferences(language, checked)}
                />
              </div>

              <Separator />

              <div className="space-y-2 max-w-sm">
                <Label htmlFor="pref-language">Language</Label>
                <select
                  id="pref-language"
                  value={language}
                  onChange={(e) => handleSavePreferences(e.target.value, emailNotifications)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="en" className="bg-popover text-popover-foreground">English (US)</option>
                  <option value="es" className="bg-popover text-popover-foreground">Español</option>
                  <option value="fr" className="bg-popover text-popover-foreground">Français</option>
                  <option value="de" className="bg-popover text-popover-foreground">Deutsch</option>
                  <option value="ja" className="bg-popover text-popover-foreground">日本語</option>
                  <option value="hi" className="bg-popover text-popover-foreground">हिन्दी</option>
                </select>
                <p className="text-xs text-muted-foreground">Select your preferred display language.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
