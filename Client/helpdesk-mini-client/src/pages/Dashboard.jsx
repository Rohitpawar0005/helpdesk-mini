import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Ticket, FileCheck, Loader, FolderClosed } from "lucide-react";

// A small component for individual stat cards
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateDashboardData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem("token");
        
        // FIX: Fetch all tickets and generate stats on the client-side
        // This avoids the error from the non-existent /api/dashboard endpoint
        const res = await fetch(`${API_URL}/api/tickets`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch tickets to build dashboard");
        }
        
        const result = await res.json();
        const tickets = result.tickets || [];

        // Calculate stats from the tickets list
        const stats = {
            open: tickets.filter(t => t.status === 'open').length,
            'in-progress': tickets.filter(t => t.status === 'in-progress').length,
            closed: tickets.filter(t => t.status === 'closed').length,
            total: tickets.length,
        };

        // Get the 5 most recent tickets
        const recentTickets = tickets
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        setData({ stats, recentTickets });

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    generateDashboardData();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

  const { stats, recentTickets } = data;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard 🚀</h1>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Open Tickets" 
            value={stats.open || 0}
            icon={<Ticket size={24} className="text-green-800"/>}
            color="bg-green-100"
        />
        <StatCard 
            title="In-Progress" 
            value={stats['in-progress'] || 0}
            icon={<Loader size={24} className="text-yellow-800"/>}
            color="bg-yellow-100"
        />
        <StatCard 
            title="Closed Tickets" 
            value={stats.closed || 0}
            icon={<FileCheck size={24} className="text-blue-800"/>}
            color="bg-blue-100"
        />
        <StatCard 
            title="Total Tickets" 
            value={stats.total || 0}
            icon={<FolderClosed size={24} className="text-gray-800"/>}
            color="bg-gray-200"
        />
      </div>

      {/* Recent Tickets List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Recent Activity</h2>
        {recentTickets.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {recentTickets.map((ticket) => (
              <li key={ticket._id} className="py-3 flex justify-between items-center">
                <div>
                  <Link to={`/tickets/${ticket._id}`} className="text-blue-600 hover:underline font-medium">
                    {ticket.title}
                  </Link>
                  <p className="text-sm text-gray-500">
                    Assigned to: {ticket.assignedTo?.name || "Unassigned"}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs capitalize font-semibold ${
                    ticket.status === "open"
                      ? "bg-green-100 text-green-700"
                      : ticket.status === "in-progress"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                  {ticket.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No recent tickets to display.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;