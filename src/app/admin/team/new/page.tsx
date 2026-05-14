"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminForm,
  FormField,
  FormCheckbox,
} from "@/components/admin/AdminForm";

export default function NewTeamMember() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    section: "ResearchTeam",
    bio: "",
    photoFile: null as File | null,
    order: 0,
    isVisible: true,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const target = e.target as any;
    const { name, type, value, checked, files } = target;

    if (name === "photoFile") {
      setFormData((prev) => ({
        ...prev,
        photoFile: files?.[0] || null,
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
      if (!formData.photoFile) {
        setError("Please select a photo file");
        setIsLoading(false);
        return;
      }

      const data = new FormData();
      data.append("name", formData.name);
      data.append("title", formData.title);
      data.append("section", formData.section);
      data.append("bio", formData.bio);
      data.append("photo", formData.photoFile);
      data.append("order", String(formData.order));
      data.append("isVisible", String(formData.isVisible));

      const res = await fetch("/api/admin/team", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Failed to create team member" }));
        throw new Error(
          errorData.error || `Failed to create team member (${res.status})`,
        );
      }

      router.push("/admin/team");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminForm
      title="Add Team Member"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitButtonLabel="Add Member"
    >
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      )}

      <FormField
        label="Name"
        id="name"
        placeholder="Full name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <FormField
        label="Title"
        id="title"
        placeholder="Job title"
        value={formData.title}
        onChange={handleChange}
        required
      />

      <FormField
        label="Section"
        id="section"
        type="select"
        value={formData.section}
        onChange={handleChange}
        options={[
          { value: "ResearchTeam", label: "Research Team" },
          { value: "BoardOfDirectors", label: "Board of Directors" },
        ]}
        required
      />

      <FormField
        label="Biography"
        id="bio"
        type="textarea"
        placeholder="Team member biography"
        value={formData.bio}
        onChange={handleChange}
        required
        rows={5}
      />

      <div>
        <label
          htmlFor="photoFile"
          className="block text-sm font-medium text-gray-900 mb-2"
        >
          Photo <span className="text-red-600 ml-1">*</span>
        </label>
        <input
          id="photoFile"
          name="photoFile"
          type="file"
          accept="image/*"
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <p className="text-sm text-gray-500 mt-1">
          Accepted formats: JPEG, PNG, WebP. Max 5MB.
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
        label="Visible"
        id="isVisible"
        checked={formData.isVisible}
        onChange={handleChange}
      />
    </AdminForm>
  );
}
