import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [user, setUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!newPassword.trim()) {
      setMessage("⚠️ Please enter a new password.");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/auth/update-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update password");

      setMessage("✅ Password updated successfully!");
      setNewPassword("");
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) {
    return (
      <div className="p-6 text-center text-gray-500">Loading user info...</div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Settings ⚙️</h2>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-3">Profile Information</h3>
        <p><span className="font-medium">Name:</span> {user.name}</p>
        <p><span className="font-medium">Email:</span> {user.email}</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-3">Update Password</h3>
        <form onSubmit={handlePasswordUpdate} className="space-y-3">
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full border rounded p-2"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Update Password
          </button>
        </form>
        {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
      </div>

      <div className="text-center">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Settings;
