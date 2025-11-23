"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  type SignInSchema,
  signInSchema,
} from "@/modules/auth/models/auth.model";
import { authClient } from "@/modules/auth/utils/auth-client";
import dashboardRoutes from "@/modules/dashboard/dashboard.route";
import { signIn } from "../actions/auth.action";
import { hydrateClientAfterAuth } from "../utils/post-auth";
import authRoutes from "../auth.route";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [formData, setFormData] = useState<SignInSchema>({
    emailOrUsername: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignInSchema, string>>
  >({});

  const signInWithGoogle = async () => {
    try {
      setIsGoogleLoading(true);
      await authClient.signIn.social({
        provider: "google",
        callbackURL: dashboardRoutes.dashboard,
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google");
      setIsGoogleLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof SignInSchema]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsEmailLoading(true);
    setErrors({});

    // Validate with Zod
    const result = signInSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignInSchema, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof SignInSchema;
        if (field) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsEmailLoading(false);
      return;
    }

    const { success, message } = await signIn(result.data);

    if (success) {
      try {
        await hydrateClientAfterAuth();
      } catch (error) {
        console.error("Failed to refresh user after sign-in", error);
      }

      toast.success(message.toString());
      router.push(dashboardRoutes.dashboard);
    } else {
      // Show specific error message for unverified email
      if (message.toString().toLowerCase().includes("verify") ||
        message.toString().toLowerCase().includes("verification")) {
        toast.error("Please verify your email before logging in. Check your inbox for the verification link.");
      } else {
        toast.error(message.toString());
      }
    }
    setIsEmailLoading(false);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-6">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={signInWithGoogle}
                disabled={isGoogleLoading || isEmailLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" label={null} />
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-4 h-4 mr-2"
                    >
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Login with Google
                  </>
                )}
              </Button>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="emailOrUsername">Email or Username</Label>
                  <Input
                    id="emailOrUsername"
                    name="emailOrUsername"
                    type="text"
                    placeholder="mail@mail.com or username"
                    value={formData.emailOrUsername}
                    onChange={handleChange}
                    className={errors.emailOrUsername ? "border-red-500" : ""}
                  />
                  {errors.emailOrUsername && (
                    <p className="text-sm text-red-500">{errors.emailOrUsername}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="*********"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? "border-red-500" : ""}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Button type="submit" className="w-full" disabled={isGoogleLoading || isEmailLoading}>
                  {isEmailLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" label={null} />
                      Loading...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href={authRoutes.signup}
                  className="underline underline-offset-4"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
