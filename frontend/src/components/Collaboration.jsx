import React, {useState} from "react";
import {api_base_url} from "../helper";
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";

const Collaboration = ({isCollabModelShow, setIsCollabModelShow}) => {
    const [projCode, setProjCode] = useState("");
    const navigate = useNavigate();

    const collabProj = () => {
        if (projCode === "") {
            toast.error("Please Enter Project Code");
        } else {
            fetch(api_base_url + "/addCollaborator", {
                mode: "cors",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    projectId: projCode, // Pass project code as project ID
                    collaboratorId: localStorage.getItem("userId"), // Current user's ID
                }),
            })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setIsCollabModelShow(false);
                    setProjCode("");
                    toast.success("Collaboration Successful! You have joined the project.");
                    navigate(`/editior/${projCode}`); // Navigate to the project editor
                } else {
                    toast.error(data.message || "Something went wrong.");
                }
            })
            .catch((error) => {
                toast.error("Failed to connect to project. Please try again.");
            });
        }
    };
    // console.log(projCode)

    return (
        <>
            {isCollabModelShow && (
                <div className="createModelCon fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
                    <div className="createModel w-[450px] shadow-xl border border-gray-700 bg-[#141414] rounded-lg p-[30px]">
                        <h3 className="text-2xl mb-4 font-semibold">Join a Project</h3>
                        <p className="text-sm text-gray-400 mb-3">Enter the project code to collaborate:</p>
                        <div className="inputBox !bg-[#1A1919] border border-gray-600 mt-4">
                            <input
                                type="text"
                                placeholder="Paste Project ID here"
                                value={projCode}
                                onChange={(e) => setProjCode(e.target.value)}
                                className="text-white p-2 w-full bg-transparent"
                            />
                        </div>
                        <div className="flex items-center gap-[10px] w-full mt-6">
                            <button
                                onClick={collabProj}
                                className="btnBlue rounded-lg w-[49%] !p-[10px] hover:!bg-[#0086b3]"
                            >
                                Connect
                            </button>
                            <button
                                onClick={() => setIsCollabModelShow(false)}
                                className="btnBlue !bg-[#1A1919] rounded-lg w-[49%] !p-[10px] hover:!bg-[#2A2929]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Collaboration;
