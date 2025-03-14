import React, { useEffect, useRef } from "react";
import { EditorState, Extension } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { indentOnInput } from "@codemirror/language";
import { bracketMatching } from "@codemirror/language";
import { highlightSelectionMatches } from "@codemirror/search";
import ACTIONS from "../constants/actions";
import { EditorProps } from "../utils/types";

const Editor: React.FC<EditorProps> = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Define editor extensions
    const extensions: Extension[] = [
      lineNumbers(),
      history(),
      javascript(),
      bracketMatching(),
      highlightActiveLine(),
      indentOnInput(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      keymap.of([...defaultKeymap, ...historyKeymap] as any),
      highlightSelectionMatches(),
      EditorView.theme({
        "&": {
          backgroundColor: "#282c34",
          color: "#abb2bf",
        },
        ".cm-content": {
          caretColor: "#528bff",
        },
        "&.cm-focused .cm-cursor": {
          borderLeftColor: "#528bff",
        },
        "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
          {
            backgroundColor: "#3E4451",
          },
        ".cm-gutters": {
          backgroundColor: "#282c34",
          color: "#676f7d",
          border: "none",
        },
      }),
      EditorView.updateListener.of((update) => {
        if (update.changes) {
          const doc = update.state.doc;
          const code = doc.toString();
          onCodeChange(code);
          // Emit code change to other clients through socket
          if (socketRef.current) {
            socketRef.current.emit(ACTIONS.CODE_CHANGE, {
              roomId,
              code,
            });
          }
        }
      }),
    ];

    // Create the editor state
    const startState = EditorState.create({
      doc: "",
      extensions,
    });

    // Create and attach the editor view
    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    // Cleanup function
    return () => {
      view.destroy();
    };
  }, [roomId, onCodeChange, socketRef]); // Added missing dependencies

  // Listen for code changes from other clients
  useEffect(() => {
    if (!socketRef.current || !viewRef.current) return;

    // Store the current socket reference to use in cleanup
    const socket = socketRef.current;

    const handleCodeChange = ({ code }: { code: string }) => {
      if (code !== null && viewRef.current) {
        const currentCode = viewRef.current.state.doc.toString();

        // Only update if the code is different to avoid loops
        if (code !== currentCode) {
          viewRef.current.dispatch({
            changes: { from: 0, to: currentCode.length, insert: code },
          });
        }
      }
    };

    // Register socket listener
    socket.on(ACTIONS.CODE_CHANGE, handleCodeChange);

    // Cleanup
    return () => {
      socket.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef, roomId]); // Added roomId as dependency

  return (
    <div
      className="editor-container"
      ref={editorRef}
      style={{
        height: "100%",
        width: "100%",
        fontSize: "16px",
        fontFamily: "monospace",
        overflowY: "auto",
      }}
    />
  );
};

export default Editor;
