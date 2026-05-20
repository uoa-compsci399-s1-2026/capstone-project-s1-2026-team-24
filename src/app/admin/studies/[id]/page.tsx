"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminForm, FormErrorBanner } from "@/components/admin/AdminForm";
import {
  StudyFormFields,
  emptyStudyFormData,
  studyToFormData,
  type StudyFormData,
} from "@/components/admin/StudyFormFields";

type Props = {
  params: Promise<{ id: string }>;
};

export default function EditStudy({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStudy, setIsLoadingStudy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState<StudyFormData>(emptyStudyFormData);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoadingStudy(true);
        const res = await fetch(`/api/admin/studies/${id}`);
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error("Failed to load study");
        const data = await res.json();
        if (!cancelled) setFormData(studyToFormData(data));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      } finally {
        if (!cancelled) setIsLoadingStudy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const target = e.target as HTMLInputElement;
    const { name, type, value, checked } = target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? Number(value)
            : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const body = {
        ...formData,
        publishedAt: formData.publishedAt || null,
      };
      const res = await fetch(`/api/admin/studies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Failed to update study" }));
        throw new Error(
          errorData.error || `Failed to update study (${res.status})`,
        );
      }
      router.push("/admin/studies");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  if (notFound) {
    return (
      <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.06)] p-12 text-center">
        <h1 className="text-2xl font-bold text-[#0c0c48]">Study not found</h1>
        <p className="text-[#0a4479]/80 mt-3">
          That study may have been deleted, or the ID is wrong.
        </p>
        <button
          onClick={() => router.push("/admin/studies")}
          className="mt-6 inline-flex items-center justify-center bg-[#0a4479] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#083559] transition-colors"
        >
          Back to studies
        </button>
      </div>
    );
  }

  if (isLoadingStudy) {
    return (
      <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.06)] p-12 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-[#0a4479]/20 border-t-[#0a4479] animate-spin" />
      </div>
    );
  }

  return (
    <AdminForm
      title={`Edit ${formData.title || "study"}`}
      kicker="Studies"
      description="Update any of the fields below. Changes are visible on the public study page immediately after saving."
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitButtonLabel="Save changes"
      cancelHref="/admin/studies"
    >
      {error && <FormErrorBanner message={error} />}
      <StudyFormFields formData={formData} onChange={handleChange} />
    </AdminForm>
  );
}
