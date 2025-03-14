import React from "react";

export interface Client {
  socketId: string;
  username: string;
}

export interface LocationState {
  username: string;
}

export interface EditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socketRef: React.MutableRefObject<any>;
  roomId: string;
  onCodeChange: (code: string) => void;
}

export interface ClientProps {
  username: string;
}

export interface TerminalProps {
  message: string;
  type: "info" | "success" | "error" | "command";
  timestamp: Date;
}
