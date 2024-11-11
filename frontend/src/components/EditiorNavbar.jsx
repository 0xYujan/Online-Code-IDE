import React, { useEffect, useState } from "react";
import logo from "../images/logo.png";
import { FiDownload } from "react-icons/fi";
import { api_base_url } from "../helper";

const EditiorNavbar = ({ clients = [] }) => {  // Destructure clients from props
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(api_base_url + "/getUserDetails", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: localStorage.getItem("userId"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setData(data.user);
        } else {
          setError(data.message);
        }
      })
      .catch((err) => setError("Failed to fetch user data"));
  }, []);

  return (
    <div className="EditiorNavbar flex items-center justify-between px-[100px] h-[80px] bg-[#141414]">
      <div className="logo">
        <img className="w-[150px] cursor-pointer" src={logo} alt="" />
      </div>
      <p>File / <span className="text-[gray]">My first project</span></p>
      <div className="flex items-center gap-4">
        {Array.isArray(clients) && clients.length > 0 ? (
          <div className="connected-users">
            {clients.map((client, index) => (
              <span key={index}>{client.name || client.userId}</span>
            ))}
          </div>
        ) : (
          <p>No connected users</p>
        )}
      </div>
      <i className="p-[8px] btn bg-black rounded-[5px] cursor-pointer text-[20px]"><FiDownload /></i>
    </div>
  );
};

export default EditiorNavbar;
