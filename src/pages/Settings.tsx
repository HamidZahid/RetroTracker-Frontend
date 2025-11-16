import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bell, Lock, Shield, Palette, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUpdateProfile } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const SETTINGS_KEYS = {
  EMAIL_NOTIFICATIONS: 'settings_email_notifications',
  TEAM_UPDATES: 'settings_team_updates',
  RETRO_REMINDERS: 'settings_retro_reminders',
  DARK_MODE: 'settings_dark_mode',
} as const;

export function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [teamUpdates, setTeamUpdates] = useState(true);
  const [retroReminders, setRetroReminders] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      const emailNotifs = localStorage.getItem(SETTINGS_KEYS.EMAIL_NOTIFICATIONS);
      const teamUpd = localStorage.getItem(SETTINGS_KEYS.TEAM_UPDATES);
      const retroRem = localStorage.getItem(SETTINGS_KEYS.RETRO_REMINDERS);
      const darkMd = localStorage.getItem(SETTINGS_KEYS.DARK_MODE);

      if (emailNotifs !== null) setEmailNotifications(emailNotifs === 'true');
      if (teamUpd !== null) setTeamUpdates(teamUpd === 'true');
      if (retroRem !== null) setRetroReminders(retroRem === 'true');
      if (darkMd !== null) {
        const isDark = darkMd === 'true';
        setDarkMode(isDark);
        // Apply dark mode class to document
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage when they change
  const handleEmailNotificationsChange = (checked: boolean) => {
    setEmailNotifications(checked);
    localStorage.setItem(SETTINGS_KEYS.EMAIL_NOTIFICATIONS, String(checked));
    toast({
      title: 'Settings saved',
      description: 'Email notification preference updated',
    });
  };

  const handleTeamUpdatesChange = (checked: boolean) => {
    setTeamUpdates(checked);
    localStorage.setItem(SETTINGS_KEYS.TEAM_UPDATES, String(checked));
    toast({
      title: 'Settings saved',
      description: 'Team updates preference updated',
    });
  };

  const handleRetroRemindersChange = (checked: boolean) => {
    setRetroReminders(checked);
    localStorage.setItem(SETTINGS_KEYS.RETRO_REMINDERS, String(checked));
    toast({
      title: 'Settings saved',
      description: 'Retrospective reminders preference updated',
    });
  };

  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem(SETTINGS_KEYS.DARK_MODE, String(checked));
    // Apply dark mode class to document
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast({
      title: 'Settings saved',
      description: 'Dark mode preference updated',
    });
  };

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!user) return;

    try {
      await updateProfile.mutateAsync({
        name: user.name, // Keep current name/email, only update password
        email: user.email,
        password: data.newPassword,
      });
      setIsPasswordDialogOpen(false);
      resetPassword();
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 gradient-primary text-white shadow-xl w-full">
        <div className="absolute inset-0 bg-black/5" />
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Settings</h1>
          <p className="text-white/90 mt-1 text-sm sm:text-base">
            Manage your application preferences
          </p>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your teams and retrospectives
              </p>
            </div>
            <Switch 
              id="email-notifications" 
              checked={emailNotifications}
              onCheckedChange={handleEmailNotificationsChange}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="team-updates">Team Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when team members make changes
              </p>
            </div>
            <Switch 
              id="team-updates" 
              checked={teamUpdates}
              onCheckedChange={handleTeamUpdatesChange}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="retro-reminders">Retrospective Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Remind me about upcoming retrospectives
              </p>
            </div>
            <Switch 
              id="retro-reminders" 
              checked={retroReminders}
              onCheckedChange={handleRetroRemindersChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>Manage your privacy and security settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="profile-visibility">Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Control who can see your profile information
              </p>
            </div>
            <Button variant="outline" size="sm">
              Public
            </Button>
          </div>
          <Separator />
          <div>
            <Label>Password</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Change your account password
            </p>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
              <Lock className="mr-2 h-4 w-4" />
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark theme
              </p>
            </div>
            <Switch 
              id="dark-mode" 
              checked={darkMode}
              onCheckedChange={handleDarkModeChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your new password. Make sure it's at least 6 characters long.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className="pl-10 pr-10"
                  {...registerPassword('newPassword')}
                  disabled={updateProfile.isPending}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={updateProfile.isPending}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className="pl-10 pr-10"
                  {...registerPassword('confirmPassword')}
                  disabled={updateProfile.isPending}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={updateProfile.isPending}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPasswordDialogOpen(false);
                  resetPassword();
                }}
                disabled={updateProfile.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {updateProfile.isPending ? 'Changing...' : 'Change Password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
