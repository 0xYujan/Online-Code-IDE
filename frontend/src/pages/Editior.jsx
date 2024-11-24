import React, { useEffect, useState, useRef } from "react";
import EditiorNavbar from "../components/EditiorNavbar";
import { MdLightMode } from "react-icons/md";
import { AiOutlineExpandAlt } from "react-icons/ai";
import { api_base_url } from "../helper";
import { useParams, useNavigate } from "react-router-dom";
import { initSocket } from "../socket";
import ACTIONS from "../Actions";
import toast from "react-hot-toast";
import Editor from "@monaco-editor/react";

const Editior = () => {
  const [tab, setTab] = useState("html");
  const [isLightMode, setIsLightMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [htmlCode, setHtmlCode] = useState("<h1>Hello world</h1>");
  const [cssCode, setCssCode] = useState("body { background-color: #f4f4f4; }");
  const [jsCode, setJsCode] = useState("// some comment");

  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const currentRevision = useRef(0);
  const { projectID } = useParams();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      socketRef.current.on("connect_error", handleErrors);
      socketRef.current.on("connect_failed", handleErrors);

      socketRef.current.emit(ACTIONS.JOIN, {
        projectID,
        userId: localStorage.getItem("userId"),
      });

      socketRef.current.on(ACTIONS.JOINED, ({ clients, userId }) => {
        if (userId !== localStorage.getItem("userId")) {
          toast.success(`${userId} joined the room`);
        }
        setClients(clients);
      });

      socketRef.current.on("code-update", ({ tab, operation }) => {
        if (tab === "html") setHtmlCode(operation.content);
        else if (tab === "css") setCssCode(operation.content);
        else if (tab === "js") setJsCode(operation.content);

        // Handle editor cursor sync (if supported)
        const editor = editorRef.current;
        if (editor && operation.anchor !== undefined) {
          const selection = editor.getModel().getFullModelRange(); // Update cursor/selection
          editor.setSelection(selection);
        }
      });

      socketRef.current.on("disconnect", () => {
        console.log("Disconnected from server");
      });
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [projectID, navigate]);

  const handleErrors = (e) => {
    console.error("Socket error", e);
    toast.error("Socket connection failed, try again later");
    navigate("/");
  };

  const handleCodeChange = (value) => {
    if (socketRef.current) {
      const editor = editorRef.current;
      const selection = editor?.getSelection();
      const operation = {
        content: value || "",
        anchor: selection?.startLineNumber || 0,
        focus: selection?.endLineNumber || 0,
      };

      socketRef.current.emit("code-change", {
        projectID,
        tab,
        operation,
        revision: currentRevision.current,
      });
    }

    if (tab === "html") setHtmlCode(value);
    else if (tab === "css") setCssCode(value);
    else if (tab === "js") setJsCode(value);
  };

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

  const run = () => {
    const html = htmlCode;
    const css = `<style>${cssCode}</style>`;
    const js = `<script>${jsCode}</script>`;
    const iframe = document.getElementById("iframe");

    if (iframe) {
      iframe.srcdoc = html + css + js;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      run();
    }, 200);
    return () => clearTimeout(timer);
  }, [htmlCode, cssCode, jsCode]);

  useEffect(() => {
    fetch(`${api_base_url}/getProject`, {
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        fetch(`${api_base_url}/updateProject`, {
          mode: "cors",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: localStorage.getItem("userId"),
            projId: projectID,
            htmlCode,
            cssCode,
            jsCode,
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
                className={`tab cursor-pointer p-[6px] ${
                  tab === "html" ? "bg-[#1E1E1E]" : ""
                } px-[10px] text-[15px]`}
              >
                HTML
              </div>
              <div
                onClick={() => setTab("css")}
                className={`tab cursor-pointer p-[6px] ${
                  tab === "css" ? "bg-[#1E1E1E]" : ""
                } px-[10px] text-[15px]`}
              >
                CSS
              </div>
              <div
                onClick={() => setTab("js")}
                className={`tab cursor-pointer p-[6px] ${
                  tab === "js" ? "bg-[#1E1E1E]" : ""
                } px-[10px] text-[15px]`}
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
            onMount={(editor) => (editorRef.current = editor)}
          />
        </div>

        {!isExpanded && (
          <iframe
            id="iframe"
            className="right w-[50%]"
            title="Output"
            sandbox="allow-scripts"
          />
        )}
      </div>
    </>
  );
};

export default Editior;
