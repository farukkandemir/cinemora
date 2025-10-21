import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { Resend } from "resend";
import { config } from "dotenv";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Bug, Lightbulb } from "lucide-react";
import { toast } from "sonner";

const feedbackSchema = z.object({
  type: z.enum(["bug", "suggestion"], {
    message: "Please select feedback type",
  }),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: "bug" | "suggestion";
}

const feedbackFn = createServerFn({ method: "POST" })
  .inputValidator((d: FeedbackFormData) => d)
  .handler(async ({ data }) => {
    try {
      // Load environment variables
      config();

      const resend = new Resend(process.env.RESEND_API_KEY!);

      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cinemora Feedback</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 300; letter-spacing: -0.5px;">
                ${data.type === "bug" ? "🐛 Bug Report" : "💡 Feature Suggestion"}
              </h1>
              <p style="margin: 10px 0 0 0; opacity: 0.8; font-size: 14px;">
                New feedback from Cinemora user
              </p>
            </div>

            <div style="background: #fafafa; padding: 25px; border-radius: 8px; border: 1px solid #e5e5e5;">
              <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 500; color: #1a1a1a;">
                  Subject
                </h3>
                <p style="margin: 0; font-size: 14px; color: #666; background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e5e5;">
                  ${data.subject}
                </p>
              </div>

              <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 500; color: #1a1a1a;">
                  Details
                </h3>
                <div style="font-size: 14px; color: #666; background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e5e5; white-space: pre-wrap;">
                  ${data.description}
                </div>
              </div>

              ${
                data.email
                  ? `
                <div>
                  <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 500; color: #1a1a1a;">
                    Contact Email
                  </h3>
                  <p style="margin: 0; font-size: 14px; color: #666; background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e5e5;">
                    ${data.email}
                  </p>
                </div>
              `
                  : `
                <div>
                  <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 500; color: #1a1a1a;">
                    Contact Email
                  </h3>
                  <p style="margin: 0; font-size: 14px; color: #999; background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e5e5;">
                    Anonymous (no email provided)
                  </p>
                </div>
              `
              }
            </div>

            <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 6px; border: 1px solid #bae6fd;">
              <p style="margin: 0; font-size: 12px; color: #0369a1;">
                This feedback was sent from the Cinemora feedback form.
              </p>
            </div>
          </body>
        </html>
      `;

      await resend.emails.send({
        from: "Cinemora <feedback@resend.dev>",
        to: process.env.RESEND_TO_EMAIL! || "farukkandemir09@gmail.com",
        subject: `Cinemora ${data.type === "bug" ? "Bug Report" : "Suggestion"}: ${data.subject}`,
        html: emailHtml,
      });
    } catch (error) {
      console.error("Error sending feedback:", error);
      throw error;
    }
  });

export function FeedbackModal({
  isOpen,
  onClose,
  initialType = "bug",
}: FeedbackModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sendFeedback = useServerFn(feedbackFn);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: initialType,
      subject: "",
      description: "",
      email: "",
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      await sendFeedback({ data });
      toast.success("Thank you for your feedback! We'll review it shortly.");
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to send feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-light text-foreground lowercase tracking-tight">
            share feedback
          </DialogTitle>
          <DialogDescription className="text-sm font-light text-muted-foreground">
            help us improve cinemora with your thoughts and suggestions
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Feedback Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-light text-muted-foreground">
                    what type of feedback is this?
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bug" id="bug" />
                        <Label
                          htmlFor="bug"
                          className="flex items-center space-x-2 text-sm font-light cursor-pointer"
                        >
                          <Bug className="h-4 w-4" />
                          <span>bug report</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="suggestion" id="suggestion" />
                        <Label
                          htmlFor="suggestion"
                          className="flex items-center space-x-2 text-sm font-light cursor-pointer"
                        >
                          <Lightbulb className="h-4 w-4" />
                          <span>suggestion</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage className="text-xs font-light" />
                </FormItem>
              )}
            />

            {/* Subject */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-light text-muted-foreground">
                    subject
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="brief summary of your feedback"
                      className="h-11 text-sm font-light bg-transparent border-border/50 focus:border-foreground/50 transition-colors duration-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-light" />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-light text-muted-foreground">
                    description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="please provide details about the issue or your suggestion"
                      className="min-h-[100px] text-sm font-light bg-transparent border-border/50 focus:border-foreground/50 transition-colors duration-200 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-light" />
                </FormItem>
              )}
            />

            {/* Email (Optional) */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-light text-muted-foreground">
                    email{" "}
                    <span className="text-muted-foreground/60">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your email address"
                      className="h-11 text-sm font-light bg-transparent border-border/50 focus:border-foreground/50 transition-colors duration-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-light" />
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="h-9 px-4 text-sm font-light bg-transparent border-border/50 hover:border-foreground/30 hover:bg-foreground/3 transition-all duration-200"
                disabled={isSubmitting}
              >
                cancel
              </Button>
              <Button
                type="submit"
                className="h-9 px-4 text-sm font-light bg-foreground text-background hover:bg-foreground/90 transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    sending...
                  </>
                ) : (
                  "send feedback"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
