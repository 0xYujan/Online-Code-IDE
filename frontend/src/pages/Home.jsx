import React, {useEffect, useState} from "react";
import Navbar from "../components/Navbar";
import ListCard from "../components/ListCard";
import GridCard from "../components/GridCard";
import {api_base_url} from "../helper";
import {useNavigate} from "react-router-dom";
import Collaboration from "../components/Collaboration";
import toast from "react-hot-toast";

const Home = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [projTitle, setProjTitle] = useState("");
    const [isCreateModelShow, setIsCreateModelShow] = useState(false);
    const [isCollabModelShow, setIsCollabModelShow] = useState(false);
    const navigate = useNavigate();
    const filteredData = data
        ? data.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
        : [];

    const createProj = (e) => {
        if (projTitle === "") {
            alert("Please Enter Project Title");
        } else {
            fetch(api_base_url + "/createProject", {
                mode: "cors",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: projTitle,
                    userId: localStorage.getItem("userId"),
                }),
            })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setIsCreateModelShow(false);
                    setProjTitle("");
                    toast("Project Created Successfully");
                    navigate(`/editior/${data.projectId}`);
                } else {
                    alert("Something Went Wrong");
                }
            });
        }
    };

    const getProj = () => {
        fetch(api_base_url + "/getProjects", {
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
                setData(data.projects);
            } else {
                setError(data.message);
            }
        });
    };

    useEffect(() => {
        getProj();
    }, []);

    const [userData, setUserData] = useState(null);
    const [userError, setUserError] = useState("");

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
                setUserData(data.user);
            } else {
                setUserError(data.message);
            }
        });
    }, []);

    const [isGridLayout, setIsGridLayout] = useState(false);

    return (
        <>
            <Navbar isGridLayout={isGridLayout} setIsGridLayout={setIsGridLayout} />
            <div className="flex items-center justify-between px-[100px] my-[40px]">
                <h2 className="text-2xl">Hi, {userData ? userData.username : ""} 👋</h2>
                <div className="flex items-center gap-1">
                    {/* Search Bar */}
                    <div className="inputBox !w-[150px]">
                        <input
                            type="text"
                            placeholder="Search Here... !"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => {
                            setIsCollabModelShow(true);
                        }}
                        className="btnBlue rounded-[5px] mb-4 text-[20px] !p-[5px] !px-[10px]"
                    >
                        Collaboration
                    </button>
                    <button
                        onClick={() => {
                            setIsCreateModelShow(true);
                        }}
                        className="btnBlue rounded-[5px] mb-4 text-[20px] !p-[5px] !px-[10px]"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Project Display */}
            <div className="cards">
                {isGridLayout ? (
                    <div className="grid px-[100px]">
                        {filteredData.length > 0 ? (
                            filteredData.map((item, index) => <GridCard key={index} item={item} />)
                        ) : (
                            <p>No projects found</p>
                        )}
                    </div>
                ) : (
                    <div className="list px-[100px]">
                        {filteredData.length > 0 ? (
                            filteredData.map((item, index) => <ListCard key={index} item={item} />)
                        ) : (
                            <p>No projects found</p>
                        )}
                    </div>
                )}
            </div>

            {/* Modal for Creating a New Project */}
            {isCreateModelShow && (
                <div className="createModelCon fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
                    <div className="createModel w-[450px] shadow-xl border border-gray-700 bg-[#141414] rounded-lg p-[30px]">
                        <h3 className="text-2xl mb-4 font-semibold">Create New Project</h3>
                        <p className="text-sm text-gray-400 mb-3">Enter a name for your new project:</p>
                        <div className="inputBox !bg-[#1A1919] border border-gray-600 mt-4">
                            <input
                                onChange={(e) => {
                                    setProjTitle(e.target.value);
                                }}
                                value={projTitle}
                                type="text"
                                placeholder="Project Title"
                                className="bg-transparent"
                            />
                        </div>
                        <div className="flex items-center gap-[10px] w-full mt-6">
                            <button
                                onClick={createProj}
                                className="btnBlue rounded-lg w-[49%] !p-[10px] hover:!bg-[#0086b3]"
                            >
                                Create
                            </button>
                            <button
                                onClick={() => {
                                    setIsCreateModelShow(false);
                                }}
                                className="btnBlue !bg-[#1A1919] rounded-lg w-[49%] !p-[10px] hover:!bg-[#2A2929]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Collaboration Modal */}
            <Collaboration isCollabModelShow={isCollabModelShow} setIsCollabModelShow={setIsCollabModelShow} />
        </>
    );
};

export default Home;
