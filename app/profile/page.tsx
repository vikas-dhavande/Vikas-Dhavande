'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getSupabase } from '@/lib/supabase';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Camera, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, checkAuth } = useAuth();
  const [loading, setLoading] = React.useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  
  // Email state
  const [newEmail, setNewEmail] = React.useState('');

  // Avatar state
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  React.useEffect(() => {
    if (user?.email) setNewEmail(user.email);
    if (user?.picture) setPreviewUrl(user.picture);
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[600px] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold">Authentication Required</h1>
        <p className="text-muted-foreground">Please sign in to access your profile.</p>
      </div>
    );
  }

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength(newPassword);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabase();
      if (!supabase) {
        toast.error('Supabase is not configured');
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
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

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmail === user?.email) {
      toast.info('No changes made to email');
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabase();
      if (!supabase) {
        toast.error('Supabase is not configured');
        return;
      }

      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast.success('Confirmation email sent to both old and new addresses');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setLoading(true);
    try {
      const supabase = getSupabase();
      if (!supabase) {
        toast.error('Supabase is not configured');
        return;
      }

      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      await checkAuth();
      toast.success('Profile picture updated');
      setAvatarFile(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-5xl py-10 px-4 md:px-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account security and profile information.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <aside className="flex flex-col gap-2">
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="relative group">
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                <AvatarImage src={previewUrl || ''} />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold truncate max-w-[180px]">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user?.email}</p>
            </div>
          </div>
        </aside>

        <main>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Public Profile</CardTitle>
                  <CardDescription>
                    This is how others will see you on the platform.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div 
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-10 transition-colors",
                      isDragging ? "border-primary bg-primary/5" : "border-border",
                      avatarFile ? "bg-muted/50" : ""
                    )}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Drag and drop or click to upload
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG or GIF (max. 2MB)
                        </p>
                      </div>
                    </div>
                    <Input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </div>

                  {avatarFile && (
                    <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-md border border-border">
                          <img src={previewUrl!} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium truncate max-w-[200px]">{avatarFile.name}</p>
                          <p className="text-xs text-muted-foreground">{(avatarFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <Button size="sm" onClick={handleAvatarUpload} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <div className="flex gap-2">
                      <Input id="displayName" defaultValue={user?.name || ''} readOnly className="bg-muted" />
                      <Button variant="outline" disabled>Edit</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Name changes are managed via your auth provider.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure.
                  </CardDescription>
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
                    <Separator className="my-2" />
                    <div className="space-y-2">
                      <Label htmlFor="new-pwd">New Password</Label>
                      <Input 
                        id="new-pwd" 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••" 
                      />
                      <div className="space-y-1.5">
                        <div className="flex h-1 w-full overflow-hidden rounded-full bg-muted">
                          <div 
                            className={cn(
                              "h-full transition-all duration-500",
                              strength <= 25 ? "bg-destructive" : 
                              strength <= 50 ? "bg-orange-500" :
                              strength <= 75 ? "bg-yellow-500" : "bg-green-500"
                            )} 
                            style={{ width: `${strength}%` }}
                          />
                        </div>
                        <p className="text-[10px] flex items-center gap-1.5 text-muted-foreground">
                          {strength < 100 ? (
                            <ShieldAlert className="h-3 w-3 text-orange-500" />
                          ) : (
                            <ShieldCheck className="h-3 w-3 text-green-500" />
                          )}
                          Password Strength: {
                            strength <= 25 ? "Weak" : 
                            strength <= 50 ? "Fair" :
                            strength <= 75 ? "Good" : "Strong"
                          }
                        </p>
                      </div>
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
                  <CardFooter className="flex justify-between border-t border-border pt-6">
                    <p className="text-xs text-muted-foreground italic">
                      Minimum 8 characters with numbers & symbols.
                    </p>
                    <Button type="submit" disabled={loading || !newPassword}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Password
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card className="shadow-sm border-destructive/20">
                <CardHeader>
                  <CardTitle>Email Address</CardTitle>
                  <CardDescription>
                    Change the email address associated with your account.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleEmailUpdate}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="email" 
                          type="email" 
                          className="pl-9"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-border pt-6 bg-muted/30">
                    <p className="text-xs text-muted-foreground">
                      Requires verification of the new email address.
                    </p>
                    <Button type="submit" disabled={loading || newEmail === user?.email}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Email
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              <Card className="shadow-sm border-destructive/20 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions related to your account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-background shadow-sm">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold">Delete Account</p>
                      <p className="text-xs text-muted-foreground">
                        Once you delete your account, there is no going back.
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
