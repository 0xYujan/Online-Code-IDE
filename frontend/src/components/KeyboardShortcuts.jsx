import React from "react";
import {FaRegWindowClose} from "react-icons/fa";

const KeyboardShortcuts = ({onClose, theme = "dark"}) => {
    const shortcuts = [
        {
            category: "General",
            items: [
                {keys: "Ctrl + S", description: "Save project"},
                {keys: "Ctrl + F", description: "Find"},
                {keys: "Ctrl + H", description: "Find and Replace"},
                {keys: "Ctrl + /", description: "Toggle comment"},
            ],
        },
        {
            category: "Editing",
            items: [
                {keys: "Ctrl + Z", description: "Undo"},
                {keys: "Ctrl + Y", description: "Redo"},
                {keys: "Ctrl + L", description: "Select line"},
                {keys: "Ctrl + Shift + K", description: "Delete line"},
                {keys: "Alt + ↑", description: "Move line up"},
                {keys: "Alt + ↓", description: "Move line down"},
                {keys: "Tab", description: "Indent"},
            ],
        },
        {
            category: "Code",
            items: [
                {keys: "Ctrl + Shift + F", description: "Format code"},
                {keys: "( [ { \" '", description: "Auto-close brackets/quotes"},
                {keys: "Enter", description: "Smart auto-indent"},
            ],
        },
    ];

    const themeStyles =
        theme === "dark"
            ? {
                  background: "#1e1e1e",
                  modalBg: "#2d2d2d",
                  color: "#d4d4d4",
                  border: "#333",
                  keyBg: "#3c3c3c",
                  categoryColor: "#4ec9b0",
              }
            : {
                  background: "rgba(0,0,0,0.5)",
                  modalBg: "#ffffff",
                  color: "#000000",
                  border: "#ddd",
                  keyBg: "#f0f0f0",
                  categoryColor: "#0066cc",
              };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10000,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: themeStyles.modalBg,
                    borderRadius: "8px",
                    padding: "24px",
                    maxWidth: "600px",
                    width: "90%",
                    maxHeight: "80vh",
                    overflow: "auto",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                    }}
                >
                    <h2 style={{margin: 0, color: themeStyles.color}}>Keyboard Shortcuts</h2>
                    <FaRegWindowClose
                        onClick={onClose}
                        style={{cursor: "pointer", fontSize: "20px", color: themeStyles.color}}
                    />
                </div>

                {/* Shortcuts List */}
                {shortcuts.map((section, idx) => (
                    <div key={idx} style={{marginBottom: "24px"}}>
                        <h3
                            style={{
                                color: themeStyles.categoryColor,
                                marginBottom: "12px",
                                fontSize: "16px",
                                fontWeight: "600",
                            }}
                        >
                            {section.category}
                        </h3>
                        {section.items.map((shortcut, i) => (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "8px 12px",
                                    borderBottom: `1px solid ${themeStyles.border}`,
                                    fontSize: "14px",
                                }}
                            >
                                <span style={{color: themeStyles.color}}>{shortcut.description}</span>
                                <kbd
                                    style={{
                                        backgroundColor: themeStyles.keyBg,
                                        color: themeStyles.color,
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        border: `1px solid ${themeStyles.border}`,
                                        fontFamily: "monospace",
                                        fontSize: "12px",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {shortcut.keys}
                                </kbd>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KeyboardShortcuts;
