import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabase";
import { useMutation } from "@/hooks/use-mutation";
import { supabase } from "@/lib/supabase-client";
import { getAuthErrorMessage } from "@/lib/auth-errors";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SignInFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const loginFn = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; password: string }) => d)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const result = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return { success: true };
  });

export function SignInForm({ onSuccess, onError }: SignInFormProps) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useMutation({
    fn: useServerFn(loginFn),
    onSuccess: async () => {
      setErrorMessage(null);
      await router.invalidate();
      router.navigate({ to: "/dashboard" });
      onSuccess?.();
    },
    onError: async ({ error }) => {
      const friendlyMessage = getAuthErrorMessage(error);
      setErrorMessage(friendlyMessage);
      onError?.(friendlyMessage);
    },
  });

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setErrorMessage(null);
    loginMutation.mutate({
      data: {
        email: data.email,
        password: data.password,
      },
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMessage(null);
      const result = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (result.error) {
        const friendlyMessage = getAuthErrorMessage(result.error);
        setErrorMessage(friendlyMessage);
        onError?.(friendlyMessage);
      }
    } catch (error) {
      const friendlyMessage = getAuthErrorMessage(error as Error);
      setErrorMessage(friendlyMessage);
      onError?.(friendlyMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      {/* Ultra-minimal header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-thin text-foreground lowercase tracking-tight">
          welcome back
        </h1>
        <p className="text-base text-muted-foreground font-light leading-relaxed">
          sign in to access your perfectly organized movie collection
        </p>
      </div>

      {/* Error message - minimal design */}
      {errorMessage && (
        <div className="flex items-center justify-center gap-2 text-sm text-destructive/90 font-light">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Google sign in - subtle design */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 text-sm font-light bg-transparent border-border/50 hover:border-foreground/30 hover:bg-foreground/3 transition-all duration-200"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {isGoogleLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            signing in...
          </>
        ) : (
          "continue with google"
        )}
      </Button>

      {/* Minimal separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground/60 font-light">
            or
          </span>
        </div>
      </div>

      {/* Form - minimal design */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-light text-muted-foreground">
                  email
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      type="email"
                      placeholder="enter your email"
                      className="pl-10 h-11 text-sm font-light bg-transparent border-border/50 focus:border-foreground/50 transition-colors duration-200"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (errorMessage) setErrorMessage(null);
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs font-light" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-light text-muted-foreground">
                  password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="enter your password"
                      className="pl-10 pr-10 h-11 text-sm font-light bg-transparent border-border/50 focus:border-foreground/50 transition-colors duration-200"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (errorMessage) setErrorMessage(null);
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground/60" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground/60" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs font-light" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-11 text-sm font-light bg-foreground text-background hover:bg-foreground/90 transition-all duration-200"
            disabled={loginMutation.status === "pending"}
          >
            {loginMutation.status === "pending" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                signing in...
              </>
            ) : (
              "sign in"
            )}
          </Button>
        </form>
      </Form>

      {/* Minimal footer */}
      <div className="text-center">
        <div className="text-sm font-light text-muted-foreground/80">
          don't have an account?{" "}
          <Link
            to="/auth/sign-up"
            className="text-foreground hover:text-muted-foreground transition-colors duration-200 font-light"
          >
            sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
