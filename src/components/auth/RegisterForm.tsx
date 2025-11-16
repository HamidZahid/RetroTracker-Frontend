import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegister } from '@/hooks/useAuth';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { mutate: register, isPending } = useRegister();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    register(registerData);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">Create Account</h2>
        <p className="text-center text-muted-foreground">
          Join your team and start collaborating today
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            {...registerField('name')}
            disabled={isPending}
          />
          {errors.name && (
            <p className="text-sm text-destructive font-medium flex items-center gap-2">
              <span className="inline-block w-1 h-1 rounded-full bg-destructive"></span>
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            {...registerField('email')}
            disabled={isPending}
          />
          {errors.email && (
            <p className="text-sm text-destructive font-medium flex items-center gap-2">
              <span className="inline-block w-1 h-1 rounded-full bg-destructive"></span>
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 6 characters"
              {...registerField('password')}
              disabled={isPending}
            />
            {errors.password && (
              <p className="text-sm text-destructive font-medium flex items-center gap-2">
                <span className="inline-block w-1 h-1 rounded-full bg-destructive"></span>
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repeat password"
              {...registerField('confirmPassword')}
              disabled={isPending}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive font-medium flex items-center gap-2">
                <span className="inline-block w-1 h-1 rounded-full bg-destructive"></span>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full gradient-primary shadow-lg hover:shadow-xl mt-6"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? 'Creating your account...' : 'Create Account'}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-[rgba(255,255,255,0.85)] text-muted-foreground">
              Already have an account?
            </span>
          </div>
        </div>

        <Link to="/login" className="block">
          <Button
            type="button"
            variant="outline"
            className="w-full border-2"
          >
            Sign In Instead
          </Button>
        </Link>
      </form>
    </div>
  );
}
