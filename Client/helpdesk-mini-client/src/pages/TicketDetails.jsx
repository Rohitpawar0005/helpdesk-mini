import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Ticket } from "lucide-react";


const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch Ticket
        const resTicket = await fetch(`${API_URL}/api/tickets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ticketData = await resTicket.json();

        // Fetch Comments
        const resComments = await fetch(`${API_URL}/api/tickets/${id}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const commentsData = await resComments.json();

        if (resTicket.ok) setTicket(ticketData);
        else setError(ticketData.message || "Failed to load ticket");

        if (resComments.ok) setComments(commentsData);
      } catch (err) {
        setError("⚠️ Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Submit a new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/tickets/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ content: newComment, parent: replyTo }),
      });

      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, data.comment]);
        setNewComment("");
        setReplyTo(null);
      } else {
        alert(data.message || "Failed to add comment");
      }
    } catch {
      alert("⚠️ Network error");
    }
  };

  if (loading) return <div className="p-6 text-center">Loading ticket...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!ticket) return <div className="p-6 text-center text-red-500">Ticket not found.</div>;

  // Recursive threaded comments rendering
  const renderComments = (parentId = null) =>
    comments
      .filter((c) => (c.parent ? c.parent._id === parentId : parentId === null))
      .map((comment) => (
        <div key={comment._id} className="ml-4 border-l pl-4 mb-4">
          <p className="text-sm">
            <span className="font-semibold">{comment.user?.name}:</span>{" "}
            {comment.content}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(comment.createdAt).toLocaleString()}
          </p>
          <button
            onClick={() => setReplyTo(comment._id)}
            className="text-blue-500 text-xs mt-1 hover:underline"
          >
            Reply
          </button>

          {/* Nested replies */}
          {renderComments(comment._id)}
        </div>
      ));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate("/tickets")}
        className="flex items-center gap-2 text-blue-600 hover:underline mb-4"
      >
        <ArrowLeft size={18} />
        Back to Tickets
      </button>

      <div className="bg-white shadow p-6 rounded-lg">
        <h2 className="text-3xl font-bold mb-2">{ticket.title}</h2>
        <p className="text-gray-700 mb-6">{ticket.description}</p>

        {/* Ticket Meta */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-gray-500">Created by</p>
            <p className="font-medium">{ticket.createdBy?.name || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-500">Assigned to</p>
            <p className="font-medium">{ticket.assignedTo?.name || "Unassigned"}</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className="font-medium">{ticket.status}</p>
          </div>
          <div>
            <p className="text-gray-500">Priority</p>
            <p className="font-medium">{ticket.priority}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500">Created On</p>
            <p className="font-medium">{new Date(ticket.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <hr className="my-6" />

        {/* Comments */}
        <h3 className="text-xl font-semibold mb-3">💬 Comments</h3>
        <div>{renderComments()}</div>

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="mt-4">
          {replyTo && (
            <p className="text-xs text-gray-500 mb-1">
              Replying to comment {replyTo}{" "}
              <button
                type="button"
                className="text-red-500 hover:underline ml-2"
                onClick={() => setReplyTo(null)}
              >
                Cancel
              </button>
            </p>
          )}
          <textarea
            className="w-full border rounded p-2 mb-2"
            rows="3"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Post Comment
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketDetails;
