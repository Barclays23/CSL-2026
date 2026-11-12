import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { FormField } from "@/components/forms/FormField";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { USE_MOCK_API } from "@/config/env";
import { useAuth } from "@/contexts/AuthContext";
import { PREVIEW_LOGIN } from "@/mocks/repository";
import { loginSchema, type LoginValues } from "@/schemas/auth.schema";
import { errorMessage } from "@/utils/errorHandler";

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) void navigate({ to: "/admin/dashboard" });
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <PageContainer className="max-w-lg">
      <GlassCard className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Administrator</p>
        <h1 className="mt-2 font-display text-5xl text-fg">Sign in</h1>
        <p className="mt-2 text-sm text-muted">Visitors can browse everything without an account. This login is only for the tournament admin.</p>
        {USE_MOCK_API ? (
          <p className="mt-4 rounded-control border border-line bg-surface px-3 py-2 text-sm text-muted">
            Preview mode, not production authentication. Sample admin: {PREVIEW_LOGIN.email} / {PREVIEW_LOGIN.password}
          </p>
        ) : null}
        <form
          className="mt-6 grid gap-4"
          onSubmit={form.handleSubmit(async (values) => {
            setSubmitting(true);
            try {
              await login(values.email, values.password);
              toast.success("Welcome back");
            } catch (error) {
              toast.error(errorMessage(error));
            } finally {
              setSubmitting(false);
            }
          })}
        >
          <FormField label="Email" required error={form.formState.errors.email?.message}>
            <Input type="email" autoComplete="username" {...form.register("email")} />
          </FormField>
          <FormField label="Password" required error={form.formState.errors.password?.message}>
            <Input type="password" autoComplete="current-password" {...form.register("password")} />
          </FormField>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </GlassCard>
    </PageContainer>
  );
}
