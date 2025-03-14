import React, { useEffect, useRef } from "react";
import { TerminalProps } from "../utils/types";

interface TerminalMessageProps {
  message: TerminalProps;
}

const TerminalMessage: React.FC<TerminalMessageProps> = ({ message }) => {
  const { type, message: content, timestamp } = message;

  const getPrefix = () => {
    switch (type) {
      case "info":
        return "→ INFO:";
      case "success":
        return "✓ SUCCESS:";
      case "error":
        return "✗ ERROR:";
      case "command":
        return "$ ";
      default:
        return ">";
    }
  };

  const getTextColorClass = () => {
    switch (type) {
      case "info":
        return "text-blue-400";
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "command":
        return "text-yellow-400";
      default:
        return "text-gray-300";
    }
  };

  const formatTime = (date: Date) => {
    return date.toTimeString().split(" ")[0];
  };

  return (
    <div className="font-mono text-sm py-1 flex animate-fadeIn">
      <span className="text-gray-500 text-xs mr-2">
        [{formatTime(timestamp)}]
      </span>
      <span className={`${getTextColorClass()} mr-2`}>{getPrefix()}</span>
      <span className="text-gray-300 break-all">{content}</span>
    </div>
  );
};

const Terminal: React.FC<{ messages: TerminalProps[] }> = ({ messages }) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className="bg-gray-900 border border-gray-700 rounded-md p-3 h-40 overflow-y-auto"
      ref={terminalRef}
    >
      {messages.map((msg, index) => (
        <TerminalMessage key={index} message={msg} />
      ))}
      {/* Blinking cursor at the end */}
      <div className="flex items-center font-mono text-gray-300 text-sm">
        <span className="text-gray-500 text-xs mr-2">
          [{new Date().toTimeString().split(" ")[0]}]
        </span>
        <span className="text-green-400 mr-2">$</span>
        <span className="w-2 h-4 bg-gray-300 animate-pulse"></span>
      </div>
    </div>
  );
};

export default Terminal;
