import React, {useEffect, useState, useRef} from "react";
import EditiorNavbar from "../components/EditiorNavbar";
import VersionHistory from "../components/VersionHistory";
import CodeAnalysis from "../components/CodeAnalysis";
import {MdLightMode} from "react-icons/md";
import {AiOutlineExpandAlt} from "react-icons/ai";
import {FaHistory, FaCode} from "react-icons/fa";
import {api_base_url} from "../helper";
import {useParams, useNavigate} from "react-router-dom";
import {initSocket} from "../socket";
import ACTIONS from "../Actions";
import toast from "react-hot-toast";
import Editor from "@monaco-editor/react";

const Editior = () => {
    const [tab, setTab] = useState("html");
    const [isLightMode, setIsLightMode] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    const [showCodeAnalysis, setShowCodeAnalysis] = useState(false);
    const [htmlCode, setHtmlCode] = useState("<h1>Hello world</h1>");
    const [cssCode, setCssCode] = useState("body { background-color: #f4f4f4; }");
    const [jsCode, setJsCode] = useState("// some comment");

    const editorRef = useRef(null);
    const socketRef = useRef(null);
    const currentRevision = useRef(0);
    const hasJoined = useRef(false); // Track if we've already joined to prevent double joins
    const {projectID} = useParams();
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [username, setUsername] = useState(localStorage.getItem("username") || "");

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

            socketRef.current.on("code-update", ({tab, operation}) => {
                console.log(`📝 Received code update for ${tab}:`, operation.content?.substring(0, 50));
                if (tab === "html") setHtmlCode(operation.content);
                else if (tab === "css") setCssCode(operation.content);
                else if (tab === "js") setJsCode(operation.content);

                const editor = editorRef.current;

                // Only restore the selection and cursor position if the position is available
                if (editor && operation.position) {
                    editor.setPosition(operation.position); // Set cursor position

                    const newSelection = new monaco.Range(operation.anchor, 0, operation.focus, 0);
                    editor.setSelection(newSelection); // Restore the selection range
                }
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
        // Update local state first for immediate feedback
        if (tab === "html") setHtmlCode(value);
        else if (tab === "css") setCssCode(value);
        else if (tab === "js") setJsCode(value);

        // Then emit to other clients
        if (socketRef.current) {
            const editor = editorRef.current;
            const selection = editor?.getSelection();
            const position = editor?.getPosition();

            const operation = {
                content: value || "",
                anchor: selection?.startLineNumber || 0,
                focus: selection?.endLineNumber || 0,
                position,
            };

            console.log(`📤 Sending code change for ${tab} to project ${projectID}`);
            socketRef.current.emit("code-change", {
                projectID,
                tab,
                operation,
                revision: currentRevision.current,
            });
        }
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

    const setupAutoSuggestions = (monaco, language) => {
        // HTML Custom Suggestions
        if (language === "html") {
            monaco.languages.registerCompletionItemProvider("html", {
                provideCompletionItems: (model, position) => {
                    const suggestions = [
                        {
                            label: "div",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: '<div className="${1:class-name}">\n\t${2}\n</div>',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Create a div element with class",
                        },
                        {
                            label: "button",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: '<button onClick="${1:handleClick}">${2:Click me}</button>',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Create a button element",
                        },
                        {
                            label: "input",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: '<input type="${1:text}" placeholder="${2:Enter text}" />',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Create an input field",
                        },
                        {
                            label: "form",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: '<form onSubmit="${1:handleSubmit}">\n\t${2}\n</form>',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Create a form element",
                        },
                        {
                            label: "img",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: '<img src="${1:image.jpg}" alt="${2:description}" />',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Create an image element",
                        },
                        {
                            label: "link",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: '<a href="${1:url}">${2:Link Text}</a>',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Create a hyperlink",
                        },
                    ];
                    return {suggestions};
                },
            });
        }

        // CSS Custom Suggestions
        if (language === "css") {
            monaco.languages.registerCompletionItemProvider("css", {
                provideCompletionItems: (model, position) => {
                    const suggestions = [
                        {
                            label: "flex-center",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: "display: flex;\njustify-content: center;\nalign-items: center;",
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Flexbox center layout",
                        },
                        {
                            label: "grid-layout",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: "display: grid;\ngrid-template-columns: repeat(${1:3}, 1fr);\ngap: ${2:20px};",
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Grid layout template",
                        },
                        {
                            label: "transition",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: "transition: all ${1:0.3s} ease;",
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Add transition effect",
                        },
                        {
                            label: "shadow",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: "box-shadow: ${1:0 2px 4px} rgba(0, 0, 0, ${2:0.1});",
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Add box shadow",
                        },
                        {
                            label: "gradient",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: "background: linear-gradient(${1:to right}, ${2:#ff0000}, ${3:#00ff00});",
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Linear gradient background",
                        },
                    ];
                    return {suggestions};
                },
            });
        }

        // JavaScript Custom Suggestions
        if (language === "javascript") {
            monaco.languages.registerCompletionItemProvider("javascript", {
                provideCompletionItems: (model, position) => {
                    const suggestions = [
                        {
                            label: "log",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: 'console.log("${1:message}", ${2:variable});',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Console log statement",
                        },
                        {
                            label: "func",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: "function ${1:functionName}(${2:params}) {\n\t${3}\n}",
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Create a function",
                        },
                        {
                            label: "arrow",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: "const ${1:functionName} = (${2:params}) => {\n\t${3}\n};",
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Arrow function",
                        },
                        {
                            label: "foreach",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: "${1:array}.forEach((${2:item}) => {\n\t${3}\n});",
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "forEach loop",
                        },
                        {
                            label: "map",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: "${1:array}.map((${2:item}) => ${3:item});",
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Map array method",
                        },
                        {
                            label: "filter",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: "${1:array}.filter((${2:item}) => ${3:condition});",
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Filter array method",
                        },
                        {
                            label: "fetch",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText:
                                'fetch("${1:url}")\n\t.then(res => res.json())\n\t.then(data => {\n\t\t${2}\n\t})\n\t.catch(err => console.error(err));',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Fetch API call",
                        },
                        {
                            label: "async",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText:
                                "async ${1:functionName}(${2:params}) {\n\ttry {\n\t\t${3}\n\t} catch (error) {\n\t\tconsole.error(error);\n\t}\n}",
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Async function with try-catch",
                        },
                        {
                            label: "promise",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: "new Promise((resolve, reject) => {\n\t${1}\n\tresolve(${2:value});\n});",
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Create a Promise",
                        },
                        {
                            label: "setInterval",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: "setInterval(() => {\n\t${1}\n}, ${2:1000});",
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Set interval timer",
                        },
                        {
                            label: "setTimeout",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: "setTimeout(() => {\n\t${1}\n}, ${2:1000});",
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Set timeout",
                        },
                        {
                            label: "class",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText:
                                "class ${1:ClassName} {\n\tconstructor(${2:params}) {\n\t\t${3}\n\t}\n\n\t${4:methodName}() {\n\t\t${5}\n\t}\n}",
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Create a class",
                        },
                    ];
                    return {suggestions};
                },
            });
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
            <EditiorNavbar clients={clients} projectName={`Project: ${projectID}`} />
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
                            <i
                                className="text-[20px] cursor-pointer hover:text-blue-400 transition"
                                onClick={() => setShowVersionHistory(true)}
                                title="Version History"
                            >
                                <FaHistory />
                            </i>
                            <i
                                className="text-[20px] cursor-pointer hover:text-green-400 transition"
                                onClick={() => setShowCodeAnalysis(true)}
                                title="Code Analysis (Tokenizer)"
                            >
                                <FaCode />
                            </i>
                            <i className="text-[20px] cursor-pointer" onClick={changeTheme}>
                                <MdLightMode />
                            </i>
                            <i className="text-[20px] cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
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
                        onMount={(editor, monaco) => {
                            editorRef.current = editor;
                            setupAutoSuggestions(monaco, tab);
                        }}
                        options={{
                            quickSuggestions: true,
                            suggestOnTriggerCharacters: true,
                            acceptSuggestionOnEnter: "on",
                            tabCompletion: "on",
                            wordBasedSuggestions: true,
                            suggest: {
                                showKeywords: true,
                                showSnippets: true,
                                showWords: true,
                            },
                        }}
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
