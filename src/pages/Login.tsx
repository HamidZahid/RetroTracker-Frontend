import { LoginForm } from '@/components/auth/LoginForm';
import { Sparkles } from 'lucide-react';

export function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 gradient-mesh animate-gradient" />

      {/* Blur overlay for depth */}
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Logo/Brand section with gradient */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary animate-gradient mb-3 shadow-xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[hsl(var(--gradient-start))] via-[hsl(var(--gradient-middle))] to-[hsl(var(--gradient-end))] bg-clip-text text-transparent">
            Retro Tracker
          </h1>
          <p className="text-muted-foreground">Team retrospectives made easy</p>
        </div>

        {/* Glass card for form */}
        <div className="glass-card rounded-2xl p-8 shadow-xl">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
