import React, { useMemo, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface FilePreviewProps {
  content: string;
  fileName?: string;
  regexPattern?: string;
  onMatchCountChange?: (count: number) => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  content,
  fileName = "",
  regexPattern,
  onMatchCountChange,
}) => {
  const language = useMemo(() => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "js":
      case "jsx":
        return "javascript";
      case "ts":
      case "tsx":
        return "typescript";
      case "css":
      case "less":
      case "scss":
        return "css";
      case "html":
        return "html";
      case "json":
        return "json";
      case "md":
        return "markdown";
      case "yml":
      case "yaml":
        return "yaml";
      case "py":
        return "python";
      case "go":
        return "go";
      case "java":
        return "java";
      default:
        return "text";
    }
  }, [fileName]);

  const { parts, matchCount } = useMemo(() => {
    if (!regexPattern || !content) {
      return { parts: null, matchCount: 0 };
    }

    try {
      let pattern = regexPattern;
      let flags = "g";
      const match = regexPattern.match(/^\/(.*?)\/([gimsuy]*)$/);
      if (match) {
        pattern = match[1];
        flags = match[2] || "g";
      }
      const regex = new RegExp(`(${pattern})`, flags);
      const matches = content.match(new RegExp(pattern, flags));
      const count = matches ? matches.length : 0;
      
      const splitParts = content.split(regex);
      return { parts: splitParts, matchCount: count };
    } catch (e) {
      return { parts: null, matchCount: 0 };
    }
  }, [content, regexPattern]);

  useEffect(() => {
    onMatchCountChange?.(matchCount);
  }, [matchCount, onMatchCountChange]);

  // If we have matches, show the highlighted text view
  if (parts && matchCount > 0) {
    return (
      <div
        style={{
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          color: "#d4d4d4",
          lineHeight: 1.5,
        }}
      >
        {parts.map((part, i) => {
          if (i % 2 === 1) {
            return (
              <span
                key={i}
                style={{ backgroundColor: "#ffaa00", color: "#000" }}
              >
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
    );
  }

  // Otherwise show syntax highlighting
  return (
    <SyntaxHighlighter
      language={language}
      style={vscDarkPlus}
      customStyle={{
        margin: 0,
        padding: 0,
        backgroundColor: "transparent",
        fontSize: "13px",
      }}
      wrapLongLines
    >
      {content || ""}
    </SyntaxHighlighter>
  );
};

export default FilePreview;
