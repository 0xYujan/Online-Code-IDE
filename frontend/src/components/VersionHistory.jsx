import React, {useState, useEffect} from "react";
import {api_base_url} from "../helper";
import {FaHistory, FaTimes, FaChevronDown, FaChevronUp, FaCode} from "react-icons/fa";

const VersionHistory = ({projectID, onClose}) => {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedVersion, setExpandedVersion] = useState(null);

    const fetchVersionHistory = () => {
        fetch(`${api_base_url}/getVersionHistory`, {
            mode: "cors",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                projId: projectID,
            }),
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                setVersions(data.versionHistory.reverse()); // Show newest first
            }
            setLoading(false);
        })
        .catch((err) => {
            console.error("Error fetching version history:", err);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchVersionHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectID]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const toggleExpand = (index) => {
        setExpandedVersion(expandedVersion === index ? null : index);
    };

    const getCodeDiff = (currentCode, previousCode) => {
        if (!previousCode) {
            return {type: "added", lines: currentCode ? currentCode.split("\n").length : 0, preview: currentCode};
        }

        const currentLines = (currentCode || "").split("\n");
        const previousLines = (previousCode || "").split("\n");

        let addedLines = 0;
        let removedLines = 0;
        let changedContent = [];

        // Simple diff logic
        const maxLength = Math.max(currentLines.length, previousLines.length);

        for (let i = 0; i < maxLength; i++) {
            const currentLine = currentLines[i];
            const previousLine = previousLines[i];

            if (currentLine !== previousLine) {
                if (currentLine !== undefined && previousLine !== undefined) {
                    // Line changed
                    changedContent.push({type: "removed", line: previousLine, lineNum: i + 1});
                    changedContent.push({type: "added", line: currentLine, lineNum: i + 1});
                } else if (currentLine !== undefined) {
                    // Line added
                    addedLines++;
                    changedContent.push({type: "added", line: currentLine, lineNum: i + 1});
                } else {
                    // Line removed
                    removedLines++;
                    changedContent.push({type: "removed", line: previousLine, lineNum: i + 1});
                }
            }
        }

        return {
            addedLines,
            removedLines,
            changedContent: changedContent.slice(0, 50), // Limit to first 50 changes
            totalChanges: changedContent.length,
        };
    };

    const renderCodeDiff = (currentCode, previousCode, language) => {
        const diff = getCodeDiff(currentCode, previousCode);

        if (!diff.changedContent || diff.changedContent.length === 0) {
            return (
                <div className="mt-2 bg-[#0D0C0C] rounded p-3">
                    <p className="text-xs text-gray-400">No changes detected</p>
                </div>
            );
        }

        return (
            <div className="mt-2 bg-[#0D0C0C] rounded p-3 overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <FaCode className="text-blue-400" />
                        <span className="text-xs text-gray-400 uppercase">{language}</span>
                    </div>
                    <div className="flex gap-3 text-xs">
                        {diff.addedLines > 0 && <span className="text-green-400">+{diff.addedLines} lines</span>}
                        {diff.removedLines > 0 && <span className="text-red-400">-{diff.removedLines} lines</span>}
                    </div>
                </div>
                <div className="text-xs">
                    {diff.changedContent.map((change, idx) => (
                        <div
                            key={idx}
                            className={`py-1 px-2 font-mono ${
                                change.type === "added"
                                    ? "bg-green-900 bg-opacity-30 text-green-300"
                                    : "bg-red-900 bg-opacity-30 text-red-300"
                            }`}
                        >
                            <span className="text-gray-500 mr-3">{change.lineNum}</span>
                            <span className="mr-2">{change.type === "added" ? "+" : "-"}</span>
                            <span>{change.line}</span>
                        </div>
                    ))}
                    {diff.totalChanges > 50 && (
                        <p className="text-gray-400 mt-2">... and {diff.totalChanges - 50} more changes</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#141414] rounded-lg w-[90vw] h-[85vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <FaHistory className="text-blue-400 text-xl" />
                        <h2 className="text-xl font-semibold">Version History - Code Changes</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <p className="text-center text-gray-400">Loading version history...</p>
                    ) : versions.length === 0 ? (
                        <p className="text-center text-gray-400">No version history yet</p>
                    ) : (
                        <div className="space-y-3">
                            {versions.map((version, index) => {
                                const previousVersion = versions[index + 1];

                                return (
                                    <div
                                        key={index}
                                        className="bg-[#1A1A1A] rounded-lg border border-gray-700 hover:border-blue-500 transition"
                                    >
                                        <div className="p-4 cursor-pointer" onClick={() => toggleExpand(index)}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-blue-400 font-semibold text-lg">
                                                        {version.username || "Unknown User"}
                                                    </span>
                                                    <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                                                        {version.changeType}
                                                    </span>
                                                    {index === 0 && (
                                                        <span className="text-xs bg-green-600 px-2 py-1 rounded">
                                                            Latest
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-gray-400">
                                                        {formatDate(version.timestamp)}
                                                    </span>
                                                    {expandedVersion === index ? (
                                                        <FaChevronUp className="text-gray-400" />
                                                    ) : (
                                                        <FaChevronDown className="text-gray-400" />
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-300">{version.description}</p>
                                        </div>

                                        {expandedVersion === index && (
                                            <div className="px-4 pb-4 border-t border-gray-700 pt-4">
                                                <h3 className="text-md font-semibold mb-3 text-yellow-400">
                                                    Code Differences (What Changed):
                                                </h3>

                                                {(version.changeType === "all" || version.changeType === "html") && (
                                                    <div className="mb-4">
                                                        <h4 className="text-sm font-semibold text-orange-400 mb-2">
                                                            HTML Changes:
                                                        </h4>
                                                        {renderCodeDiff(
                                                            version.htmlCode,
                                                            previousVersion?.htmlCode,
                                                            "html"
                                                        )}
                                                    </div>
                                                )}

                                                {(version.changeType === "all" || version.changeType === "css") && (
                                                    <div className="mb-4">
                                                        <h4 className="text-sm font-semibold text-blue-400 mb-2">
                                                            CSS Changes:
                                                        </h4>
                                                        {renderCodeDiff(
                                                            version.cssCode,
                                                            previousVersion?.cssCode,
                                                            "css"
                                                        )}
                                                    </div>
                                                )}

                                                {(version.changeType === "all" || version.changeType === "js") && (
                                                    <div className="mb-4">
                                                        <h4 className="text-sm font-semibold text-yellow-300 mb-2">
                                                            JavaScript Changes:
                                                        </h4>
                                                        {renderCodeDiff(
                                                            version.jsCode,
                                                            previousVersion?.jsCode,
                                                            "javascript"
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-700">
                    <button onClick={onClose} className="btnBlue w-full">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VersionHistory;
