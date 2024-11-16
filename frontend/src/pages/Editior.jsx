import React, { useEffect, useState, useRef } from "react";
import EditiorNavbar from "../components/EditiorNavbar";
import { MdLightMode } from "react-icons/md";
import { AiOutlineExpandAlt } from "react-icons/ai";
import { api_base_url } from "../helper";
import { useParams, useNavigate } from "react-router-dom";
import { initSocket } from "../socket";
import ACTIONS from "../Actions";
import toast from "react-hot-toast";
import Editor from "@monaco-editor/react";  // Monaco Editor for rich code editing

const Editior = () => {
  const [tab, setTab] = useState("html"); // Default to HTML tab
  const [isLightMode, setIsLightMode] = useState(false); // Light/Dark mode toggle
  const [isExpanded, setIsExpanded] = useState(false); // Expand/Collapse iframe
  const [htmlCode, setHtmlCode] = useState("<h1>Hello world</h1>");
  const [cssCode, setCssCode] = useState("body { background-color: #f4f4f4; }");
  const [jsCode, setJsCode] = useState("// some comment");

  const editorRef = useRef(null); // Reference for Monaco editor
  const socketRef = useRef(null); // Reference for socket connection
  const currentRevision = useRef(0); // Track revision for operational transformation (OT)
  const { projectID } = useParams();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);

  // Initialize socket and editor when the component mounts
  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      // Error handling for socket connection
      socketRef.current.on("connect_error", handleErrors);
      socketRef.current.on("connect_failed", handleErrors);

      // Join the project room
      socketRef.current.emit(ACTIONS.JOIN, {
        projectID,
        userId: localStorage.getItem("userId"),
      });

      // Update clients list on joining
      socketRef.current.on(ACTIONS.JOINED, ({ clients, userId }) => {
        if (userId !== localStorage.getItem("userId")) {
          toast.success(`${userId} joined the room`);
        }
        setClients(clients); 
      });

      // Listen for code updates from other clients
      socketRef.current.on(ACTIONS.CODE_UPDATE, ({ tab, operation }) => {
        if (tab === "html") setHtmlCode(operation.content);
        else if (tab === "css") setCssCode(operation.content);
        else if (tab === "js") setJsCode(operation.content);
      });

      // Log disconnection
      socketRef.current.on("disconnect", () => {
        console.log("Disconnected from server");
      });
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect(); // Clean up on unmount
      }
    };
  }, [projectID, navigate]);

  // Handle socket errors
  const handleErrors = (e) => {
    console.log("Socket error", e);
    toast.error("Socket connection failed, try again later");
    navigate("/");
  };

  // Emit code changes to the server whenever content changes in the editor
  const handleCodeChange = (value) => {
    if (socketRef.current) {
      const selection = editorRef.current?.getSelection();
      const operation = {
        content: value || "",
        anchor: selection?.anchor || 0, // Default to 0 if anchor is undefined
        focus: selection?.focus || 0,   // Default to 0 if focus is undefined
      };

      // Emit the code change to the server
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        projectID,
        tab,
        operation,
        revision: currentRevision.current, // Increment revision for each change
      });
    }

    // Update local state for the respective code tab
    if (tab === "html") setHtmlCode(value);
    else if (tab === "css") setCssCode(value);
    else if (tab === "js") setJsCode(value);
  };

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

  // Run the code in an iframe
  const run = () => {
    const html = htmlCode;
    const css = `<style>${cssCode}</style>`;
    const js = `<script>${jsCode}</script>`;
    const iframe = document.getElementById("iframe");

    if (iframe) {
      iframe.srcdoc = html + css + js;
    }
  };

  // Trigger the `run` function whenever code changes
  useEffect(() => {
    const timer = setTimeout(() => {
      run();
    }, 200);
    return () => clearTimeout(timer);
  }, [htmlCode, cssCode, jsCode]);

  // Fetch project data initially when projectID changes
  useEffect(() => {
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
  }, [projectID]);

  // Save the project when Ctrl + S is pressed
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
              <div
                onClick={() => setTab("html")}
                className="tab cursor-pointer p-[6px] bg-[#1E1E1E] px-[10px] text-[15px]"
              >
                HTML
              </div>
              <div
                onClick={() => setTab("css")}
                className="tab cursor-pointer p-[6px] bg-[#1E1E1E] px-[10px] text-[15px]"
              >
                CSS
              </div>
              <div
                onClick={() => setTab("js")}
                className="tab cursor-pointer p-[6px] bg-[#1E1E1E] px-[10px] text-[15px]"
              >
                JavaScript
              </div>
            </div>

            <div className="flex items-center gap-2">
              <i className="text-[20px] cursor-pointer" onClick={changeTheme}>
                <MdLightMode />
              </i>
              <i
                className="text-[20px] cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <AiOutlineExpandAlt />
              </i>
            </div>
          </div>

          <Editor
            onChange={(value) => handleCodeChange(value || "")}
            height="82vh"
            theme={isLightMode ? "vs-light" : "vs-dark"}
            language={tab}
            value={tab === "html" ? htmlCode : tab === "css" ? cssCode : jsCode}
            editorDidMount={(editor) => (editorRef.current = editor)} // Set editorRef to access selection
          />
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
