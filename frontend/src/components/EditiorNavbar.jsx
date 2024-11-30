import React from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { FaHome } from "react-icons/fa";

const EditiorNavbar = ({ clients, projectName }) => {
  const navigate = useNavigate();

  // Redirect to the home page
  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <div className="EditiorNavbar flex items-center justify-between bg-[#1A1A1A] text-white px-4 py-2">
      {/* Logo and Project Name */}
      <div className="flex items-center gap-4">
        <div
          className="cursor-pointer flex items-center gap-2"
          onClick={handleLogoClick}
        >
          <FaHome size={20} className="text-yellow-400" />
          <p>File / <span className="text-gray-400">{projectName}</span></p>
        </div>
      </div>

      {/* Connected Users */}
      {/* <div className="flex items-center gap-4">
        <p className="text-gray-400">Connected Users:</p>
        <div className="flex gap-2">
          {clients.map((client) => (
            <span
              key={client.socketId}
              className="text-green-400 text-sm bg-[#2D2D2D] px-2 py-1 rounded"
            >
              {client.userId || "Anonymous"}
            </span>
          ))}
        </div>
      </div> */}
    </div>
  );
};

EditiorNavbar.propTypes = {
  clients: PropTypes.array.isRequired,
  projectName: PropTypes.string.isRequired,
};

export default EditiorNavbar;
