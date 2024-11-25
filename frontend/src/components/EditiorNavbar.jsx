import React from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const EditiorNavbar = ({ clients, projectName }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => navigate("/");

  return (
    <nav className="EditiorNavbar flex items-center justify-between px-5 py-2">
      <div className="logo cursor-pointer" onClick={handleLogoClick}>
        {projectName}
      </div>
      <div className="clients">
        {clients.map((client) => (
          <span key={client} className="client">
            {client}
          </span>
        ))}
      </div>
    </nav>
  );
};

EditiorNavbar.propTypes = {
  clients: PropTypes.array.isRequired,
  projectName: PropTypes.string.isRequired,
};

export default EditiorNavbar;
