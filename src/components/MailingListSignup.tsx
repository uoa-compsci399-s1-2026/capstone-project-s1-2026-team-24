"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

type FormState = "idle" | "loading" | "success" | "error";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function MailingListSignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      setState("error");
      return;
    }

    setState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/mailing-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setErrorMessage(data.message || "Subscription failed. Please try again.");
        setState("error");
        return;
      }

      setState("success");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <p
        className="text-sm text-green-400"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Thanks for subscribing! You&apos;ll be the first to hear about our latest research.
      </p>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-300 mb-3">Stay updated with HNU research</p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state === "error") setState("idle");
            }}
            placeholder="Enter your email"
            className="flex-1 px-3 py-2 rounded text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Email address for mailing list"
            aria-describedby={state === "error" ? "mailing-list-error" : undefined}
            disabled={state === "loading"}
            required
          />
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            isLoading={state === "loading"}
            disabled={state === "loading"}
          >
            Subscribe
          </Button>
        </div>
        {state === "error" && (
          <p id="mailing-list-error" className="mt-2 text-xs text-red-400" role="alert">
            {errorMessage}
          </p>
        )}
      </form>
    </div>
  );
}
