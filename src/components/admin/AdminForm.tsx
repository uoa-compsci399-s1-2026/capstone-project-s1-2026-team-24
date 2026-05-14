import { ReactNode } from "react";

interface AdminFormProps {
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  children: ReactNode;
  submitButtonLabel?: string;
}

export function AdminForm({
  title,
  onSubmit,
  isLoading = false,
  children,
  submitButtonLabel = "Save",
}: AdminFormProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-lg shadow p-8 max-w-2xl"
      >
        <div className="space-y-6">{children}</div>
        <div className="mt-8 flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Saving..." : submitButtonLabel}
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="bg-gray-300 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  required?: boolean;
  rows?: number;
  options?: { value: string; label: string }[];
}

export function FormField({
  label,
  id,
  type = "text",
  placeholder = "",
  value,
  onChange,
  required = false,
  rows,
  options,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-900 mb-2"
      >
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          rows={rows || 4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      ) : type === "select" ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="">Select {label}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      )}
    </div>
  );
}

interface FormCheckboxProps {
  label: string;
  id: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FormCheckbox({
  label,
  id,
  checked,
  onChange,
}: FormCheckboxProps) {
  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-2 focus:ring-blue-600"
      />
      <label htmlFor={id} className="ml-2 text-sm font-medium text-gray-900">
        {label}
      </label>
    </div>
  );
}
