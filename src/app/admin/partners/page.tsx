"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Partner {
  id: number;
  name: string;
  websiteUrl: string;
  isPlaceholder: boolean;
  order: number;
}

export default function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/partner-logos");
      if (!res.ok) throw new Error("Failed to fetch partners");
      const data = await res.json();
      setPartners(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const togglePlaceholder = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/partner-logos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPlaceholder: !currentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update partner");
      await fetchPartners();
    } catch (err) {
      console.error("Error updating partner:", err);
    }
  };

  const deletePartner = async (id: number) => {
    if (!confirm("Are you sure you want to delete this partner?")) return;
    try {
      const res = await fetch(`/api/admin/partner-logos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete partner");
      await fetchPartners();
    } catch (err) {
      console.error("Error deleting partner:", err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Manage Partners</h1>
        <Link href="/admin/partners/new">
          <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            + Add Partner
          </button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">No partners found</p>
          <Link href="/admin/partners/new">
            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Add First Partner
            </button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">
                  Name
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">
                  Website
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">
                  Order
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">
                  Type
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => (
                <tr key={partner.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {partner.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600 truncate max-w-xs">
                    <a
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {partner.websiteUrl}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{partner.order}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        togglePlaceholder(partner.id, partner.isPlaceholder)
                      }
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        partner.isPlaceholder
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}
                    >
                      {partner.isPlaceholder ? "Placeholder" : "Real"}
                    </button>
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <Link href={`/admin/partners/${partner.id}`}>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => deletePartner(partner.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
