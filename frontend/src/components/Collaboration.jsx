import React, { useState } from 'react';
import { api_base_url } from '../helper';
import { useNavigate } from 'react-router-dom';

const Collaboration = ({ isCollabModelShow, setIsCollabModelShow }) => {
  const [projCode, setProjCode] = useState("");
  const navigate = useNavigate();

  const collabProj = () => {
    if (projCode === "") {
      alert("Please Enter Project Code");
    } else {
      fetch(api_base_url + "/addCollaborator", {
        mode: "cors",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: projCode,  // Pass project code as project ID
          collaboratorId: localStorage.getItem("userId")  // Current user's ID
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsCollabModelShow(false);
          setProjCode("");
          alert("Collaboration Successful! You have joined the project.");
          navigate(`/editior/${projCode}`);  // Navigate to the project editor
        } else {
          alert(data.message || "Something went wrong.");
        }
      })
      .catch(error => {
        // console.error("Error:", error);
        alert("Failed to connect to project. Please try again.");
      });
    }
  };
  // console.log(projCode)

  return (
    <>
      {isCollabModelShow &&
        <div className="createModelCon fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-[rgb(0,0,0,0.1)] flex items-center justify-center">
          <div className="createModel w-[25vw] h-[27vh] shadow-lg shadow-black/50 bg-[#141414] rounded-[10px] p-[20px]">
            <h3 className='text-2xl'>Enter Project Code</h3>
            <div className="inputBox !bg-[#202020] mt-4">
              <input
                type="text"
                placeholder='Project Code'
                value={projCode}
                onChange={(e) => setProjCode(e.target.value)}
                className="text-white p-2 w-full"
              />
            </div>
            <div className='flex items-center gap-[10px] w-full mt-2'>
              <button
                onClick={collabProj}
                className='btnBlue rounded-[5px] w-[49%] mb-4 !p-[5px] !px-[10px] !py-[10px]'
              >
                Connect
              </button>
              <button
                onClick={() => setIsCollabModelShow(false)}
                className='btnBlue !bg-[#1A1919] rounded-[5px] mb-4 w-[49%] !p-[5px] !px-[10px] !py-[10px]'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      }
    </>
  );
};

export default Collaboration;
