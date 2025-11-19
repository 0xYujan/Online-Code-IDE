import React, {useState} from "react";
import {FaRegWindowClose} from "react-icons/fa";

const SettingsPanel = ({onClose, settings, onSettingsChange, theme = "dark"}) => {
    const [localSettings, setLocalSettings] = useState(settings);

    const handleChange = (key, value) => {
        const updated = {...localSettings, [key]: value};
        setLocalSettings(updated);
        onSettingsChange(updated);
    };

    const themeStyles =
        theme === "dark"
            ? {
                  background: "#1e1e1e",
                  modalBg: "#2d2d2d",
                  color: "#d4d4d4",
                  border: "#333",
                  inputBg: "#3c3c3c",
                  labelColor: "#9cdcfe",
              }
            : {
                  background: "rgba(0,0,0,0.5)",
                  modalBg: "#ffffff",
                  color: "#000000",
                  border: "#ddd",
                  inputBg: "#f0f0f0",
                  labelColor: "#0066cc",
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
                    maxWidth: "500px",
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
                        marginBottom: "24px",
                    }}
                >
                    <h2 style={{margin: 0, color: themeStyles.color}}>Editor Settings</h2>
                    <FaRegWindowClose
                        onClick={onClose}
                        style={{cursor: "pointer", fontSize: "20px", color: themeStyles.color}}
                    />
                </div>

                {/* Settings Options */}
                <div style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                    {/* Font Size */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "8px",
                                color: themeStyles.labelColor,
                                fontWeight: "500",
                            }}
                        >
                            Font Size: {localSettings.fontSize}px
                        </label>
                        <input
                            type="range"
                            min="10"
                            max="24"
                            value={localSettings.fontSize}
                            onChange={(e) => handleChange("fontSize", parseInt(e.target.value))}
                            style={{width: "100%"}}
                        />
                    </div>

                    {/* Tab Size */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "8px",
                                color: themeStyles.labelColor,
                                fontWeight: "500",
                            }}
                        >
                            Tab Size
                        </label>
                        <select
                            value={localSettings.tabSize}
                            onChange={(e) => handleChange("tabSize", parseInt(e.target.value))}
                            style={{
                                width: "100%",
                                padding: "8px",
                                backgroundColor: themeStyles.inputBg,
                                color: themeStyles.color,
                                border: `1px solid ${themeStyles.border}`,
                                borderRadius: "4px",
                            }}
                        >
                            <option value={2}>2 spaces</option>
                            <option value={4}>4 spaces</option>
                            <option value={8}>8 spaces</option>
                        </select>
                    </div>

                    {/* Font Family */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "8px",
                                color: themeStyles.labelColor,
                                fontWeight: "500",
                            }}
                        >
                            Font Family
                        </label>
                        <select
                            value={localSettings.fontFamily}
                            onChange={(e) => handleChange("fontFamily", e.target.value)}
                            style={{
                                width: "100%",
                                padding: "8px",
                                backgroundColor: themeStyles.inputBg,
                                color: themeStyles.color,
                                border: `1px solid ${themeStyles.border}`,
                                borderRadius: "4px",
                            }}
                        >
                            <option value="'Fira Code', monospace">Fira Code</option>
                            <option value="'Consolas', monospace">Consolas</option>
                            <option value="'Monaco', monospace">Monaco</option>
                            <option value="'Source Code Pro', monospace">Source Code Pro</option>
                            <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                        </select>
                    </div>

                    {/* Line Height */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "8px",
                                color: themeStyles.labelColor,
                                fontWeight: "500",
                            }}
                        >
                            Line Height: {localSettings.lineHeight}
                        </label>
                        <input
                            type="range"
                            min="1.2"
                            max="2.0"
                            step="0.1"
                            value={localSettings.lineHeight}
                            onChange={(e) => handleChange("lineHeight", parseFloat(e.target.value))}
                            style={{width: "100%"}}
                        />
                    </div>

                    {/* Auto Save */}
                    <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                        <input
                            type="checkbox"
                            id="autoSave"
                            checked={localSettings.autoSave}
                            onChange={(e) => handleChange("autoSave", e.target.checked)}
                            style={{width: "18px", height: "18px", cursor: "pointer"}}
                        />
                        <label
                            htmlFor="autoSave"
                            style={{
                                color: themeStyles.color,
                                cursor: "pointer",
                                fontWeight: "500",
                            }}
                        >
                            Auto Save
                        </label>
                    </div>

                    {/* Line Numbers */}
                    <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                        <input
                            type="checkbox"
                            id="lineNumbers"
                            checked={localSettings.showLineNumbers}
                            onChange={(e) => handleChange("showLineNumbers", e.target.checked)}
                            style={{width: "18px", height: "18px", cursor: "pointer"}}
                        />
                        <label
                            htmlFor="lineNumbers"
                            style={{
                                color: themeStyles.color,
                                cursor: "pointer",
                                fontWeight: "500",
                            }}
                        >
                            Show Line Numbers
                        </label>
                    </div>

                    {/* Word Wrap */}
                    <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                        <input
                            type="checkbox"
                            id="wordWrap"
                            checked={localSettings.wordWrap}
                            onChange={(e) => handleChange("wordWrap", e.target.checked)}
                            style={{width: "18px", height: "18px", cursor: "pointer"}}
                        />
                        <label
                            htmlFor="wordWrap"
                            style={{
                                color: themeStyles.color,
                                cursor: "pointer",
                                fontWeight: "500",
                            }}
                        >
                            Word Wrap
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        marginTop: "24px",
                        paddingTop: "16px",
                        borderTop: `1px solid ${themeStyles.border}`,
                        color: theme === "dark" ? "#666" : "#999",
                        fontSize: "12px",
                    }}
                >
                    Settings are saved automatically
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
