"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Send } from "lucide-react";
import Script from "next/script";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/form";
import { contactFormSchema, type ContactFormValues } from "@/lib/validation";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

/**
 * Contact form.
 *
 * Validation runs client-side for fast feedback and again inside
 * `/api/contact`, which is the actual trust boundary. reCAPTCHA v3 is loaded
 * only when a site key is configured, so local development works without one.
 */
export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  // With no site key there is no script to wait for, so the form is usable
  // immediately. Otherwise `grecaptcha.ready` flips this once loaded.
  const [recaptchaReady, setRecaptchaReady] = useState(!SITE_KEY);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: "",
      companyName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      website: "",
    },
  });

  const getRecaptchaToken = useCallback(async (): Promise<string | undefined> => {
    if (!SITE_KEY || !window.grecaptcha) return undefined;
    try {
      return await window.grecaptcha.execute(SITE_KEY, { action: "contact" });
    } catch (error) {
      console.error("[contact] Could not obtain a reCAPTCHA token:", error);
      return undefined;
    }
  }, []);

  async function onSubmit(values: ContactFormValues) {
    const recaptchaToken = await getRecaptchaToken();

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, recaptchaToken }),
      });

      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Something went wrong. Please try again.");
      }

      setSubmitted(true);
      reset();
      toast.success("Message sent — we'll be in touch within one business day.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast.error(message);
    }
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="surface-card flex flex-col items-center gap-4 px-8 py-16 text-center"
      >
        <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-400">
          <CheckCircle2 aria-hidden className="size-7" />
        </span>
        <h2 className="text-xl font-semibold text-navy-950 dark:text-white">
          Thanks — your message is on its way
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-navy-600 dark:text-navy-300">
          We read every enquiry ourselves and reply within one business day, usually sooner.
        </p>
        <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <>
      {SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`}
          strategy="lazyOnload"
          onLoad={() => window.grecaptcha?.ready(() => setRecaptchaReady(true))}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="surface-card p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-navy-950 dark:text-white">Send us a message</h2>
        <p className="mt-1.5 text-sm text-navy-500 dark:text-navy-400">
          Fields marked with an asterisk are required.
        </p>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <Input
            label="Full name"
            required
            autoComplete="name"
            placeholder="Jane Cooper"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
          <Input
            label="Company name"
            autoComplete="organization"
            placeholder="Acme Inc."
            error={errors.companyName?.message}
            {...register("companyName")}
          />
          <Input
            label="Email address"
            type="email"
            required
            autoComplete="email"
            placeholder="jane@acme.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Phone number"
            type="tel"
            autoComplete="tel"
            placeholder="+1 555 000 0000"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Subject"
            required
            containerClassName="sm:col-span-2"
            placeholder="New platform build"
            error={errors.subject?.message}
            {...register("subject")}
          />
          <Textarea
            label="Message"
            required
            rows={6}
            containerClassName="sm:col-span-2"
            placeholder="Tell us what you're building, roughly when you need it, and anything that's already decided."
            error={errors.message?.message}
            {...register("message")}
          />
        </div>

        {/* Honeypot — visually and programmatically hidden from real users. */}
        <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
          <label htmlFor="website-field">Leave this field empty</label>
          <input
            id="website-field"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("website")}
          />
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Button type="submit" size="lg" loading={isSubmitting} disabled={!recaptchaReady}>
            {!isSubmitting && <Send aria-hidden className="size-4" />}
            {isSubmitting ? "Sending…" : "Send message"}
          </Button>

          {SITE_KEY && (
            <p className="text-xs leading-relaxed text-navy-400 dark:text-navy-500">
              Protected by reCAPTCHA. Google&apos;s{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-navy-600"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-navy-600"
              >
                Terms
              </a>{" "}
              apply.
            </p>
          )}
        </div>
      </form>
    </>
  );
}
