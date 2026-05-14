"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TeamMember {
  id: number;
  name: string;
  title: string;
  section: string;
  isVisible: boolean;
  order: number;
}

export default function AdminTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/team");
      if (!res.ok) throw new Error("Failed to fetch team members");
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleVisible = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/team/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !currentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update team member");
      await fetchMembers();
    } catch (err) {
      console.error("Error updating team member:", err);
    }
  };

  const deleteMember = async (id: number) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    try {
      const res = await fetch(`/api/admin/team/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete team member");
      await fetchMembers();
    } catch (err) {
      console.error("Error deleting team member:", err);
    }
  };

  const groupedMembers = members.reduce(
    (acc, member) => {
      if (!acc[member.section]) acc[member.section] = [];
      acc[member.section].push(member);
      return acc;
    },
    {} as Record<string, TeamMember[]>,
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Manage Team Members
        </h1>
        <Link href="/admin/team/new">
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
            + Add Team Member
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
      ) : Object.keys(groupedMembers).length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">No team members found</p>
          <Link href="/admin/team/new">
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Add First Team Member
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedMembers).map(([section, sectionMembers]) => (
            <div
              key={section}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="bg-gray-100 px-6 py-4 border-b">
                <h2 className="text-xl font-bold text-gray-900">{section}</h2>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">
                      Visible
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sectionMembers.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {member.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {member.title}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {member.order}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            toggleVisible(member.id, member.isVisible)
                          }
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            member.isVisible
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {member.isVisible ? "Visible" : "Hidden"}
                        </button>
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <Link href={`/admin/team/${member.id}`}>
                          <button className="text-blue-600 hover:text-blue-800 font-medium">
                            Edit
                          </button>
                        </Link>
                        <button
                          onClick={() => deleteMember(member.id)}
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
          ))}
        </div>
      )}
    </div>
  );
}
