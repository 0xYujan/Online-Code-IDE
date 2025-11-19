import React from "react";
import {FaRegWindowClose, FaTrash} from "react-icons/fa";

const ConsoleOutput = ({logs, onClear, onClose, theme = "dark"}) => {
    const themeStyles =
        theme === "dark"
            ? {
                  background: "#1e1e1e",
                  color: "#d4d4d4",
                  border: "#333",
                  errorColor: "#f48771",
                  warnColor: "#dcdcaa",
                  logColor: "#d4d4d4",
                  infoColor: "#4fc1ff",
              }
            : {
                  background: "#ffffff",
                  color: "#000000",
                  border: "#ddd",
                  errorColor: "#e51400",
                  warnColor: "#bf8803",
                  logColor: "#000000",
                  infoColor: "#0066cc",
              };

    const getLogStyle = (type) => {
        switch (type) {
            case "error":
                return {color: themeStyles.errorColor};
            case "warn":
                return {color: themeStyles.warnColor};
            case "info":
                return {color: themeStyles.infoColor};
            default:
                return {color: themeStyles.logColor};
        }
    };

    return (
        <div
            style={{
                width: "100%",
                height: "200px",
                backgroundColor: themeStyles.background,
                borderTop: `1px solid ${themeStyles.border}`,
                display: "flex",
                flexDirection: "column",
                fontFamily: "'Fira Code', 'Consolas', monospace",
                fontSize: "13px",
            }}
        >
            {/* Console Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderBottom: `1px solid ${themeStyles.border}`,
                    backgroundColor: theme === "dark" ? "#2d2d2d" : "#f0f0f0",
                }}
            >
                <span style={{fontWeight: "bold", color: themeStyles.color}}>Console</span>
                <div style={{display: "flex", gap: "10px"}}>
                    <FaTrash
                        onClick={onClear}
                        style={{cursor: "pointer", color: themeStyles.color}}
                        title="Clear Console"
                    />
                    <FaRegWindowClose
                        onClick={onClose}
                        style={{cursor: "pointer", color: themeStyles.color}}
                        title="Close Console"
                    />
                </div>
            </div>

            {/* Console Content */}
            <div
                style={{
                    flex: 1,
                    overflow: "auto",
                    padding: "8px 12px",
                    color: themeStyles.color,
                }}
            >
                {logs.length === 0 ? (
                    <div style={{color: theme === "dark" ? "#666" : "#999", fontStyle: "italic"}}>
                        Console output will appear here...
                    </div>
                ) : (
                    logs.map((log, index) => (
                        <div
                            key={index}
                            style={{
                                padding: "2px 0",
                                ...getLogStyle(log.type),
                            }}
                        >
                            <span style={{opacity: 0.6, marginRight: "8px"}}>
                                {log.type === "error"
                                    ? "✖"
                                    : log.type === "warn"
                                    ? "⚠"
                                    : log.type === "info"
                                    ? "ℹ"
                                    : "▸"}
                            </span>
                            {log.message}
                        </div>
                    ))
                )}
            </div>

            {/* Scrollbar Styles */}
            <style>{`
                div::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                div::-webkit-scrollbar-track {
                    background: ${theme === "dark" ? "#1e1e1e" : "#f1f1f1"};
                }
                div::-webkit-scrollbar-thumb {
                    background: ${theme === "dark" ? "#424242" : "#888"};
                    border-radius: 4px;
                }
                div::-webkit-scrollbar-thumb:hover {
                    background: ${theme === "dark" ? "#4e4e4e" : "#555"};
                }
            `}</style>
        </div>
    );
};

export default ConsoleOutput;
