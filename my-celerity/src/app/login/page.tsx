"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Fingerprint, Lock, Mail, ShieldCheck, Wifi } from "lucide-react";
import { useAuth, DEMO_CREDENTIALS } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/dashboard");
  }, [isLoading, isAuthenticated, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace("/dashboard");
  }

  function fillDemo() {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setError(null);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080514] px-4 py-10">
      {/* Subtle fiber-optic dot field + glow, echoing the dotted "C" in the
          real Celerity Fiber mark -- kept quiet so it reads as texture,
          not decoration. */}
      <div className="fiber-dots pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -left-32 top-1/3 size-[420px] rounded-full bg-teal-600/25 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-[420px] rounded-full bg-brand-700/30 blur-[120px]" />

      <div className="relative z-10 grid w-full max-w-4xl gap-10 lg:grid-cols-2 lg:items-center">
        {/* Left: brand storytelling, hidden on small screens */}
        <div className="hidden flex-col gap-6 text-white lg:flex">
          <Image src="/brand/celerity-logo.png" alt="Celerity Fiber" width={220} height={60} priority />
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight">
            Your internet.
            <br />
            Your account.
            <br />
            <span className="brand-gradient-text">One place.</span>
          </h1>
          <p className="max-w-sm text-[15px] leading-relaxed text-white/60">
            Manage your Celerity Fiber service, payments and account — built
            around the fiber network already running your property.
          </p>
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Wifi className="size-4 text-teal-400" />
            Symmetrical fiber speeds up to 10 Gbps
          </div>
        </div>

        {/* Right: auth card */}
        <div className="animate-slide-up rounded-3xl border border-white/10 bg-white p-7 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:p-9">
          <div className="mb-7 flex flex-col items-start gap-4 lg:hidden">
            <Image src="/brand/celerity-logo.png" alt="Celerity Fiber" width={168} height={46} priority />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Manage your Celerity Fiber service, payments and account.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  className="pl-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs font-semibold text-brand-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  className="pl-11 pr-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger" role="alert">
                {error}
              </p>
            )}

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground/80">
              <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
              Remember me
            </label>

            <Button type="submit" size="lg" className="w-full" loading={submitting}>
              Sign In
            </Button>

            <button
              type="button"
              onClick={fillDemo}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-brand-300 hover:text-brand-700"
            >
              <ShieldCheck className="size-3.5" />
              Use demo credentials
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3 text-muted-foreground/60">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            disabled
            title="Available in the My Celerity mobile app"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-semibold text-muted-foreground/70"
          >
            <Fingerprint className="size-4" />
            Sign in with Face ID
          </button>

          <p className="mt-7 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="#" className="font-semibold text-brand-700 hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
