import React from "react";
import { Link } from "react-router-dom"; // <--- Import Link
import { Bell, Menu } from "lucide-react";

const Navbar = ({ toggleSidebar }) => {
  return (
    <header className="flex items-center justify-between bg-white px-6 py-3 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-1 text-gray-700"
        >
          <Menu size={24} />
        </button>
        {/* The h1 is now a clickable link to the dashboard */}
        <h1 className="text-lg font-medium text-gray-800">
            <Link to="/dashboard" className="hover:text-gray-900 transition-colors">
                Dashboard
            </Link>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
          RP
        </div>
      </div>
    </header>
  );
};

export default Navbar;