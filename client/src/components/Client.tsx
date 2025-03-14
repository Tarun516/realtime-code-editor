import React from "react";
import { ClientProps } from "../utils/types";

const Client: React.FC<ClientProps> = ({ username }) => {
  const generateColor = (name: string): string => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - c.length) + c;
  };

  const userColor = generateColor(username);
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col items-center mb-4 transition-all duration:300 hover:scale-105 ">
      <div
        className="w-12 h-12 rounded-md flex items-center justify-center text-white font-bold text-sm mb-2"
        style={{ backgroundColor: userColor }}
      >
        {initials}
      </div>
      <span className="text-xs text-gray-300 font-mono">{username}</span>
    </div>
  );
};

export default Client;
