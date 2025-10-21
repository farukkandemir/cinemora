import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, redirect } from "@tanstack/react-router";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { useMutation } from "@/hooks/use-mutation";
import { supabase } from "@/lib/supabase-client";
import { getAuthErrorMessage } from "@/lib/auth-errors";

const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const signupFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      name: string;
      email: string;
      password: string;
      redirectUrl?: string;
    }) => d
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          displayName: data.name,
          fullName: data.name,
        },
      },
    });
    if (error) {
      throw new Error(error.message);
    }

    // Redirect to the prev page stored in the "redirect" search param
    throw redirect({
      href: data.redirectUrl || "/",
    });
  });

export function SignUpForm({ onSuccess, onError }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const signupMutation = useMutation({
    fn: useServerFn(signupFn),
    onSuccess: async () => {
      setErrorMessage(null);
      onSuccess?.();
    },
    onError: async ({ error }) => {
      const friendlyMessage = getAuthErrorMessage(error);
      setErrorMessage(friendlyMessage);
      onError?.(friendlyMessage);
    },
  });

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setErrorMessage(null);
    signupMutation.mutate({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        redirectUrl: "/dashboard",
      },
    });
  };

  const handleGoogleSignUp = async () => {
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
          create account
        </h1>
        <p className="text-base text-muted-foreground font-light leading-relaxed">
          join cinemora and start organizing your movie collection
        </p>
      </div>

      {/* Error message - minimal design */}
      {errorMessage && (
        <div className="flex items-center justify-center gap-2 text-sm text-destructive/90 font-light">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Google sign up - subtle design */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 text-sm font-light bg-transparent border-border/50 hover:border-foreground/30 hover:bg-foreground/3 transition-all duration-200"
        onClick={handleGoogleSignUp}
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
            signing up...
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-light text-muted-foreground">
                  full name
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      type="text"
                      placeholder="enter your full name"
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
                      placeholder="create a password"
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-light text-muted-foreground">
                  confirm password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="confirm your password"
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
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
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

          <FormField
            control={form.control}
            name="agreeToTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-light text-muted-foreground/80">
                    i agree to the{" "}
                    <span className="text-foreground hover:text-muted-foreground transition-colors duration-200 font-light">
                      terms of service
                    </span>{" "}
                    and{" "}
                    <span className="text-foreground hover:text-muted-foreground transition-colors duration-200 font-light">
                      privacy policy
                    </span>
                  </FormLabel>
                  <FormMessage className="text-xs font-light" />
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-11 text-sm font-light bg-foreground text-background hover:bg-foreground/90 transition-all duration-200"
            disabled={signupMutation.status === "pending"}
          >
            {signupMutation.status === "pending" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                creating account...
              </>
            ) : (
              "create account"
            )}
          </Button>
        </form>
      </Form>

      {/* Minimal footer */}
      <div className="text-center">
        <div className="text-sm font-light text-muted-foreground/80">
          already have an account?{" "}
          <Link
            to="/auth/sign-in"
            className="text-foreground hover:text-muted-foreground transition-colors duration-200 font-light"
          >
            sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
