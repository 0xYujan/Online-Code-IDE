import React, {useState} from "react";
import deleteImg from "../images/delete.png";
import codeImg from "../images/code.png";
import {useNavigate} from "react-router-dom";
import {api_base_url} from "../helper";
import toast from "react-hot-toast";

const GridCard = ({item}) => {
    const [isDeleteModelShow, setIsDeleteModelShow] = useState(false);
    const navigate = useNavigate();
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
                toast.success("Project deleted successfully!");
                window.location.reload();
            } else {
                toast.error(data.message);
                setIsDeleteModelShow(false);
            }
        });
    };

    return (
        <>
            <div className="gridCard bg-[#141414] w-[270px] p-[10px] h-[180px] cursor-pointer hover:bg-[#202020] rounded-lg shadow-lg shadow-black/50 relative">
                <div
                    onClick={() => {
                        navigate(`/editior/${item._id}`);
                    }}
                >
                    <img className="w-[90px]" src={codeImg} alt="" />
                    <h3 className="text-[20px] w-[90%] line-clamp-1">{item.title}</h3>
                    {isCollaborator && !isOwner && (
                        <span className="text-xs bg-blue-600 px-2 py-1 rounded mt-1 inline-block">Shared</span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-[14px] text-[gray]">Created in {new Date(item.date).toDateString()}</p>
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
        </>
    );
};

export default GridCard;
