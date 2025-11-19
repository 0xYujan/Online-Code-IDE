import React, {useState, useEffect} from "react";
import {LexicalAnalyzer} from "../utils/lexicalAnalyzer";
import {FaCode, FaTimes, FaChartBar, FaBug} from "react-icons/fa";

const CodeAnalysis = ({code, language, onClose}) => {
    const [analyzer] = useState(() => new LexicalAnalyzer());
    const [tokens, setTokens] = useState([]);
    const [stats, setStats] = useState(null);
    const [errors, setErrors] = useState([]);
    const [identifiers, setIdentifiers] = useState([]);
    const [activeTab, setActiveTab] = useState("stats");

    useEffect(() => {
        if (code) {
            const tokenList = analyzer.tokenize(code, language);
            const codeStats = analyzer.analyzeCode(code, language);
            const syntaxErrors = analyzer.findSyntaxErrors(code, language);
            const uniqueIdentifiers = analyzer.getIdentifiers(code, language);

            setTokens(tokenList);
            setStats(codeStats);
            setErrors(syntaxErrors);
            setIdentifiers(uniqueIdentifiers);
        }
    }, [code, language, analyzer]);

    const getTokenColor = (type) => {
        const colors = {
            KEYWORD: "text-purple-400",
            IDENTIFIER: "text-blue-400",
            OPERATOR: "text-yellow-400",
            NUMBER: "text-green-400",
            STRING: "text-orange-400",
            COMMENT: "text-gray-500",
            PUNCTUATION: "text-gray-300",
            HTML_TAG: "text-pink-400",
            CSS_PROPERTY: "text-cyan-400",
            WHITESPACE: "text-gray-600",
            UNKNOWN: "text-red-400",
        };
        return colors[type] || "text-white";
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#141414] rounded-lg w-[90vw] h-[85vh] flex flex-col border border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <FaCode className="text-blue-400 text-xl" />
                        <h2 className="text-xl font-semibold">Code Analysis - Lexical Tokenizer</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 px-4 pt-4 border-b border-gray-700">
                    <button
                        onClick={() => setActiveTab("stats")}
                        className={`pb-2 px-2 ${
                            activeTab === "stats" ? "border-b-2 border-blue-400 text-blue-400" : "text-gray-400"
                        }`}
                    >
                        <FaChartBar className="inline mr-2" />
                        Statistics
                    </button>
                    <button
                        onClick={() => setActiveTab("tokens")}
                        className={`pb-2 px-2 ${
                            activeTab === "tokens" ? "border-b-2 border-blue-400 text-blue-400" : "text-gray-400"
                        }`}
                    >
                        <FaCode className="inline mr-2" />
                        Tokens
                    </button>
                    <button
                        onClick={() => setActiveTab("errors")}
                        className={`pb-2 px-2 ${
                            activeTab === "errors" ? "border-b-2 border-blue-400 text-blue-400" : "text-gray-400"
                        }`}
                    >
                        <FaBug className="inline mr-2" />
                        Syntax Errors ({errors.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("identifiers")}
                        className={`pb-2 px-2 ${
                            activeTab === "identifiers" ? "border-b-2 border-blue-400 text-blue-400" : "text-gray-400"
                        }`}
                    >
                        Identifiers ({identifiers.length})
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {/* Statistics Tab */}
                    {activeTab === "stats" && stats && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#1A1A1A] p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3 text-blue-400">Code Metrics</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Total Tokens:</span>
                                        <span className="font-mono">{stats.totalTokens}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Lines:</span>
                                        <span className="font-mono">{stats.lines}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Characters:</span>
                                        <span className="font-mono">{stats.characters}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#1A1A1A] p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3 text-green-400">Token Statistics</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Keywords:</span>
                                        <span className="font-mono text-purple-400">{stats.keywords}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Identifiers:</span>
                                        <span className="font-mono text-blue-400">{stats.identifiers}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Operators:</span>
                                        <span className="font-mono text-yellow-400">{stats.operators}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Numbers:</span>
                                        <span className="font-mono text-green-400">{stats.numbers}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Strings:</span>
                                        <span className="font-mono text-orange-400">{stats.strings}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Comments:</span>
                                        <span className="font-mono text-gray-500">{stats.comments}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#1A1A1A] p-4 rounded-lg col-span-2">
                                <h3 className="text-lg font-semibold mb-3 text-yellow-400">Token Breakdown</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {Object.entries(stats.tokenBreakdown).map(([type, count]) => (
                                        <div key={type} className="bg-[#0D0C0C] p-3 rounded flex justify-between">
                                            <span className={`text-sm ${getTokenColor(type)}`}>{type}</span>
                                            <span className="font-mono text-sm">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tokens Tab */}
                    {activeTab === "tokens" && (
                        <div className="bg-[#1A1A1A] p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3">All Tokens</h3>
                            <div className="overflow-auto max-h-[60vh]">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-[#0D0C0C]">
                                        <tr>
                                            <th className="text-left p-2">Position</th>
                                            <th className="text-left p-2">Type</th>
                                            <th className="text-left p-2">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tokens.map((token, index) => (
                                            <tr key={index} className="border-b border-gray-800 hover:bg-[#0D0C0C]">
                                                <td className="p-2 font-mono text-gray-500">{token.position}</td>
                                                <td className={`p-2 ${getTokenColor(token.type)}`}>{token.type}</td>
                                                <td className="p-2 font-mono">
                                                    {token.type === "WHITESPACE"
                                                        ? `[${token.value.length} spaces]`
                                                        : token.value}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Errors Tab */}
                    {activeTab === "errors" && (
                        <div className="bg-[#1A1A1A] p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3 text-red-400">Syntax Errors ({errors.length})</h3>
                            {errors.length === 0 ? (
                                <div className="text-center py-8 text-green-400">
                                    <FaCode size={40} className="mx-auto mb-2" />
                                    <p className="text-xl font-semibold">No syntax errors found! 🎉</p>
                                    <p className="text-sm text-gray-400 mt-2">Your code looks good!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {errors.map((error, index) => (
                                        <div
                                            key={index}
                                            className="bg-red-900 bg-opacity-20 border-l-4 border-red-500 p-4 rounded"
                                        >
                                            <div className="flex items-start gap-3">
                                                <FaBug className="text-red-400 mt-1 text-xl" />
                                                <div className="flex-1">
                                                    <div className="font-semibold text-red-400 text-lg mb-1">
                                                        {error.type}
                                                    </div>
                                                    {error.line && (
                                                        <div className="text-sm text-yellow-300 mb-2 flex items-center gap-2">
                                                            <span className="bg-yellow-900 bg-opacity-30 px-2 py-1 rounded">
                                                                Line: {error.line}
                                                            </span>
                                                            {error.position && (
                                                                <span className="bg-yellow-900 bg-opacity-30 px-2 py-1 rounded">
                                                                    Position: {error.position}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {error.message && (
                                                        <div className="text-sm text-gray-300 mt-2 bg-black bg-opacity-30 p-2 rounded">
                                                            💡 {error.message}
                                                        </div>
                                                    )}
                                                    {error.count && (
                                                        <div className="text-xs text-gray-400 mt-2">
                                                            Count: {Math.abs(error.count)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-4 p-3 bg-blue-900 bg-opacity-20 border border-blue-500 rounded">
                                        <p className="text-sm text-blue-300">
                                            <strong>💡 Tip:</strong> Fix errors from top to bottom. Sometimes fixing one
                                            error will resolve others.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Identifiers Tab */}
                    {activeTab === "identifiers" && (
                        <div className="bg-[#1A1A1A] p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3 text-blue-400">
                                Unique Identifiers (Variables, Functions)
                            </h3>
                            <div className="grid grid-cols-4 gap-2">
                                {identifiers.map((identifier, index) => (
                                    <div
                                        key={index}
                                        className="bg-[#0D0C0C] p-2 rounded font-mono text-sm text-blue-400"
                                    >
                                        {identifier}
                                    </div>
                                ))}
                            </div>
                            {identifiers.length === 0 && (
                                <p className="text-gray-400 text-center py-4">No identifiers found</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CodeAnalysis;
