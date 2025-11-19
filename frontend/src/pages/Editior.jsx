import React, {useEffect, useState, useRef} from "react";
import EditiorNavbar from "../components/EditiorNavbar";
import VersionHistory from "../components/VersionHistory";
import CodeAnalysis from "../components/CodeAnalysis";
import EnhancedEditor from "../components/EnhancedEditor";
import {MdLightMode} from "react-icons/md";
import {AiOutlineExpandAlt} from "react-icons/ai";
import {FaHistory, FaCode, FaCog, FaKeyboard, FaTerminal, FaExpand, FaCompress} from "react-icons/fa";
import {api_base_url} from "../helper";
import {useParams, useNavigate} from "react-router-dom";
import {initSocket} from "../socket";
import ACTIONS from "../Actions";
import toast from "react-hot-toast";

const Editior = () => {
    const [tab, setTab] = useState("html");
    const [isLightMode, setIsLightMode] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    const [showCodeAnalysis, setShowCodeAnalysis] = useState(false);
    const [htmlCode, setHtmlCode] = useState("<h1>Hello world</h1>");
    const [cssCode, setCssCode] = useState("body { background-color: #f4f4f4; }");
    const [jsCode, setJsCode] = useState("// some comment");
    const [projectName, setProjectName] = useState("");
    const [consoleLogs, setConsoleLogs] = useState([]);
    const [showConsole, setShowConsole] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [isEditorFullScreen, setIsEditorFullScreen] = useState(false);

    const editorRef = useRef(null);
    const socketRef = useRef(null);
    const currentRevision = useRef(0);
    const hasJoined = useRef(false); // Track if we've already joined to prevent double joins
    const isTyping = useRef(false); // Track if user is currently typing locally
    const {projectID} = useParams();
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [username, setUsername] = useState(localStorage.getItem("username") || "");

    // Fetch project details to get the project name
    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const response = await fetch(api_base_url + "/getProject", {
                    mode: "cors",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId: localStorage.getItem("userId"),
                        projId: projectID,
                    }),
                });

                const data = await response.json();
                if (data.success && data.project) {
                    setProjectName(data.project.title);
                } else {
                    setProjectName("Untitled Project");
                }
            } catch (error) {
                console.error("Error fetching project details:", error);
                setProjectName("Untitled Project");
            }
        };

        fetchProjectDetails();
    }, [projectID]);

    // Fetch and store username if not already in localStorage
    useEffect(() => {
        const fetchUsername = async () => {
            // If username is already in localStorage, use it
            if (localStorage.getItem("username")) {
                setUsername(localStorage.getItem("username"));
                return;
            }

            // Fetch user details to get the username
            try {
                const response = await fetch(api_base_url + "/getUserDetails", {
                    mode: "cors",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId: localStorage.getItem("userId"),
                    }),
                });

                const data = await response.json();
                if (data.success && data.user && data.user.username) {
                    // Store username in localStorage and state
                    localStorage.setItem("username", data.user.username);
                    setUsername(data.user.username);
                    console.log("✅ Username fetched and stored:", data.user.username);
                }
            } catch (error) {
                console.error("Error fetching username:", error);
            }
        };

        fetchUsername();
    }, []);

    // Listen for console messages from iframe
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data && event.data.type === "console") {
                setConsoleLogs((prev) => [
                    ...prev,
                    {
                        type: event.data.level,
                        message: event.data.message,
                        timestamp: new Date().toLocaleTimeString(),
                    },
                ]);
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    useEffect(() => {
        // Don't initialize socket until we have a username
        if (!username) {
            return;
        }

        const init = async () => {
            socketRef.current = await initSocket();

            socketRef.current.on("connect_error", handleErrors);
            socketRef.current.on("connect_failed", handleErrors);

            // Only emit join if we haven't already joined this project
            if (!hasJoined.current) {
                hasJoined.current = true;
                socketRef.current.emit(ACTIONS.JOIN, {
                    projectID,
                    userId: localStorage.getItem("userId"),
                    username: username, // Use the username from state
                });
            }

            socketRef.current.on(ACTIONS.JOINED, ({clients, userId, username}) => {
                if (userId !== localStorage.getItem("userId")) {
                    toast.success(`${username || userId} joined the room`);
                    console.log(`👤 ${username} joined the room`);
                }
                setClients(clients);
            });

            // Listen for code sync when joining
            socketRef.current.on("sync-code", ({htmlCode, cssCode, jsCode}) => {
                console.log("📥 Syncing code state from server");
                setHtmlCode(htmlCode);
                setCssCode(cssCode);
                setJsCode(jsCode);
            });

            socketRef.current.on("code-update", ({tab: updatedTab, operation}) => {
                console.log(`📝 Received code update for ${updatedTab}:`, operation.content?.substring(0, 50));

                // Don't update if user is currently typing in the same tab
                if (isTyping.current && updatedTab === tab) {
                    console.log("⏭️ Skipping update - user is typing");
                    return;
                }

                // Only update the code if it's for a different tab or user is not typing
                if (updatedTab === "html") setHtmlCode(operation.content);
                else if (updatedTab === "css") setCssCode(operation.content);
                else if (updatedTab === "js") setJsCode(operation.content);
            });

            socketRef.current.on("user-left", ({userId, username, clients}) => {
                toast.error(`${username || userId} left the room`);
                console.log(`👋 ${username} left the room`);
                setClients(clients);
            });

            socketRef.current.on("disconnect", () => {
                console.log("Disconnected from server");
            });
        };

        init();

        return () => {
            hasJoined.current = false; // Reset join flag when component unmounts
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [projectID, navigate, username]); // Added username to dependencies

    const handleErrors = (e) => {
        console.error("Socket error", e);
        toast.error("Socket connection failed, try again later");
        navigate("/");
    };

    const handleCodeChange = (value) => {
        // Mark that user is typing
        isTyping.current = true;

        // Update local state first for immediate feedback
        if (tab === "html") setHtmlCode(value);
        else if (tab === "css") setCssCode(value);
        else if (tab === "js") setJsCode(value);

        // Then emit to other clients
        if (socketRef.current) {
            const operation = {
                content: value || "",
            };

            console.log(`📤 Sending code change for ${tab} to project ${projectID}`);
            socketRef.current.emit("code-change", {
                projectID,
                tab,
                operation,
                revision: currentRevision.current,
            });
        }

        // Reset typing flag after a short delay
        setTimeout(() => {
            isTyping.current = false;
        }, 300);
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

        // Inject console interceptor before user code
        const consoleInterceptor = `
            <script>
                (function() {
                    const originalLog = console.log;
                    const originalError = console.error;
                    const originalWarn = console.warn;
                    const originalInfo = console.info;
                    
                    window.addEventListener('error', function(e) {
                        window.parent.postMessage({
                            type: 'console',
                            level: 'error',
                            message: e.message + ' (Line: ' + e.lineno + ')'
                        }, '*');
                    });
                    
                    console.log = function(...args) {
                        window.parent.postMessage({
                            type: 'console',
                            level: 'log',
                            message: args.map(a => {
                                if (typeof a === 'object') return JSON.stringify(a, null, 2);
                                return String(a);
                            }).join(' ')
                        }, '*');
                        originalLog.apply(console, args);
                    };
                    
                    console.error = function(...args) {
                        window.parent.postMessage({
                            type: 'console',
                            level: 'error',
                            message: args.map(a => String(a)).join(' ')
                        }, '*');
                        originalError.apply(console, args);
                    };
                    
                    console.warn = function(...args) {
                        window.parent.postMessage({
                            type: 'console',
                            level: 'warn',
                            message: args.map(a => String(a)).join(' ')
                        }, '*');
                        originalWarn.apply(console, args);
                    };
                    
                    console.info = function(...args) {
                        window.parent.postMessage({
                            type: 'console',
                            level: 'info',
                            message: args.map(a => String(a)).join(' ')
                        }, '*');
                        originalInfo.apply(console, args);
                    };
                })();
            </script>
        `;

        const js = `<script>${jsCode}</script>`;
        const iframe = document.getElementById("iframe");

        if (iframe) {
            iframe.srcdoc = html + css + consoleInterceptor + js;
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
                        changeType: "all",
                        description: `Manual save - Updated all code`,
                    }),
                })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        toast.success("Project saved successfully");
                    } else {
                        toast.error("Something went wrong");
                    }
                })
                .catch((err) => {
                    console.error("Error saving project:", err);
                    toast.error("Failed to save project. Please try again.");
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
            <EditiorNavbar clients={clients} projectName={projectName || "Loading..."} projectID={projectID} />
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
                            <FaTerminal
                                className="text-[20px] cursor-pointer hover:text-cyan-400 transition"
                                onClick={() => setShowConsole(!showConsole)}
                                title="Toggle Console"
                                style={{color: showConsole ? "#22d3ee" : "inherit"}}
                            />
                            <FaCog
                                className="text-[20px] cursor-pointer hover:text-gray-400 transition"
                                onClick={() => setShowSettings(true)}
                                title="Settings"
                            />
                            <FaKeyboard
                                className="text-[20px] cursor-pointer hover:text-pink-400 transition"
                                onClick={() => setShowShortcuts(true)}
                                title="Keyboard Shortcuts"
                            />
                            {isEditorFullScreen ? (
                                <FaCompress
                                    className="text-[20px] cursor-pointer hover:text-orange-400 transition"
                                    onClick={() => setIsEditorFullScreen(false)}
                                    title="Exit Full Screen"
                                />
                            ) : (
                                <FaExpand
                                    className="text-[20px] cursor-pointer hover:text-orange-400 transition"
                                    onClick={() => setIsEditorFullScreen(true)}
                                    title="Full Screen Editor"
                                />
                            )}
                            <FaHistory
                                className="text-[20px] cursor-pointer hover:text-blue-400 transition"
                                onClick={() => setShowVersionHistory(true)}
                                title="Version History"
                            />
                            <FaCode
                                className="text-[20px] cursor-pointer hover:text-green-400 transition"
                                onClick={() => setShowCodeAnalysis(true)}
                                title="Code Analysis (Tokenizer)"
                            />
                            <MdLightMode
                                className="text-[20px] cursor-pointer hover:text-yellow-400 transition"
                                onClick={changeTheme}
                                title="Toggle Theme"
                            />
                            <AiOutlineExpandAlt
                                className="text-[20px] cursor-pointer hover:text-purple-400 transition"
                                onClick={() => setIsExpanded(!isExpanded)}
                                title="Toggle Preview"
                            />
                        </div>
                    </div>

                    <EnhancedEditor
                        value={tab === "html" ? htmlCode : tab === "css" ? cssCode : jsCode}
                        onChange={(value) => handleCodeChange(value || "")}
                        height="82vh"
                        theme={isLightMode ? "light" : "dark"}
                        language={tab === "js" ? "javascript" : tab}
                        consoleLogs={consoleLogs}
                        onClearConsole={() => setConsoleLogs([])}
                        showConsole={showConsole}
                        onToggleConsole={setShowConsole}
                        showSettings={showSettings}
                        onToggleSettings={setShowSettings}
                        showShortcuts={showShortcuts}
                        onToggleShortcuts={setShowShortcuts}
                        isFullScreen={isEditorFullScreen}
                    />
                </div>

                {!isExpanded && <iframe id="iframe" className="right w-[50%]" title="Output" sandbox="allow-scripts" />}
            </div>

            {showVersionHistory && (
                <VersionHistory projectID={projectID} onClose={() => setShowVersionHistory(false)} />
            )}

            {showCodeAnalysis && (
                <CodeAnalysis
                    code={tab === "html" ? htmlCode : tab === "css" ? cssCode : jsCode}
                    language={tab === "js" ? "javascript" : tab}
                    onClose={() => setShowCodeAnalysis(false)}
                />
            )}
        </>
    );
};

export default Editior;
