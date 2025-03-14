import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Terminal from "../components/Terminal";
import { TerminalProps } from "../utils/types";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [terminalMessages, setTerminalMessages] = useState<TerminalProps[]>([
    {
      message: "Welcome to CodeSync Terminal",
      type: "info",
      timestamp: new Date(),
    },
    {
      message: "Create a new room or join an existing one",
      type: "info",
      timestamp: new Date(),
    },
  ]);

  const usernameInputRef = useRef<HTMLInputElement>(null);

  // Focus on username input on mount
  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, []);

  // Function to add messages to terminal
  const addTerminalMessage = (
    message: string,
    type: "info" | "success" | "error" | "command"
  ) => {
    setTerminalMessages((prev) => [
      ...prev,
      {
        message,
        type,
        timestamp: new Date(),
      },
    ]);
  };

  // Function to create a new room
  const createNewRoom = (e: React.MouseEvent) => {
    e.preventDefault();
    const id = uuidv4();
    setRoomId(id);
    addTerminalMessage(`Created new room with ID: ${id}`, "success");
    toast.success("Created a new room", {
      icon: "🚀",
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });
  };

  // Function to join a room
  const joinRoom = () => {
    if (!roomId) {
      addTerminalMessage("Room ID is required", "error");
      toast.error("Room ID is required");
      return;
    }

    if (!username) {
      addTerminalMessage("Username is required", "error");
      toast.error("Username is required");
      return;
    }

    // Simulate loading
    setIsLoading(true);
    addTerminalMessage(`Connecting to room: ${roomId}...`, "command");

    // Simulate network delay for better UX
    setTimeout(() => {
      setIsLoading(false);
      addTerminalMessage(`Joined room: ${roomId} as ${username}`, "success");

      // Navigate to editor page
      navigate(`/editor/${roomId}`, {
        state: {
          username,
        },
      });
    }, 1000);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="bg-gray-700 rounded-full w-3 h-3 mr-2"></div>
            <div className="bg-yellow-500 rounded-full w-3 h-3 mr-2"></div>
            <div className="bg-green-500 rounded-full w-3 h-3 mr-2"></div>
            <div className="flex-1 text-center">
              <h2 className="text-gray-300 font-mono text-sm">
                CodeSync Terminal
              </h2>
            </div>
          </div>

          {/* Terminal Output */}
          <Terminal messages={terminalMessages} />

          {/* Form Inputs */}
          <div className="mt-4 space-y-3">
            <div className="relative">
              <label className="block text-gray-400 text-xs mb-1 font-mono">
                USERNAME
              </label>
              <input
                type="text"
                ref={usernameInputRef}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm transition-all"
                placeholder="Enter username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>

            <div className="relative">
              <label className="block text-gray-400 text-xs mb-1 font-mono">
                ROOM ID
              </label>
              <input
                type="text"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm transition-all"
                placeholder="Enter room ID..."
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 mt-5">
              <button
                className={`flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-mono text-sm ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                onClick={joinRoom}
                disabled={isLoading}
              >
                {isLoading ? "Connecting..." : "Join Room"}
              </button>

              <button
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded border border-gray-600 transition-colors font-mono text-sm"
                onClick={createNewRoom}
              >
                New Room
              </button>
            </div>

            {/* Help text */}
            <p className="text-gray-500 text-xs mt-4 font-mono text-center">
              Create a new room or enter an existing room ID to collaborate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
