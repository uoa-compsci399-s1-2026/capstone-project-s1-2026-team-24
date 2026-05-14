"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardStats {
  studies: number;
  teamMembers: number;
  partners: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    studies: 0,
    teamMembers: 0,
    partners: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studiesRes, teamRes, partnersRes] = await Promise.all([
          fetch("/api/admin/studies"),
          fetch("/api/admin/team"),
          fetch("/api/admin/partner-logos"),
        ]);

        const studies = await studiesRes.json();
        const team = await teamRes.json();
        const partners = await partnersRes.json();

        setStats({
          studies: Array.isArray(studies) ? studies.length : 0,
          teamMembers: Array.isArray(team) ? team.length : 0,
          partners: Array.isArray(partners) ? partners.length : 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Studies",
      count: stats.studies,
      icon: "📚",
      href: "/admin/studies",
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Team Members",
      count: stats.teamMembers,
      icon: "👥",
      href: "/admin/team",
      color: "bg-green-50 text-green-700",
    },
    {
      title: "Partners",
      count: stats.partners,
      icon: "🤝",
      href: "/admin/partners",
      color: "bg-purple-50 text-purple-700",
    },
  ];

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome to the admin dashboard</p>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {statCards.map((card) => (
            <Link key={card.href} href={card.href}>
              <div
                className={`${card.color} p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">{card.title}</h2>
                    <p className="text-3xl font-bold">{card.count}</p>
                  </div>
                  <div className="text-5xl">{card.icon}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/studies">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Manage Studies
            </button>
          </Link>
          <Link href="/admin/team">
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              Manage Team
            </button>
          </Link>
          <Link href="/admin/partners">
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
              Manage Partners
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
