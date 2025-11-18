import React, {useState} from "react";
import img from "../images/code.png";
import deleteImg from "../images/delete.png";
import collabImg from "../images/collab.png";
import {api_base_url} from "../helper";
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";

const ListCard = ({item}) => {
    const navigate = useNavigate();
    const [isDeleteModelShow, setIsDeleteModelShow] = useState(false);
    const [isCollabModelShow, setIsCollabModelShow] = useState(false);
    const currentUserId = localStorage.getItem("userId");
    const isOwner = item.createdBy === currentUserId;
    const isCollaborator = item.collaborators?.includes(currentUserId);

    const deleteProj = (id) => {
        fetch(api_base_url + "/deleteProject", {
            mode: "cors",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                progId: id,
                userId: localStorage.getItem("userId"),
            }),
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                setIsDeleteModelShow(false);
                window.location.reload();
            } else {
                alert(data.message);
                setIsDeleteModelShow(false);
            }
        });
    };
    return (
        <>
            <div className="listCard mb-2 w-[full] flex items-center justify-between p-[10px] bg-[#141414] cursor-pointer rounded-lg hover:bg-[#202020]">
                <div
                    onClick={() => {
                        navigate(`/editior/${item._id}`);
                    }}
                    className="flex items-center gap-2 flex-1"
                >
                    <img className="w-[80px]" src={img} alt="" />
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-[20px]">{item.title}</h3>
                            {isCollaborator && !isOwner && (
                                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Shared</span>
                            )}
                        </div>
                        <p className="text-[gray] text-[14px]">Created in {new Date(item.date).toDateString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isOwner && (
                        <img
                            onClick={() => {
                                setIsCollabModelShow(true);
                            }}
                            className="w-[30px] cursor-pointer"
                            src={collabImg}
                            alt=""
                        />
                    )}
                    {isOwner && (
                        <img
                            onClick={() => {
                                setIsDeleteModelShow(true);
                            }}
                            className="w-[30px] cursor-pointer"
                            src={deleteImg}
                            alt=""
                        />
                    )}
                </div>
            </div>

            {isDeleteModelShow ? (
                <div className="model fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.5)] flex justify-center items-center flex-col z-50">
                    <div className="mainModel w-[450px] bg-[#141414] rounded-lg p-[30px] shadow-xl border border-gray-700">
                        <h3 className="text-2xl mb-3 font-semibold">Delete Project</h3>
                        <p className="text-sm text-gray-400 mb-6">
                            Are you sure you want to delete{" "}
                            <span className="text-white font-medium">"{item.title}"</span>? This action cannot be
                            undone.
                        </p>
                        <div className="flex w-full items-center gap-[10px]">
                            <button
                                onClick={() => {
                                    deleteProj(item._id);
                                }}
                                className="w-[49%] p-[10px] rounded-lg bg-[#FF4343] hover:bg-[#E03A3A] text-white cursor-pointer transition-colors font-medium"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => {
                                    setIsDeleteModelShow(false);
                                }}
                                className="w-[49%] p-[10px] rounded-lg bg-[#1A1919] hover:bg-[#2A2929] text-white cursor-pointer transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                ""
            )}
            {isCollabModelShow ? (
                <div className="model fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.5)] flex justify-center items-center flex-col z-50">
                    <div className="mainModel w-[450px] bg-[#141414] rounded-lg p-[30px] shadow-xl border border-gray-700">
                        <h3 className="text-2xl mb-4 font-semibold">Share this code with your friends</h3>
                        <p className="text-sm text-gray-400 mb-3">Share this project ID to collaborate:</p>
                        <div className="bg-[#1A1919] p-4 rounded-lg border border-gray-600 mb-4">
                            <p className="text-blue-400 font-mono text-sm break-all select-all">{item._id}</p>
                        </div>
                        <div className="flex w-full items-center gap-[10px]">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(item._id);
                                    toast.success("Project ID copied to clipboard!");
                                }}
                                className="btnBlue w-[49%] !bg-[#00AEEF] hover:!bg-[#0086b3]"
                            >
                                Copy
                            </button>
                            <button
                                onClick={() => {
                                    setIsCollabModelShow(false);
                                }}
                                className="btnBlue w-[49%] !bg-[#1A1919] hover:!bg-[#2A2929]"
                            >
                                Okay
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                ""
            )}
        </>
    );
};

export default ListCard;
