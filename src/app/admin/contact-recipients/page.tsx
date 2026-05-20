"use client";

import { useEffect, useState } from "react";

type Recipient = {
  id: number;
  category: string;
  email: string;
};

export default function AdminContactRecipients() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Record<string, string>>({});
  const [savingCategory, setSavingCategory] = useState<string | null>(null);
  const [savedCategory, setSavedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipients();
  }, []);

  async function fetchRecipients() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/contact-recipients");
      if (!res.ok) throw new Error("Failed to load recipients");
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      setRecipients(arr);
      const next: Record<string, string> = {};
      for (const r of arr) next[r.category] = r.email;
      setPending(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function save(category: string) {
    setSavingCategory(category);
    setError(null);
    try {
      const res = await fetch("/api/admin/contact-recipients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, email: pending[category] || "" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update recipient");
      }
      await fetchRecipients();
      setSavedCategory(category);
      setTimeout(
        () =>
          setSavedCategory((prev) => (prev === category ? null : prev)),
        2500,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSavingCategory(null);
    }
  }

  return (
    <div>
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[2px] text-[#0a4479]/70">
          Contacts
        </p>
        <h1 className="text-4xl font-extrabold text-[#0c0c48] mt-1 tracking-tight">
          Contact recipients
        </h1>
        <p className="text-[#0a4479]/80 mt-2 max-w-2xl">
          When someone submits the contact form, the message is stored AND
          routed to the email address for the chosen inquiry type. Edit those
          addresses here.
        </p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.06)] p-12 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-2 border-[#0a4479]/20 border-t-[#0a4479] animate-spin" />
        </div>
      ) : (
        <section className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.06)] divide-y divide-[#0a4479]/10">
          {recipients.map((r) => {
            const value = pending[r.category] ?? "";
            const dirty = value !== r.email;
            const justSaved = savedCategory === r.category;
            return (
              <div
                key={r.id}
                className="px-6 py-5 flex flex-col md:flex-row md:items-center gap-3"
              >
                <div className="md:w-72">
                  <p className="text-sm font-semibold text-[#0c0c48]">
                    {r.category}
                  </p>
                  <p className="text-xs text-[#0a4479]/70">
                    Inbox for this inquiry type
                  </p>
                </div>
                <input
                  type="email"
                  value={value}
                  onChange={(e) =>
                    setPending((prev) => ({
                      ...prev,
                      [r.category]: e.target.value,
                    }))
                  }
                  className="flex-1 px-4 py-2.5 border-2 border-[#cac7c7] rounded-2xl text-sm text-[#0c0c48] focus:outline-none focus:border-[#0a4479]"
                />
                <button
                  onClick={() => save(r.category)}
                  disabled={!dirty || savingCategory === r.category}
                  className="inline-flex items-center justify-center bg-[#0a4479] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#083559] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-fit"
                >
                  {savingCategory === r.category
                    ? "Saving..."
                    : justSaved
                      ? "Saved"
                      : "Save"}
                </button>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
