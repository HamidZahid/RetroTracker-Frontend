import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-center text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            {...register('email')}
            disabled={isPending}
          />
          {errors.email && (
            <p className="text-sm text-destructive font-medium flex items-center gap-2">
              <span className="inline-block w-1 h-1 rounded-full bg-destructive"></span>
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            {...register('password')}
            disabled={isPending}
          />
          {errors.password && (
            <p className="text-sm text-destructive font-medium flex items-center gap-2">
              <span className="inline-block w-1 h-1 rounded-full bg-destructive"></span>
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full gradient-primary shadow-lg hover:shadow-xl mt-6"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? 'Signing in...' : 'Sign In'}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-[rgba(255,255,255,0.85)] text-muted-foreground">
              Don't have an account?
            </span>
          </div>
        </div>

        <Link to="/register" className="block">
          <Button
            type="button"
            variant="outline"
            className="w-full border-2"
          >
            Create New Account
          </Button>
        </Link>
      </form>
    </div>
  );
}
