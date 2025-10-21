import { createFileRoute } from "@tanstack/react-router";
import { SignInForm } from "@/components/auth/SignInForm";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/sign-in")({
  component: RouteComponent,
});

function RouteComponent() {
  const handleSuccess = () => {
    toast.success("Welcome back! You've been signed in successfully.");
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  return <SignInForm onSuccess={handleSuccess} onError={handleError} />;
}
