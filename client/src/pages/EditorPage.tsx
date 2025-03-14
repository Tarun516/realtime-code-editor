import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  useParams,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import toast from "react-hot-toast";
import ACTIONS from "../constants/actions";
import { initSocket } from "../utils/socket";
import Editor from "../components/Editor";
import Client from "../components/Client";
import Terminal from "../components/Terminal";
import {
  Client as ClientType,
  LocationState,
  TerminalProps,
} from "../utils/types";
import { Socket } from "socket.io-client";

const EditorPage: React.FC = () => {
  // Define proper type for socketRef
  const socketRef = useRef<Socket | null>(null);
  const codeRef = useRef<string | null>(null);
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const locationState = location.state as LocationState;
  const navigate = useNavigate();

  const [clients, setClients] = useState<ClientType[]>([]);
  const [terminalMessages, setTerminalMessages] = useState<TerminalProps[]>([
    {
      message: `Connected to room: ${roomId}`,
      type: "info",
      timestamp: new Date(),
    },
  ]);

  // Function to add messages to terminal - wrapped in useCallback
  const addTerminalMessage = useCallback(
    (message: string, type: "info" | "success" | "error" | "command") => {
      setTerminalMessages((prev) => [
        ...prev,
        {
          message,
          type,
          timestamp: new Date(),
        },
      ]);
    },
    []
  );

  // Initialize socket connection
  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      if (!socketRef.current) {
        console.error("Failed to initialize socket");
        toast.error("Socket connection failed, try again later.");
        navigate("/");
        return;
      }

      // Handle socket connection errors
      socketRef.current.on("connect_error", handleErrors);
      socketRef.current.on("connect_failed", handleErrors);

      function handleErrors(e: Error) {
        console.log("socket error", e);
        addTerminalMessage(`Connection error: ${e.message}`, "error");
        toast.error("Socket connection failed, try again later.");
        navigate("/");
      }

      // Join the room
      if (locationState?.username && roomId) {
        addTerminalMessage(
          `Joining as ${locationState.username}...`,
          "command"
        );
        socketRef.current.emit(ACTIONS.JOIN, {
          roomId,
          username: locationState.username,
        });
      } else {
        addTerminalMessage("Missing username or room ID", "error");
        navigate("/");
        return;
      }

      // Listen for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({
          clients,
          username,
          socketId,
        }: {
          clients: ClientType[];
          username: string;
          socketId: string;
        }) => {
          if (username !== locationState?.username) {
            addTerminalMessage(`${username} joined the room`, "success");
            toast.success(`${username} joined the room`, {
              icon: "👋",
              style: {
                borderRadius: "10px",
                background: "#333",
                color: "#fff",
              },
            });
          } else {
            addTerminalMessage(`You joined as ${username}`, "success");
          }

          setClients(clients);

          // Sync code with new client
          if (socketRef.current) {
            socketRef.current.emit(ACTIONS.SYNC_CODE, {
              code: codeRef.current,
              socketId,
            });
          }
        }
      );

      // Listen for disconnected event
      socketRef.current.on(
        ACTIONS.DISCONNECTED,
        ({ socketId, username }: { socketId: string; username: string }) => {
          addTerminalMessage(`${username} left the room`, "info");
          toast.success(`${username} left the room`, {
            icon: "👋",
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          });

          setClients((prev) => {
            return prev.filter((client) => client.socketId !== socketId);
          });
        }
      );
    };

    init().catch((error) => {
      console.error("Failed to initialize socket connection:", error);
      toast.error("Socket connection failed, try again later.");
      navigate("/");
    });

    // Clean up function
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
        socketRef.current.off("connect_error");
        socketRef.current.off("connect_failed");
      }
    };
  }, [roomId, locationState?.username, navigate, addTerminalMessage]);

  // Function to copy room ID to clipboard
  const copyRoomId = async () => {
    if (!roomId) return;

    try {
      await navigator.clipboard.writeText(roomId);
      addTerminalMessage("Room ID copied to clipboard", "success");
      toast.success("Room ID copied to clipboard", {
        icon: "📋",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    } catch (err) {
      addTerminalMessage("Failed to copy Room ID", "error");
      toast.error("Failed to copy Room ID");
      console.error(err);
    }
  };

  // Function to leave the room
  const leaveRoom = () => {
    addTerminalMessage("Leaving room...", "command");
    navigate("/");
  };

  // If no username, redirect to home
  if (!locationState?.username) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 py-2 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gray-700 rounded-md p-1">
              <span className="font-mono text-gray-300 text-sm">{`</>`}</span>
            </div>
            <h1 className="text-gray-300 font-mono ml-2 text-sm">CodeSync</h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={copyRoomId}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs py-1 px-3 rounded border border-gray-600 transition-colors font-mono flex items-center"
            >
              <span>Copy Room ID</span>
            </button>

            <button
              onClick={leaveRoom}
              className="bg-red-900 hover:bg-red-800 text-gray-300 text-xs py-1 px-3 rounded border border-red-800 transition-colors font-mono"
            >
              Leave Room
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Connected Users */}
          <div className="p-4">
            <h2 className="text-gray-400 font-mono text-xs mb-3 border-b border-gray-700 pb-2">
              CONNECTED USERS
            </h2>
            <div className="flex flex-wrap gap-2">
              {clients.map((client) => (
                <Client key={client.socketId} username={client.username} />
              ))}
            </div>
          </div>

          {/* Terminal */}
          <div className="p-4 mt-auto">
            <h2 className="text-gray-400 font-mono text-xs mb-2 border-b border-gray-700 pb-2">
              TERMINAL
            </h2>
            <Terminal messages={terminalMessages} />
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden">
          <Editor
            socketRef={socketRef}
            roomId={roomId || ""}
            onCodeChange={(code) => {
              codeRef.current = code;
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
