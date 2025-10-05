import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const NewTicket = () => {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Low",
    slaDeadline: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Ticket created successfully!");
        setFormData({ title: "", description: "", priority: "Low", slaDeadline: "" });
        navigate("/tickets");
      } else {
        setMessage(`❌ ${data.message || "Failed to create ticket"}`);
      }
    } catch (error) {
      setMessage("⚠️ Network error, please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Create New Ticket</h2>

      {message && (
        <p
          className={`mb-4 ${
            message.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Ticket Title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
          rows={4}
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="flex-1 p-2 border rounded"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <input
            type="datetime-local"
            name="slaDeadline"
            value={formData.slaDeadline}
            onChange={handleChange}
            className="flex-1 p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Create Ticket
        </button>
      </form>
    </div>
  );
};

export default NewTicket;
