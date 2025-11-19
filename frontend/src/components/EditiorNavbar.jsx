import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import PropTypes from "prop-types";
import {FaHome, FaShare, FaCopy, FaCheck} from "react-icons/fa";

const EditiorNavbar = ({clients, projectName, projectID}) => {
    const navigate = useNavigate();
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [copied, setCopied] = useState(false);

    // Redirect to the home page
    const handleLogoClick = () => {
        navigate("/");
    };

    // Copy project ID to clipboard
    const handleCopyCode = () => {
        navigator.clipboard.writeText(projectID);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="EditiorNavbar flex items-center justify-between bg-[#1A1A1A] text-white px-4 py-2">
            {/* Logo and Project Name */}
            <div className="flex items-center gap-4">
                <div className="cursor-pointer flex items-center gap-2" onClick={handleLogoClick}>
                    <FaHome size={20} className="text-yellow-400" />
                    <p>
                        File / <span className="text-gray-400">{projectName}</span>
                    </p>
                </div>
            </div>

            {/* Invite Button */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setShowInviteModal(!showInviteModal)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
                >
                    <FaShare size={14} />
                    Invite
                </button>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setShowInviteModal(false)}
                >
                    <div
                        className="bg-[#1E1E1E] p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold mb-4">Invite to Collaborate</h2>
                        <p className="text-gray-400 mb-4">Share this room code with your friend to collaborate:</p>

                        <div className="bg-[#2D2D2D] p-3 rounded flex items-center justify-between mb-4">
                            <code className="text-blue-400 break-all">{projectID}</code>
                            <button
                                onClick={handleCopyCode}
                                className="ml-2 p-2 hover:bg-[#3D3D3D] rounded transition-colors"
                                title="Copy to clipboard"
                            >
                                {copied ? <FaCheck className="text-green-400" /> : <FaCopy className="text-gray-400" />}
                            </button>
                        </div>

                        {copied && <p className="text-green-400 text-sm mb-4">✓ Room code copied to clipboard!</p>}

                        <p className="text-sm text-gray-500 mb-4">
                            Your friend can join by entering this code when creating/joining a project.
                        </p>

                        <button
                            onClick={() => setShowInviteModal(false)}
                            className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

EditiorNavbar.propTypes = {
    clients: PropTypes.array.isRequired,
    projectName: PropTypes.string.isRequired,
    projectID: PropTypes.string.isRequired,
};

export default EditiorNavbar;
