import React, {useEffect, useRef, useState} from "react";

const CustomEditor = ({value = "", onChange, language = "html", theme = "dark", height = "82vh"}) => {
    const editorRef = useRef(null);
    const textareaRef = useRef(null);
    const [lineNumbers, setLineNumbers] = useState([1]);

    // Update line numbers when content changes
    useEffect(() => {
        const lines = value.split("\n").length;
        setLineNumbers(Array.from({length: lines}, (_, i) => i + 1));
    }, [value]);

    // Handle input changes with auto-completion
    const handleChange = (e) => {
        const newValue = e.target.value;
        const cursorPos = e.target.selectionStart;

        // Check if user just typed ">" to close a tag
        if (language === "html" && newValue[cursorPos - 1] === ">" && newValue[cursorPos - 2] !== "/") {
            // Find the opening tag before the cursor
            const beforeCursor = newValue.substring(0, cursorPos);
            const tagMatch = beforeCursor.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*>$/);

            if (tagMatch) {
                const tagName = tagMatch[1];
                // Check if it's not a self-closing tag
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
                    // Insert closing tag
                    const afterCursor = newValue.substring(cursorPos);
                    const updatedValue = beforeCursor + `</${tagName}>` + afterCursor;
                    onChange(updatedValue);

                    // Set cursor between opening and closing tags
                    setTimeout(() => {
                        e.target.selectionStart = e.target.selectionEnd = cursorPos;
                    }, 0);
                    return;
                }
            }
        }

        onChange(newValue);
    };

    // Handle special keys
    const handleKeyDown = (e) => {
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;

        // Tab key for indentation
        if (e.key === "Tab") {
            e.preventDefault();
            const newValue = value.substring(0, start) + "    " + value.substring(end);
            onChange(newValue);

            // Set cursor position after the tab
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 4;
            }, 0);
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
                // Wrap selected text
                const newValue = value.substring(0, start) + e.key + selectedText + closingChar + value.substring(end);
                onChange(newValue);
                setTimeout(() => {
                    e.target.selectionStart = start + 1;
                    e.target.selectionEnd = end + 1;
                }, 0);
            } else {
                // Insert pair
                const newValue = value.substring(0, start) + e.key + closingChar + value.substring(end);
                onChange(newValue);
                setTimeout(() => {
                    e.target.selectionStart = e.target.selectionEnd = start + 1;
                }, 0);
            }
        }

        // Auto-indent on Enter
        if (e.key === "Enter") {
            e.preventDefault();
            const beforeCursor = value.substring(0, start);
            const afterCursor = value.substring(start);
            const currentLine = beforeCursor.split("\n").pop();
            const indentMatch = currentLine.match(/^\s*/);
            const currentIndent = indentMatch ? indentMatch[0] : "";

            // Check if we need extra indent
            let extraIndent = "";
            let needsClosingIndent = false;

            if (language === "html") {
                // Check if line ends with opening tag (not self-closing)
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
                            // Check if next line is a closing tag
                            if (afterCursor.trim().startsWith("</")) {
                                needsClosingIndent = true;
                            }
                        }
                    }
                }
            } else if (language === "css" || language === "javascript" || language === "js") {
                // Check if line ends with opening bracket
                if (/[{[(]\s*$/.test(currentLine)) {
                    extraIndent = "    ";
                    // Check if cursor is between brackets like {}
                    if (afterCursor.trim().match(/^[}\])]/) && currentLine.trim().match(/[{[(]\s*$/)) {
                        needsClosingIndent = true;
                    }
                }
            }

            let newValue;
            if (needsClosingIndent) {
                // Add line for content and line for closing bracket/tag with proper indent
                newValue = beforeCursor + "\n" + currentIndent + extraIndent + "\n" + currentIndent + afterCursor;
                onChange(newValue);
                setTimeout(() => {
                    e.target.selectionStart = e.target.selectionEnd =
                        start + 1 + currentIndent.length + extraIndent.length;
                }, 0);
            } else {
                newValue = beforeCursor + "\n" + currentIndent + extraIndent + afterCursor;
                onChange(newValue);
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

            // If current line only has whitespace, remove one level of indent
            if (/^\s+$/.test(currentLine)) {
                e.preventDefault();
                const newIndent = currentLine.substring(0, Math.max(0, currentLine.length - 4));
                const beforeLine = beforeCursor.substring(0, beforeCursor.length - currentLine.length);
                const newValue = beforeLine + newIndent + e.key + value.substring(start);
                onChange(newValue);
                setTimeout(() => {
                    e.target.selectionStart = e.target.selectionEnd = beforeLine.length + newIndent.length + 1;
                }, 0);
                return;
            }
        }
    };

    // Sync scroll between line numbers and code
    const handleScroll = (e) => {
        if (editorRef.current) {
            editorRef.current.scrollTop = e.target.scrollTop;
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

        // First escape HTML
        let highlighted = escapeHtml(code);

        if (lang === "html") {
            // HTML syntax highlighting - use a more precise approach
            const commentPlaceholders = [];
            const tagPlaceholders = [];

            // Step 1: Protect comments
            highlighted = highlighted.replace(/(&lt;!--[\s\S]*?--&gt;)/g, (match) => {
                const placeholder = `___COMMENT_${commentPlaceholders.length}___`;
                commentPlaceholders.push(`<span class="comment">${match}</span>`);
                return placeholder;
            });

            // Step 2: Protect and highlight complete tags
            highlighted = highlighted.replace(
                /(&lt;\/?)([a-zA-Z][a-zA-Z0-9]*)([\s\S]*?)(\/?&gt;)/g,
                (fullMatch, openBracket, tagName, content, closeBracket) => {
                    const placeholder = `___TAG_${tagPlaceholders.length}___`;

                    // Highlight the tag name
                    let tagHtml = `${openBracket}<span class="tag">${tagName}</span>`;

                    // Highlight attributes in the content
                    let highlightedContent = content.replace(
                        /\s+([a-zA-Z][a-zA-Z0-9-]*)=(&quot;[^&]*?&quot;|&#039;[^&]*?&#039;)/g,
                        ' <span class="attribute">$1</span>=<span class="string">$2</span>'
                    );

                    tagHtml += highlightedContent + `<span class="tag">${closeBracket}</span>`;

                    tagPlaceholders.push(tagHtml);
                    return placeholder;
                }
            );

            // Step 3: Restore tags
            tagPlaceholders.forEach((tag, index) => {
                highlighted = highlighted.replace(`___TAG_${index}___`, tag);
            });

            // Step 4: Restore comments
            commentPlaceholders.forEach((comment, index) => {
                highlighted = highlighted.replace(`___COMMENT_${index}___`, comment);
            });
        } else if (lang === "css") {
            // CSS syntax highlighting
            highlighted = highlighted
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>') // Comments
            .replace(/([.#]?[\w-]+)(\s*\{)/g, '<span class="selector">$1</span>$2') // Selectors
            .replace(/([\w-]+)(\s*:)/g, '<span class="property">$1</span>$2') // Properties
            .replace(/:\s*([^;}\n]+)/g, ': <span class="value">$1</span>') // Values
            .replace(/(!important)/g, '<span class="keyword">$1</span>'); // !important
        } else if (lang === "js" || lang === "javascript") {
            // JavaScript syntax highlighting - order matters! Comments and strings must be first
            // We need to protect comments and strings from being highlighted by other patterns
            const commentPlaceholders = [];
            const stringPlaceholders = [];

            // Replace comments with placeholders
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

            // Replace strings with placeholders
            highlighted = highlighted.replace(/(&quot;[^&]*?&quot;|&#039;[^&]*?&#039;|`[^`]*?`)/g, (match) => {
                const placeholder = `___STRING_${stringPlaceholders.length}___`;
                stringPlaceholders.push(`<span class="string">${match}</span>`);
                return placeholder;
            });

            // Now apply other highlighting
            highlighted = highlighted
            .replace(
                /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|throw|new|class|extends|import|export|default|async|await)\b/g,
                '<span class="keyword">$1</span>'
            ) // Keywords
            .replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g, '<span class="constant">$1</span>') // Constants
            .replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>') // Numbers
            .replace(
                /\b(console|document|window|Math|Array|Object|String|Number|Date|JSON|Promise|Set|Map)\b/g,
                '<span class="class-name">$1</span>'
            ) // Built-in objects
            .replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, '<span class="class-name">$1</span>'); // Class names

            // Restore comments
            commentPlaceholders.forEach((comment, index) => {
                highlighted = highlighted.replace(`___COMMENT_${index}___`, comment);
            });

            // Restore strings
            stringPlaceholders.forEach((string, index) => {
                highlighted = highlighted.replace(`___STRING_${index}___`, string);
            });
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
        <div
            className="custom-editor-container"
            style={{
                height,
                display: "flex",
                fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                fontSize: "14px",
                overflow: "hidden",
                position: "relative",
                backgroundColor: themeStyles.background,
            }}
        >
            {/* Line Numbers */}
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
                    <div key={num} style={{height: "21px", lineHeight: "21px"}}>
                        {num}
                    </div>
                ))}
            </div>

            {/* Code Area */}
            <div style={{flex: 1, position: "relative", overflow: "hidden"}}>
                {/* Syntax Highlighted Preview */}
                <pre
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
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                        pointerEvents: "none",
                        overflow: "auto",
                        lineHeight: "21px",
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
                        fontFamily: "inherit",
                        fontSize: "inherit",
                        lineHeight: "21px",
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                        overflow: "auto",
                    }}
                />
            </div>

            {/* Syntax Highlighting Styles */}
            <style>{`
                .custom-editor-container ::selection {
                    background-color: ${themeStyles.selection};
                }

                /* Dark Theme Colors */
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

                /* Scrollbar Styling */
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
        </div>
    );
};

export default CustomEditor;
