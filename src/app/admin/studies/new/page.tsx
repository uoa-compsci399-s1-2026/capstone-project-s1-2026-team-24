"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminForm,
  FormField,
  FormCheckbox,
} from "@/components/admin/AdminForm";

export default function NewStudy() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    shortDescription: "",
    fullDescriptionEn: "",
    fullDescriptionZh: "",
    eligibilityEn: "",
    eligibilityZh: "",
    compensationEn: "",
    compensationZh: "",
    redcapUrl: "",
    contactEmail: "",
    contactPhone: "",
    contactPhoneZh: "",
    ethicsStatement: "",
    imagePath: "",
    isActive: true,
    order: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, type, value, checked } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? Number(value)
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Failed to create study" }));
        throw new Error(
          errorData.error || `Failed to create study (${res.status})`,
        );
      }

      router.push("/admin/studies");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminForm
      title="Create New Study"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitButtonLabel="Create Study"
    >
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      )}

      <FormField
        label="Study Slug"
        id="slug"
        placeholder="e.g., nz-synergy"
        value={formData.slug}
        onChange={handleChange}
        required
      />

      <FormField
        label="Title"
        id="title"
        placeholder="Study title"
        value={formData.title}
        onChange={handleChange}
        required
      />

      <FormField
        label="Short Description"
        id="shortDescription"
        type="textarea"
        placeholder="Brief description"
        value={formData.shortDescription}
        onChange={handleChange}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Full Description (English)"
          id="fullDescriptionEn"
          type="textarea"
          value={formData.fullDescriptionEn}
          onChange={handleChange}
          required
        />
        <FormField
          label="Full Description (Chinese)"
          id="fullDescriptionZh"
          type="textarea"
          value={formData.fullDescriptionZh}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Eligibility (English)"
          id="eligibilityEn"
          type="textarea"
          value={formData.eligibilityEn}
          onChange={handleChange}
          required
        />
        <FormField
          label="Eligibility (Chinese)"
          id="eligibilityZh"
          type="textarea"
          value={formData.eligibilityZh}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Compensation (English)"
          id="compensationEn"
          type="textarea"
          value={formData.compensationEn}
          onChange={handleChange}
          required
        />
        <FormField
          label="Compensation (Chinese)"
          id="compensationZh"
          type="textarea"
          value={formData.compensationZh}
          onChange={handleChange}
          required
        />
      </div>

      <FormField
        label="REDCap URL"
        id="redcapUrl"
        type="url"
        placeholder="https://redcap.example.com"
        value={formData.redcapUrl}
        onChange={handleChange}
        required
      />

      <FormField
        label="Contact Email"
        id="contactEmail"
        type="email"
        placeholder="contact@example.com"
        value={formData.contactEmail}
        onChange={handleChange}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Contact Phone"
          id="contactPhone"
          type="tel"
          value={formData.contactPhone}
          onChange={handleChange}
          required
        />
        <FormField
          label="Contact Phone (Chinese)"
          id="contactPhoneZh"
          type="tel"
          value={formData.contactPhoneZh}
          onChange={handleChange}
          required
        />
      </div>

      <FormField
        label="Ethics Statement"
        id="ethicsStatement"
        type="textarea"
        value={formData.ethicsStatement}
        onChange={handleChange}
        required
      />

      <FormField
        label="Image Path"
        id="imagePath"
        placeholder="/images/study.jpg"
        value={formData.imagePath}
        onChange={handleChange}
      />

      <FormField
        label="Order"
        id="order"
        type="number"
        value={formData.order}
        onChange={handleChange}
      />

      <FormCheckbox
        label="Active"
        id="isActive"
        checked={formData.isActive}
        onChange={handleChange}
      />
    </AdminForm>
  );
}
