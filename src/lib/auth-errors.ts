/**
 * Maps Supabase authentication errors to user-friendly messages
 */

interface AuthError {
  message: string;
  code?: string;
}

/**
 * Get a user-friendly error message from a Supabase auth error
 */
export function getAuthErrorMessage(error: AuthError | Error | string): string {
  const errorMessage = typeof error === "string" ? error : error.message;

  // Map common Supabase error messages to user-friendly ones
  const errorMap: Record<string, string> = {
    "Invalid login credentials":
      "Invalid email or password. Please check your credentials and try again.",
    "Email not confirmed":
      "Please verify your email address. Check your inbox for a confirmation link.",
    "User already registered":
      "An account with this email already exists. Please sign in instead.",
    "Password should be at least 6 characters":
      "Password must be at least 6 characters long.",
    "Signups not allowed for this instance":
      "New registrations are currently disabled. Please contact support.",
    "Email link is invalid or has expired":
      "This verification link has expired. Please request a new one.",
    "Token has expired or is invalid":
      "Your session has expired. Please sign in again.",
    "Invalid email or password": "Invalid email or password. Please try again.",
  };

  // Check for exact matches first
  if (errorMap[errorMessage]) {
    return errorMap[errorMessage];
  }

  // Check for partial matches
  const lowerMessage = errorMessage.toLowerCase();

  if (
    lowerMessage.includes("rate limit") ||
    lowerMessage.includes("too many requests")
  ) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }

  if (lowerMessage.includes("network") || lowerMessage.includes("fetch")) {
    return "Network error. Please check your internet connection and try again.";
  }

  if (lowerMessage.includes("timeout")) {
    return "Request timed out. Please try again.";
  }

  if (lowerMessage.includes("email") && lowerMessage.includes("invalid")) {
    return "Please enter a valid email address.";
  }

  if (lowerMessage.includes("password") && lowerMessage.includes("weak")) {
    return "Password is too weak. Please use a stronger password with a mix of characters.";
  }

  // Return the original message if no mapping found, but make it more user-friendly
  return errorMessage || "An unexpected error occurred. Please try again.";
}
