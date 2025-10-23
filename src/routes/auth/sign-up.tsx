import { createFileRoute } from "@tanstack/react-router";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/sign-up")({
  component: RouteComponent,
});

function RouteComponent() {
  const handleSuccess = () => {
    toast.success("Account created successfully!");
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  return <SignUpForm onSuccess={handleSuccess} onError={handleError} />;
}
