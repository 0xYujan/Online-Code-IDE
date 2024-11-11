import React, { useEffect, useState, useRef } from "react";
import EditiorNavbar from "../components/EditiorNavbar";
import Editor from "@monaco-editor/react";
import { MdLightMode } from "react-icons/md";
import { AiOutlineExpandAlt } from "react-icons/ai";
import { api_base_url } from "../helper";
import { useParams, useNavigate } from "react-router-dom";
import { initSocket } from "../socket";
import ACTIONS from "../Actions";
import toast from "react-hot-toast";

const Editior = () => {
  const [tab, setTab] = useState("html");
  const [isLightMode, setIsLightMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [htmlCode, setHtmlCode] = useState("<h1>Hello world</h1>");
  const [cssCode, setCssCode] = useState("body { background-color: #f4f4f4; }");
  const [jsCode, setJsCode] = useState("// some comment");

  const editiorRef = useRef(null);
  const socketRef = useRef(null);
  const { projectID } = useParams();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      socketRef.current.emit(ACTIONS.JOIN, { projectID, userId: localStorage.getItem("userId") });

      socketRef.current.on(ACTIONS.JOINED, ({ clients, userId, socketId }) => {
        if (userId !== localStorage.getItem("userId")) {
          toast.success(`${userId} joined the room`);
        }
        setClients(clients);  // Update the clients list
      });

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later");
        navigate("/");
      }

      socketRef.current.on("disconnect", () => {
        console.log("Disconnected");
      });
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [projectID, navigate]);

  // Change theme between light and dark mode
  const changeTheme = () => {
    const editorNavbar = document.querySelector(".EditiorNavbar");
    if (isLightMode) {
      editorNavbar.style.background = "#141414";
      document.body.classList.remove("lightMode");
      setIsLightMode(false);
    } else {
      editorNavbar.style.background = "#f4f4f4";
      document.body.classList.add("lightMode");
      setIsLightMode(true);
    }
  };

  // Function to run the code in the iframe
  const run = () => {
    const html = htmlCode;
    const css = `<style>${cssCode}</style>`;
    const js = `<script>${jsCode}</script>`;
    const iframe = document.getElementById("iframe");

    if (iframe) {
      iframe.srcdoc = html + css + js;
    }
  };

  // Effect to run the code whenever the code changes
  useEffect(() => {
    setTimeout(() => {
      run();
    }, 200);
  }, [htmlCode, cssCode, jsCode]);

  // Fetch project data when projectID changes
  useEffect(() => {
    // async function init() {
      fetch(api_base_url + "/getProject", {
        mode: "cors",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: localStorage.getItem("userId"),
          projId: projectID,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setHtmlCode(data.project.htmlCode);
          setCssCode(data.project.cssCode);
          setJsCode(data.project.jsCode);
        });

      // Monaco editor event listener for changes
      // if (editiorRef.current) {
      //   editiorRef.current.on("change", (instance, changes) => {
      //     console.log("Editor changes:", changes);
      //   });
      // }
    // }
    // init();
  }, [projectID]);

  // Handle saving the project when Ctrl + S is pressed
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();

        fetch(api_base_url + "/updateProject", {
          mode: "cors",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: localStorage.getItem("userId"),
            projId: projectID,
            htmlCode: htmlCode,
            cssCode: cssCode,
            jsCode: jsCode,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              alert("Project saved successfully");
            } else {
              alert("Something went wrong");
            }
          })
          .catch((err) => {
            console.error("Error saving project:", err);
            alert("Failed to save project. Please try again.");
          });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [projectID, htmlCode, cssCode, jsCode]);

  
  return (
    <>
      <EditiorNavbar clients={clients} />
      <div className="flex">
        <div className={`left w-[${isExpanded ? "100%" : "50%"}]`}>
          <div className="tabs flex items-center justify-between gap-2 w-full bg-[#1A1919] h-[50px] px-[40px]">
            <div className="tabs flex items-center gap-2">
              <div onClick={() => setTab("html")} className="tab cursor-pointer p-[6px] bg-[#1E1E1E] px-[10px] text-[15px]">
                HTML
              </div>
              <div onClick={() => setTab("css")} className="tab cursor-pointer p-[6px] bg-[#1E1E1E] px-[10px] text-[15px]">
                CSS
              </div>
              <div onClick={() => setTab("js")} className="tab cursor-pointer p-[6px] bg-[#1E1E1E] px-[10px] text-[15px]">
                JavaScript
              </div>
            </div>

            <div className="flex items-center gap-2">
              <i className="text-[20px] cursor-pointer" onClick={changeTheme}>
                <MdLightMode />
              </i>
              <i className="text-[20px] cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <AiOutlineExpandAlt />
              </i>
            </div>
          </div>

          {tab === "html" ? (
            <Editor
              onChange={(value) => {
                setHtmlCode(value || "");
                run();
              }}
              height="82vh"
              theme={isLightMode ? "vs-light" : "vs-dark"}
              language="html"
              value={htmlCode}
            />
          ) : tab === "css" ? (
            <Editor
              onChange={(value) => {
                setCssCode(value || "");
                run();
              }}
              height="82vh"
              theme={isLightMode ? "vs-light" : "vs-dark"}
              language="css"
              value={cssCode}
            />
          ) : (
            <Editor
              onChange={(value) => {
                setJsCode(value || "");
                run();
              }}
              height="82vh"
              theme={isLightMode ? "vs-light" : "vs-dark"}
              language="javascript"
              value={jsCode}
            />
          )}
        </div>

        {!isExpanded && (
          <iframe
            id="iframe"
            className="w-[50%] min-h-[82vh] bg-[#fff] text-black"
            title="output"
          />
        )}
      </div>
    </>
  );
};

export default Editior;
