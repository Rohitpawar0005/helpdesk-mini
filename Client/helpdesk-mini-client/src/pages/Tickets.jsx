import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL; // Using the more robust fetch logic
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/tickets`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          // Attempt to get error message from backend response
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.message || "Failed to fetch tickets");
        }

        const data = await res.json();
        setTickets(data.tickets || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) return <div className="p-6">Loading tickets...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">All Tickets</h1>

      {tickets.length === 0 ? (
        <p className="text-gray-500">No tickets found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Assigned To</th>
                <th className="p-3 text-left">Created At</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    {/* Feature from second component: Clickable title */}
                    <Link
                      to={`/tickets/${ticket._id}`}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      {ticket.title}
                    </Link>
                  </td>
                  <td className="p-3 text-gray-600 text-sm">
                    {/* Feature from second component: Description */}
                    {ticket.description}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        ticket.status === "open"
                          ? "bg-green-100 text-green-700"
                          : ticket.status === "in-progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {ticket.assignedTo?.name || "Unassigned"}
                  </td>
                  <td className="p-3 text-gray-500 text-sm">
                    {/* Using more detailed date format from second component */}
                    {new Date(ticket.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Tickets;