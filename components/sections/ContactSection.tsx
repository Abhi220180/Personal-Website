"use client";

import { contactInfo } from "@/lib/content";
import { FormEvent, useMemo, useState } from "react";

type FormValues = {
  visitorEmail: string;
  subject: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  visitorEmail: "",
  subject: "",
  message: ""
};

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const trimmedEmail = values.visitorEmail.trim();
  const trimmedSubject = values.subject.trim();
  const trimmedMessage = values.message.trim();

  if (!trimmedEmail) {
    errors.visitorEmail = "Enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.visitorEmail = "Use a valid email format.";
  }

  if (!trimmedSubject) {
    errors.subject = "Add a short subject.";
  } else if (trimmedSubject.length < 4) {
    errors.subject = "Subject should be at least 4 characters.";
  }

  if (!trimmedMessage) {
    errors.message = "Write a brief message.";
  } else if (trimmedMessage.length < 18) {
    errors.message = "Message should be at least 18 characters.";
  }

  return errors;
}

export function ContactSection() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      setStatusMessage("Please fix the highlighted fields and try again.");
      return;
    }

    setStatus("sending");
    const formspreeEndpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

    try {
      if (formspreeEndpoint) {
        const response = await fetch(formspreeEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            email: values.visitorEmail.trim(),
            subject: values.subject.trim(),
            message: values.message.trim()
          })
        });
        if (!response.ok) {
          throw new Error("Failed to send with Formspree endpoint.");
        }
      } else {
        const subject = encodeURIComponent(values.subject.trim());
        const body = encodeURIComponent(
          `From: ${values.visitorEmail.trim()}\n\n${values.message.trim()}`
        );
        window.location.href = `mailto:${contactInfo.recipientEmail}?subject=${subject}&body=${body}`;
      }

      setStatus("success");
      setStatusMessage(
        formspreeEndpoint
          ? "Message sent. Thanks for reaching out."
          : "Your email client was opened with a pre-filled draft."
      );
      setValues(initialValues);
      setErrors({});
    } catch {
      setStatus("error");
      setStatusMessage("Unable to send right now. Please email me directly.");
    }
  };

  const inputBase =
    "w-full rounded-none border border-black/15 bg-white/50 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-black/50 placeholder:text-mist/60 dark:border-white/25 dark:bg-white/5 dark:focus:border-white/55 dark:placeholder:text-mist/80";

  return (
    <section id="contact" className="section-rule">
      <div className="mx-auto w-full max-w-6xl px-6 py-24 md:px-10 md:py-28">
        <p className="editorial-kicker mb-8 text-xs text-mist">Contact</p>

        <div className="max-w-2xl border border-black/10 bg-white/70 p-6 md:p-8 dark:border-white/15 dark:bg-white/[0.04]">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.16em] text-mist">Email</p>
            <a
              href={`mailto:${contactInfo.recipientEmail}`}
              className="mt-1 inline-block text-base text-ink underline-offset-4 hover:underline md:text-lg"
            >
              {contactInfo.displayEmail}
            </a>
            <p className="mt-0.5 text-sm text-mist">{contactInfo.location}</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="grid gap-4">
            <label className="grid gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-mist">Your Email</span>
              <input
                type="email"
                value={values.visitorEmail}
                onChange={(event) =>
                  setValues((previous) => ({ ...previous, visitorEmail: event.target.value }))
                }
                className={inputBase}
                placeholder="name@example.com"
                aria-invalid={Boolean(errors.visitorEmail)}
                aria-describedby={errors.visitorEmail ? "visitor-email-error" : undefined}
              />
              {errors.visitorEmail ? (
                <span id="visitor-email-error" className="text-xs text-[#8e2f2f]">
                  {errors.visitorEmail}
                </span>
              ) : null}
            </label>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-mist">Subject</span>
              <input
                type="text"
                value={values.subject}
                onChange={(event) =>
                  setValues((previous) => ({ ...previous, subject: event.target.value }))
                }
                className={inputBase}
                placeholder="Project collaboration"
                aria-invalid={Boolean(errors.subject)}
                aria-describedby={errors.subject ? "subject-error" : undefined}
              />
              {errors.subject ? (
                <span id="subject-error" className="text-xs text-[#8e2f2f]">
                  {errors.subject}
                </span>
              ) : null}
            </label>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-mist">Message</span>
              <textarea
                value={values.message}
                onChange={(event) =>
                  setValues((previous) => ({ ...previous, message: event.target.value }))
                }
                className={`${inputBase} min-h-[120px] resize-y`}
                placeholder="Share context, timeline, and what you are looking for."
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "message-error" : undefined}
              />
              {errors.message ? (
                <span id="message-error" className="text-xs text-[#8e2f2f]">
                  {errors.message}
                </span>
              ) : null}
            </label>

            <div className="mt-1 flex items-center gap-4">
              <button
                type="submit"
                disabled={status === "sending"}
                className="rounded-none border border-black bg-black px-6 py-2.5 text-xs uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-60 dark:border-white/40 dark:bg-white dark:text-black"
              >
                {status === "sending" ? "Sending..." : "Send"}
              </button>
              <span className="text-[11px] text-mist/70">
                {process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT
                  ? "Formspree-enabled"
                  : "mailto fallback enabled"}
              </span>
            </div>

            {status !== "idle" ? (
              <p
                className={`text-sm ${
                  status === "success"
                    ? "text-[#1f5138]"
                    : hasErrors || status === "error"
                      ? "text-[#8e2f2f]"
                      : "text-mist"
                }`}
              >
                {statusMessage}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
