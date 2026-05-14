"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminForm,
  FormField,
  FormCheckbox,
} from "@/components/admin/AdminForm";

export default function NewPartner() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    websiteUrl: "",
    logoFile: null as File | null,
    isPlaceholder: false,
    order: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const target = e.target as any;
    const { name, type, value, checked, files } = target;

    if (name === "logoFile") {
      setFormData((prev) => ({
        ...prev,
        logoFile: files?.[0] || null,
      }));
    } else {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!formData.logoFile) {
        setError("Please select a logo file");
        setIsLoading(false);
        return;
      }

      const data = new FormData();
      data.append("name", formData.name);
      data.append("websiteUrl", formData.websiteUrl);
      data.append("file", formData.logoFile);
      data.append("isPlaceholder", String(formData.isPlaceholder));
      data.append("order", String(formData.order));

      const res = await fetch("/api/admin/partner-logos", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Failed to create partner" }));
        throw new Error(
          errorData.error || `Failed to create partner (${res.status})`,
        );
      }

      router.push("/admin/partners");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminForm
      title="Add Partner"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitButtonLabel="Add Partner"
    >
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      )}

      <FormField
        label="Partner Name"
        id="name"
        placeholder="Organization name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <FormField
        label="Website URL"
        id="websiteUrl"
        type="url"
        placeholder="https://example.com"
        value={formData.websiteUrl}
        onChange={handleChange}
        required
      />

      <div>
        <label
          htmlFor="logoFile"
          className="block text-sm font-medium text-gray-900 mb-2"
        >
          Logo <span className="text-red-600 ml-1">*</span>
        </label>
        <input
          id="logoFile"
          name="logoFile"
          type="file"
          accept="image/*"
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <p className="text-sm text-gray-500 mt-1">
          Accepted formats: PNG, JPEG, WebP, GIF, SVG. Max 5MB.
        </p>
      </div>

      <FormField
        label="Order"
        id="order"
        type="number"
        value={formData.order}
        onChange={handleChange}
      />

      <FormCheckbox
        label="Placeholder Logo"
        id="isPlaceholder"
        checked={formData.isPlaceholder}
        onChange={handleChange}
      />
    </AdminForm>
  );
}
