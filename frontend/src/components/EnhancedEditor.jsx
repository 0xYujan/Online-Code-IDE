import React, {useEffect, useRef, useState} from "react";
import {FaRegWindowClose} from "react-icons/fa";
import ConsoleOutput from "./ConsoleOutput";
import KeyboardShortcuts from "./KeyboardShortcuts";
import SettingsPanel from "./SettingsPanel";

const EnhancedEditor = ({
    value = "",
    onChange,
    language = "html",
    theme = "dark",
    height = "82vh",
    consoleLogs = [],
    onClearConsole,
    showConsole = false,
    onToggleConsole,
    showSettings = false,
    onToggleSettings,
    showShortcuts = false,
    onToggleShortcuts,
    isFullScreen = false,
}) => {
    const editorRef = useRef(null);
    const textareaRef = useRef(null);
    const minimapRef = useRef(null);
    const previewRef = useRef(null);
    const [lineNumbers, setLineNumbers] = useState([1]);
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [replaceTerm, setReplaceTerm] = useState("");
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [currentMatch, setCurrentMatch] = useState(0);
    const [totalMatches, setTotalMatches] = useState(0);
    const [showMinimap, setShowMinimap] = useState(false);
    const [foldedLines, setFoldedLines] = useState(new Set());
    const [history, setHistory] = useState([value]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem("editorSettings");
        return saved
            ? JSON.parse(saved)
            : {
                  fontSize: 14,
                  tabSize: 4,
                  fontFamily: "'Fira Code', monospace",
                  lineHeight: 1.5,
                  autoSave: false,
                  showLineNumbers: true,
                  wordWrap: false,
              };
    });

    // Save settings to localStorage
    useEffect(() => {
        localStorage.setItem("editorSettings", JSON.stringify(settings));
    }, [settings]);

    // Update line numbers when content changes
    useEffect(() => {
        const lines = value.split("\n").length;
        setLineNumbers(Array.from({length: lines}, (_, i) => i + 1));
    }, [value]);

    // Add to history for undo/redo
    const addToHistory = (newValue) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newValue);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    // Undo/Redo handlers
    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            onChange(history[historyIndex - 1]);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            onChange(history[historyIndex + 1]);
        }
    };

    // Find matches
    useEffect(() => {
        if (searchTerm) {
            const flags = caseSensitive ? "g" : "gi";
            const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
            const matches = value.match(regex);
            setTotalMatches(matches ? matches.length : 0);
        } else {
            setTotalMatches(0);
        }
    }, [searchTerm, value, caseSensitive]);

    // Format code
    const formatCode = () => {
        let formatted = value;

        if (language === "html") {
            formatted = formatHTML(value);
        } else if (language === "css") {
            formatted = formatCSS(value);
        } else if (language === "javascript" || language === "js") {
            formatted = formatJS(value);
        }

        onChange(formatted);
        addToHistory(formatted);
    };

    const formatHTML = (code) => {
        let formatted = "";
        let indent = 0;
        const lines = code.split(/>\s*</);

        lines.forEach((line, i) => {
            if (line.match(/^\/\w/)) indent = Math.max(0, indent - 1);

            formatted += "    ".repeat(indent);
            formatted += (i > 0 ? "<" : "") + line + (i < lines.length - 1 ? ">" : "");
            formatted += "\n";

            if (line.match(/^<?\w[^>]*[^\/]$/) && !line.startsWith("!")) indent++;
        });

        return formatted.trim();
    };

    const formatCSS = (code) => {
        return code
        .replace(/\s*{\s*/g, " {\n    ")
        .replace(/;\s*/g, ";\n    ")
        .replace(/\s*}\s*/g, "\n}\n")
        .replace(/,\s*/g, ", ")
        .trim();
    };

    const formatJS = (code) => {
        let formatted = "";
        let indent = 0;
        const lines = code.split("\n");

        lines.forEach((line) => {
            const trimmed = line.trim();
            if (trimmed.match(/^[}\])]/) || trimmed.startsWith("</")) {
                indent = Math.max(0, indent - 1);
            }

            formatted += "    ".repeat(indent) + trimmed + "\n";

            if (
                trimmed.endsWith("{") ||
                trimmed.endsWith("[") ||
                trimmed.endsWith("(") ||
                (trimmed.match(/<[^>\/]+>$/) && !trimmed.includes("/>"))
            ) {
                indent++;
            }
        });

        return formatted.trim();
    };

    // Handle input changes with auto-completion
    const handleChange = (e) => {
        const newValue = e.target.value;
        const cursorPos = e.target.selectionStart;

        // Check if user just typed ">" to close a tag
        if (language === "html" && newValue[cursorPos - 1] === ">" && newValue[cursorPos - 2] !== "/") {
            const beforeCursor = newValue.substring(0, cursorPos);
            const tagMatch = beforeCursor.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*>$/);

            if (tagMatch) {
                const tagName = tagMatch[1];
                const selfClosingTags = [
                    "img",
                    "br",
                    "hr",
                    "input",
                    "meta",
                    "link",
                    "area",
                    "base",
                    "col",
                    "embed",
                    "source",
                    "track",
                    "wbr",
                ];

                if (!selfClosingTags.includes(tagName.toLowerCase())) {
                    const afterCursor = newValue.substring(cursorPos);
                    const updatedValue = beforeCursor + `</${tagName}>` + afterCursor;
                    onChange(updatedValue);
                    addToHistory(updatedValue);

                    setTimeout(() => {
                        e.target.selectionStart = e.target.selectionEnd = cursorPos;
                    }, 0);
                    return;
                }
            }
        }

        onChange(newValue);
        addToHistory(newValue);
    };

    // Handle keyboard shortcuts and special keys
    const handleKeyDown = (e) => {
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;

        // Ctrl+F - Find
        if (e.ctrlKey && e.key === "f") {
            e.preventDefault();
            setShowSearch(true);
            return;
        }

        // Ctrl+H - Replace
        if (e.ctrlKey && e.key === "h") {
            e.preventDefault();
            setShowSearch(true);
            return;
        }

        // Ctrl+Z - Undo
        if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
            e.preventDefault();
            handleUndo();
            return;
        }

        // Ctrl+Y or Ctrl+Shift+Z - Redo
        if ((e.ctrlKey && e.key === "y") || (e.ctrlKey && e.shiftKey && e.key === "z")) {
            e.preventDefault();
            handleRedo();
            return;
        }

        // Ctrl+/ - Toggle comment
        if (e.ctrlKey && e.key === "/") {
            e.preventDefault();
            toggleComment();
            return;
        }

        // Ctrl+Shift+F - Format code
        if (e.ctrlKey && e.shiftKey && e.key === "F") {
            e.preventDefault();
            formatCode();
            return;
        }

        // Ctrl+L - Select line
        if (e.ctrlKey && e.key === "l") {
            e.preventDefault();
            selectLine();
            return;
        }

        // Ctrl+Shift+K - Delete line
        if (e.ctrlKey && e.shiftKey && e.key === "K") {
            e.preventDefault();
            deleteLine();
            return;
        }

        // Alt+Up - Move line up
        if (e.altKey && e.key === "ArrowUp") {
            e.preventDefault();
            moveLine(-1);
            return;
        }

        // Alt+Down - Move line down
        if (e.altKey && e.key === "ArrowDown") {
            e.preventDefault();
            moveLine(1);
            return;
        }

        // Tab key for indentation
        if (e.key === "Tab") {
            e.preventDefault();
            const indentSize = " ".repeat(settings.tabSize);
            const newValue = value.substring(0, start) + indentSize + value.substring(end);
            onChange(newValue);
            addToHistory(newValue);

            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + settings.tabSize;
            }, 0);
            return;
        }

        // Auto-close brackets, quotes, etc.
        const pairs = {
            "(": ")",
            "[": "]",
            "{": "}",
            '"': '"',
            "'": "'",
            "`": "`",
        };

        if (pairs[e.key]) {
            e.preventDefault();
            const closingChar = pairs[e.key];
            const selectedText = value.substring(start, end);

            if (selectedText) {
                const newValue = value.substring(0, start) + e.key + selectedText + closingChar + value.substring(end);
                onChange(newValue);
                addToHistory(newValue);
                setTimeout(() => {
                    e.target.selectionStart = start + 1;
                    e.target.selectionEnd = end + 1;
                }, 0);
            } else {
                const newValue = value.substring(0, start) + e.key + closingChar + value.substring(end);
                onChange(newValue);
                addToHistory(newValue);
                setTimeout(() => {
                    e.target.selectionStart = e.target.selectionEnd = start + 1;
                }, 0);
            }
            return;
        }

        // Auto-indent on Enter
        if (e.key === "Enter") {
            e.preventDefault();
            const beforeCursor = value.substring(0, start);
            const afterCursor = value.substring(start);
            const currentLine = beforeCursor.split("\n").pop();
            const indentMatch = currentLine.match(/^\s*/);
            const currentIndent = indentMatch ? indentMatch[0] : "";

            let extraIndent = "";
            let needsClosingIndent = false;

            if (language === "html") {
                if (/<([a-zA-Z][a-zA-Z0-9]*)[^>]*>\s*$/.test(currentLine)) {
                    const tagMatch = currentLine.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*>\s*$/);
                    if (tagMatch) {
                        const tagName = tagMatch[1];
                        const selfClosingTags = [
                            "img",
                            "br",
                            "hr",
                            "input",
                            "meta",
                            "link",
                            "area",
                            "base",
                            "col",
                            "embed",
                            "source",
                            "track",
                            "wbr",
                        ];
                        if (!selfClosingTags.includes(tagName.toLowerCase()) && !currentLine.includes("/>")) {
                            extraIndent = "    ";
                            if (afterCursor.trim().startsWith("</")) {
                                needsClosingIndent = true;
                            }
                        }
                    }
                }
            } else if (language === "css" || language === "javascript" || language === "js") {
                if (/[{[(]\s*$/.test(currentLine)) {
                    extraIndent = "    ";
                    if (afterCursor.trim().match(/^[}\])]/) && currentLine.trim().match(/[{[(]\s*$/)) {
                        needsClosingIndent = true;
                    }
                }
            }

            let newValue;
            if (needsClosingIndent) {
                newValue = beforeCursor + "\n" + currentIndent + extraIndent + "\n" + currentIndent + afterCursor;
                onChange(newValue);
                addToHistory(newValue);
                setTimeout(() => {
                    e.target.selectionStart = e.target.selectionEnd =
                        start + 1 + currentIndent.length + extraIndent.length;
                }, 0);
            } else {
                newValue = beforeCursor + "\n" + currentIndent + extraIndent + afterCursor;
                onChange(newValue);
                addToHistory(newValue);
                setTimeout(() => {
                    e.target.selectionStart = e.target.selectionEnd =
                        start + 1 + currentIndent.length + extraIndent.length;
                }, 0);
            }
            return;
        }

        // Auto-dedent when typing closing bracket/tag
        if (
            (e.key === "}" || e.key === "]" || e.key === ")") &&
            (language === "css" || language === "javascript" || language === "js")
        ) {
            const beforeCursor = value.substring(0, start);
            const currentLine = beforeCursor.split("\n").pop();

            if (/^\s+$/.test(currentLine)) {
                e.preventDefault();
                const newIndent = currentLine.substring(0, Math.max(0, currentLine.length - 4));
                const beforeLine = beforeCursor.substring(0, beforeCursor.length - currentLine.length);
                const newValue = beforeLine + newIndent + e.key + value.substring(start);
                onChange(newValue);
                addToHistory(newValue);
                setTimeout(() => {
                    e.target.selectionStart = e.target.selectionEnd = beforeLine.length + newIndent.length + 1;
                }, 0);
                return;
            }
        }
    };

    // Toggle comment
    const toggleComment = () => {
        if (!textareaRef.current) return;

        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const lines = value.split("\n");
        const startLine = value.substring(0, start).split("\n").length - 1;
        const endLine = value.substring(0, end).split("\n").length - 1;

        let commentSymbol = "//";
        if (language === "html") commentSymbol = "<!-- ";
        if (language === "css") commentSymbol = "/* ";

        const commentEnd = language === "html" ? " -->" : language === "css" ? " */" : "";

        for (let i = startLine; i <= endLine; i++) {
            if (lines[i].trim().startsWith(commentSymbol)) {
                lines[i] = lines[i].replace(commentSymbol, "").replace(commentEnd, "");
            } else {
                lines[i] = commentSymbol + lines[i] + commentEnd;
            }
        }

        const newValue = lines.join("\n");
        onChange(newValue);
        addToHistory(newValue);
    };

    // Select entire line
    const selectLine = () => {
        if (!textareaRef.current) return;

        const start = textareaRef.current.selectionStart;
        const lines = value.split("\n");
        const lineIndex = value.substring(0, start).split("\n").length - 1;

        let lineStart = 0;
        for (let i = 0; i < lineIndex; i++) {
            lineStart += lines[i].length + 1;
        }

        const lineEnd = lineStart + lines[lineIndex].length;

        setTimeout(() => {
            textareaRef.current.selectionStart = lineStart;
            textareaRef.current.selectionEnd = lineEnd;
        }, 0);
    };

    // Delete line
    const deleteLine = () => {
        if (!textareaRef.current) return;

        const start = textareaRef.current.selectionStart;
        const lines = value.split("\n");
        const lineIndex = value.substring(0, start).split("\n").length - 1;

        lines.splice(lineIndex, 1);
        const newValue = lines.join("\n");
        onChange(newValue);
        addToHistory(newValue);
    };

    // Move line up or down
    const moveLine = (direction) => {
        if (!textareaRef.current) return;

        const start = textareaRef.current.selectionStart;
        const lines = value.split("\n");
        const lineIndex = value.substring(0, start).split("\n").length - 1;

        if ((direction === -1 && lineIndex === 0) || (direction === 1 && lineIndex === lines.length - 1)) {
            return;
        }

        const temp = lines[lineIndex];
        lines[lineIndex] = lines[lineIndex + direction];
        lines[lineIndex + direction] = temp;

        const newValue = lines.join("\n");
        onChange(newValue);
        addToHistory(newValue);
    };

    // Find and replace
    const findNext = () => {
        if (!searchTerm || totalMatches === 0) return;
        setCurrentMatch((currentMatch + 1) % totalMatches);
    };

    const findPrevious = () => {
        if (!searchTerm || totalMatches === 0) return;
        setCurrentMatch((currentMatch - 1 + totalMatches) % totalMatches);
    };

    const replaceOne = () => {
        if (!searchTerm) return;
        const flags = caseSensitive ? "g" : "gi";
        const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
        const newValue = value.replace(regex, replaceTerm);
        onChange(newValue);
        addToHistory(newValue);
    };

    const replaceAll = () => {
        if (!searchTerm) return;
        const flags = caseSensitive ? "g" : "gi";
        const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
        const newValue = value.replace(regex, replaceTerm);
        onChange(newValue);
        addToHistory(newValue);
    };

    // Sync scroll between line numbers and code
    const handleScroll = (e) => {
        if (editorRef.current) {
            editorRef.current.scrollTop = e.target.scrollTop;
        }
        if (previewRef.current) {
            previewRef.current.scrollTop = e.target.scrollTop;
            previewRef.current.scrollLeft = e.target.scrollLeft;
        }
        if (minimapRef.current) {
            const percentage = e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight);
            minimapRef.current.scrollTop =
                percentage * (minimapRef.current.scrollHeight - minimapRef.current.clientHeight);
        }
    };

    // Escape HTML for display
    const escapeHtml = (text) => {
        return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    // Syntax highlighting function
    const highlightSyntax = (code, lang) => {
        if (!code) return "";

        let highlighted = escapeHtml(code);

        if (lang === "html") {
            const commentPlaceholders = [];
            const tagPlaceholders = [];

            highlighted = highlighted.replace(/(&lt;!--[\s\S]*?--&gt;)/g, (match) => {
                const placeholder = `___COMMENT_${commentPlaceholders.length}___`;
                commentPlaceholders.push(`<span class="comment">${match}</span>`);
                return placeholder;
            });

            highlighted = highlighted.replace(
                /(&lt;\/?)([a-zA-Z][a-zA-Z0-9]*)([\s\S]*?)(\/?&gt;)/g,
                (fullMatch, openBracket, tagName, content, closeBracket) => {
                    const placeholder = `___TAG_${tagPlaceholders.length}___`;

                    let tagHtml = `${openBracket}<span class="tag">${tagName}</span>`;

                    let highlightedContent = content.replace(
                        /\s+([a-zA-Z][a-zA-Z0-9-]*)=(&quot;[^&]*?&quot;|&#039;[^&]*?&#039;)/g,
                        ' <span class="attribute">$1</span>=<span class="string">$2</span>'
                    );

                    tagHtml += highlightedContent + `<span class="tag">${closeBracket}</span>`;

                    tagPlaceholders.push(tagHtml);
                    return placeholder;
                }
            );

            tagPlaceholders.forEach((tag, index) => {
                highlighted = highlighted.replace(`___TAG_${index}___`, tag);
            });

            commentPlaceholders.forEach((comment, index) => {
                highlighted = highlighted.replace(`___COMMENT_${index}___`, comment);
            });
        } else if (lang === "css") {
            highlighted = highlighted
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>')
            .replace(/([.#]?[\w-]+)(\s*\{)/g, '<span class="selector">$1</span>$2')
            .replace(/([\w-]+)(\s*:)/g, '<span class="property">$1</span>$2')
            .replace(/:\s*([^;}\n]+)/g, ': <span class="value">$1</span>')
            .replace(/(!important)/g, '<span class="keyword">$1</span>');
        } else if (lang === "js" || lang === "javascript") {
            const commentPlaceholders = [];
            const stringPlaceholders = [];

            highlighted = highlighted.replace(/(\/\/.*$)/gm, (match) => {
                const placeholder = `___COMMENT_${commentPlaceholders.length}___`;
                commentPlaceholders.push(`<span class="comment">${match}</span>`);
                return placeholder;
            });

            highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, (match) => {
                const placeholder = `___COMMENT_${commentPlaceholders.length}___`;
                commentPlaceholders.push(`<span class="comment">${match}</span>`);
                return placeholder;
            });

            highlighted = highlighted.replace(/(&quot;[^&]*?&quot;|&#039;[^&]*?&#039;|`[^`]*?`)/g, (match) => {
                const placeholder = `___STRING_${stringPlaceholders.length}___`;
                stringPlaceholders.push(`<span class="string">${match}</span>`);
                return placeholder;
            });

            highlighted = highlighted
            .replace(
                /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|throw|new|class|extends|import|export|default|async|await)\b/g,
                '<span class="keyword">$1</span>'
            )
            .replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g, '<span class="constant">$1</span>')
            .replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>')
            .replace(
                /\b(console|document|window|Math|Array|Object|String|Number|Date|JSON|Promise|Set|Map)\b/g,
                '<span class="class-name">$1</span>'
            )
            .replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, '<span class="class-name">$1</span>');

            commentPlaceholders.forEach((comment, index) => {
                highlighted = highlighted.replace(`___COMMENT_${index}___`, comment);
            });

            stringPlaceholders.forEach((string, index) => {
                highlighted = highlighted.replace(`___STRING_${index}___`, string);
            });
        }

        // Highlight search matches
        if (searchTerm) {
            const flags = caseSensitive ? "g" : "gi";
            const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(escapedTerm, flags);
            highlighted = highlighted.replace(regex, '<span class="search-match">$&</span>');
        }

        return highlighted;
    };

    const themeStyles =
        theme === "dark"
            ? {
                  background: "#1e1e1e",
                  color: "#d4d4d4",
                  lineNumberBg: "#1e1e1e",
                  lineNumberColor: "#858585",
                  selection: "#264f78",
              }
            : {
                  background: "#ffffff",
                  color: "#000000",
                  lineNumberBg: "#f5f5f5",
                  lineNumberColor: "#237893",
                  selection: "#add6ff",
              };

    return (
        <div style={{position: "relative", height: isFullScreen ? "100vh" : height}}>
            {/* Search/Replace Panel */}
            {showSearch && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        right: showMinimap ? "120px" : "20px",
                        zIndex: 1000,
                        background: theme === "dark" ? "#2d2d2d" : "#f0f0f0",
                        padding: "10px",
                        borderRadius: "5px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                        minWidth: "300px",
                    }}
                >
                    <div style={{display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px"}}>
                        <input
                            type="text"
                            placeholder="Find..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                flex: 1,
                                padding: "5px",
                                background: theme === "dark" ? "#1e1e1e" : "#fff",
                                color: theme === "dark" ? "#d4d4d4" : "#000",
                                border: "1px solid #555",
                                borderRadius: "3px",
                            }}
                        />
                        <button onClick={findPrevious} style={{padding: "5px 10px", cursor: "pointer"}}>
                            ↑
                        </button>
                        <button onClick={findNext} style={{padding: "5px 10px", cursor: "pointer"}}>
                            ↓
                        </button>
                        <label style={{fontSize: "12px", color: theme === "dark" ? "#d4d4d4" : "#000"}}>
                            <input
                                type="checkbox"
                                checked={caseSensitive}
                                onChange={(e) => setCaseSensitive(e.target.checked)}
                            />
                            Aa
                        </label>
                        <FaRegWindowClose
                            onClick={() => setShowSearch(false)}
                            style={{cursor: "pointer", color: theme === "dark" ? "#d4d4d4" : "#000"}}
                        />
                    </div>
                    <div style={{fontSize: "12px", color: theme === "dark" ? "#858585" : "#666", marginBottom: "5px"}}>
                        {totalMatches > 0 ? `${currentMatch + 1} of ${totalMatches}` : "No results"}
                    </div>
                    <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                        <input
                            type="text"
                            placeholder="Replace..."
                            value={replaceTerm}
                            onChange={(e) => setReplaceTerm(e.target.value)}
                            style={{
                                flex: 1,
                                padding: "5px",
                                background: theme === "dark" ? "#1e1e1e" : "#fff",
                                color: theme === "dark" ? "#d4d4d4" : "#000",
                                border: "1px solid #555",
                                borderRadius: "3px",
                            }}
                        />
                        <button onClick={replaceOne} style={{padding: "5px 10px", cursor: "pointer", fontSize: "11px"}}>
                            Replace
                        </button>
                        <button onClick={replaceAll} style={{padding: "5px 10px", cursor: "pointer", fontSize: "11px"}}>
                            All
                        </button>
                    </div>
                </div>
            )}

            {/* Main Editor */}
            <div
                className="custom-editor-container"
                style={{
                    height: showConsole ? "calc(100% - 200px)" : "100%",
                    display: "flex",
                    fontFamily: settings.fontFamily,
                    fontSize: `${settings.fontSize}px`,
                    overflow: "hidden",
                    position: "relative",
                    backgroundColor: themeStyles.background,
                }}
            >
                {/* Line Numbers */}
                {settings.showLineNumbers && (
                    <div
                        ref={editorRef}
                        className="line-numbers"
                        style={{
                            width: "50px",
                            backgroundColor: themeStyles.lineNumberBg,
                            color: themeStyles.lineNumberColor,
                            textAlign: "right",
                            paddingRight: "10px",
                            paddingTop: "10px",
                            userSelect: "none",
                            overflow: "hidden",
                            borderRight: `1px solid ${theme === "dark" ? "#333" : "#ddd"}`,
                        }}
                    >
                        {lineNumbers.map((num) => (
                            <div
                                key={num}
                                style={{
                                    height: `${settings.fontSize * settings.lineHeight}px`,
                                    lineHeight: `${settings.fontSize * settings.lineHeight}px`,
                                }}
                            >
                                {num}
                            </div>
                        ))}
                    </div>
                )}

                {/* Code Area */}
                <div style={{flex: 1, position: "relative", overflow: "hidden"}}>
                    {/* Syntax Highlighted Preview */}
                    <pre
                        ref={previewRef}
                        className="syntax-highlight"
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            margin: 0,
                            padding: "10px",
                            color: themeStyles.color,
                            whiteSpace: settings.wordWrap ? "pre-wrap" : "pre",
                            wordWrap: settings.wordWrap ? "break-word" : "normal",
                            overflowWrap: settings.wordWrap ? "break-word" : "normal",
                            pointerEvents: "none",
                            overflow: "auto",
                            lineHeight: settings.lineHeight,
                        }}
                        dangerouslySetInnerHTML={{
                            __html: highlightSyntax(value, language),
                        }}
                    />

                    {/* Actual Textarea */}
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onScroll={handleScroll}
                        spellCheck={false}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: "100%",
                            height: "100%",
                            margin: 0,
                            padding: "10px",
                            border: "none",
                            outline: "none",
                            resize: "none",
                            backgroundColor: "transparent",
                            color: "transparent",
                            caretColor: themeStyles.color,
                            whiteSpace: settings.wordWrap ? "pre-wrap" : "pre",
                            wordWrap: settings.wordWrap ? "break-word" : "normal",
                            overflowWrap: settings.wordWrap ? "break-word" : "normal",
                            lineHeight: settings.lineHeight,
                            fontFamily: "inherit",
                            fontSize: "inherit",
                            overflow: "auto",
                        }}
                    />
                </div>

                {/* Minimap */}
                {showMinimap && (
                    <div
                        ref={minimapRef}
                        style={{
                            width: "100px",
                            backgroundColor: theme === "dark" ? "#1a1a1a" : "#f5f5f5",
                            borderLeft: `1px solid ${theme === "dark" ? "#333" : "#ddd"}`,
                            overflow: "hidden",
                            position: "relative",
                            fontSize: "2px",
                            lineHeight: "2px",
                            padding: "5px",
                            fontFamily: "monospace",
                            color: theme === "dark" ? "#666" : "#999",
                            wordBreak: "break-all",
                            cursor: "pointer",
                        }}
                        onClick={(e) => {
                            const percentage = e.nativeEvent.offsetY / e.currentTarget.clientHeight;
                            if (textareaRef.current) {
                                textareaRef.current.scrollTop =
                                    percentage * (textareaRef.current.scrollHeight - textareaRef.current.clientHeight);
                            }
                        }}
                    >
                        {value.substring(0, 5000)}
                    </div>
                )}
            </div>

            {/* Syntax Highlighting Styles */}
            <style>{`
                .custom-editor-container ::selection {
                    background-color: ${themeStyles.selection};
                }

                .search-match {
                    background-color: ${theme === "dark" ? "#515c6a" : "#ffeb3b"};
                    border-radius: 2px;
                }

                ${
                    theme === "dark"
                        ? `
                    .syntax-highlight .comment { color: #6A9955; font-style: italic; }
                    .syntax-highlight .tag { color: #569CD6; }
                    .syntax-highlight .attribute { color: #9CDCFE; }
                    .syntax-highlight .string { color: #CE9178; }
                    .syntax-highlight .selector { color: #D7BA7D; }
                    .syntax-highlight .property { color: #9CDCFE; }
                    .syntax-highlight .value { color: #CE9178; }
                    .syntax-highlight .keyword { color: #C586C0; font-weight: bold; }
                    .syntax-highlight .constant { color: #569CD6; }
                    .syntax-highlight .number { color: #B5CEA8; }
                    .syntax-highlight .class-name { color: #4EC9B0; }
                `
                        : `
                    .syntax-highlight .comment { color: #008000; font-style: italic; }
                    .syntax-highlight .tag { color: #0000FF; }
                    .syntax-highlight .attribute { color: #FF0000; }
                    .syntax-highlight .string { color: #A31515; }
                    .syntax-highlight .selector { color: #800000; }
                    .syntax-highlight .property { color: #FF0000; }
                    .syntax-highlight .value { color: #0451A5; }
                    .syntax-highlight .keyword { color: #0000FF; font-weight: bold; }
                    .syntax-highlight .constant { color: #0000FF; }
                    .syntax-highlight .number { color: #098658; }
                    .syntax-highlight .class-name { color: #267F99; }
                `
                }

                .custom-editor-container textarea::-webkit-scrollbar,
                .custom-editor-container pre::-webkit-scrollbar {
                    width: 12px;
                    height: 12px;
                }

                .custom-editor-container textarea::-webkit-scrollbar-track,
                .custom-editor-container pre::-webkit-scrollbar-track {
                    background: ${theme === "dark" ? "#1e1e1e" : "#f1f1f1"};
                }

                .custom-editor-container textarea::-webkit-scrollbar-thumb,
                .custom-editor-container pre::-webkit-scrollbar-thumb {
                    background: ${theme === "dark" ? "#424242" : "#888"};
                    border-radius: 6px;
                }

                .custom-editor-container textarea::-webkit-scrollbar-thumb:hover,
                .custom-editor-container pre::-webkit-scrollbar-thumb:hover {
                    background: ${theme === "dark" ? "#4e4e4e" : "#555"};
                }
            `}</style>

            {/* Console Output */}
            {showConsole && (
                <ConsoleOutput
                    logs={consoleLogs}
                    onClear={onClearConsole}
                    onClose={() => onToggleConsole(false)}
                    theme={theme}
                />
            )}

            {/* Settings Panel */}
            {showSettings && (
                <SettingsPanel
                    onClose={() => onToggleSettings(false)}
                    settings={settings}
                    onSettingsChange={setSettings}
                    theme={theme}
                />
            )}

            {/* Keyboard Shortcuts */}
            {showShortcuts && <KeyboardShortcuts onClose={() => onToggleShortcuts(false)} theme={theme} />}
        </div>
    );
};

export default EnhancedEditor;
