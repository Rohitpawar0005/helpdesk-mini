import React from "react"; // <--- Remove useState as it's no longer here
import { Link } from "react-router-dom";
import { Ticket, PlusCircle, Settings, X } from "lucide-react"; // <--- Remove Menu icon, add X for closing

const Sidebar = ({ isOpen, setIsOpen }) => { // <--- Receive isOpen and setIsOpen as props
  // const [isOpen, setIsOpen] = useState(false); // <--- REMOVE THIS LINE

  return (
    <>
      {/* Mobile Menu Button - REMOVED from here */}
      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 w-64 bg-white shadow-md flex flex-col transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 z-30`}
      >
        <div className="p-4 text-xl font-semibold border-b flex justify-between items-center">
          HelpDesk Mini
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-gray-600"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/tickets"
            className="flex items-center gap-2 p-2 rounded hover:bg-blue-100"
          >
            <Ticket size={18} /> All Tickets
          </Link>

          <Link
            to="/tickets/new"
            className="flex items-center gap-2 p-2 rounded hover:bg-blue-100"
          >
            <PlusCircle size={18} /> New Ticket
          </Link>

          <Link
            to="/settings"
            className="flex items-center gap-2 p-2 rounded hover:bg-blue-100"
          >
            <Settings size={18} /> Settings
          </Link>
        </nav>
      </div>

      {/* Overlay for mobile - REMOVED from here, moved to Layout.jsx */}
    </>
  );
};

export default Sidebar;