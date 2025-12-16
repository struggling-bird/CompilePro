import React, { useMemo, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface FilePreviewProps {
  content: string;
  fileName?: string;
  regexPattern?: string;
  matchIndex?: number;
  onMatchCountChange?: (count: number) => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  content,
  fileName = "",
  regexPattern,
  matchIndex = 0,
  onMatchCountChange,
}) => {
  const language = useMemo(() => {
    // ... existing language detection logic
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

  const { matchCount } = useMemo(() => {
    if (!regexPattern || !content) {
      return { matchCount: 0 };
    }

    try {
      let pattern = regexPattern;
      let flags = "g";
      const match = regexPattern.match(/^\/(.*?)\/([gimsuy]*)$/);
      if (match) {
        pattern = match[1];
        flags = match[2] || "g";
      }
      const matches = content.match(new RegExp(pattern, flags));
      const count = matches ? matches.length : 0;
      return { matchCount: count };
    } catch (e) {
      return { matchCount: 0 };
    }
  }, [content, regexPattern]);

  useEffect(() => {
    onMatchCountChange?.(matchCount);
  }, [matchCount, onMatchCountChange]);

  // Use a ref to track global match index across tokens
  const globalMatchCounter = React.useRef(0);

  // Reset counter before each render pass
  globalMatchCounter.current = 0;

  const renderNode = (
    node: any,
    key: string | number,
    stylesheet?: any
  ): React.ReactNode => {
    if (node.type === "text") {
      const text = node.value;
      if (!text) return null;
      if (!regexPattern) return text;

      try {
        let pattern = regexPattern;
        let flags = "g";
        const match = regexPattern.match(/^\/(.*?)\/([gimsuy]*)$/);
        if (match) {
          pattern = match[1];
          flags = match[2] || "g";
        }
        const regex = new RegExp(`(${pattern})`, flags);
        const parts = text.split(regex);

        if (parts.length === 1) return text;

        return parts.map((part: string, k: number) => {
          if (k % 2 === 1) {
            const currentMatchIdx = globalMatchCounter.current;
            globalMatchCounter.current += 1;
            
            const isSelected = currentMatchIdx === matchIndex;
            return (
              <span
                key={`${key}-${k}`}
                style={{ 
                    backgroundColor: isSelected ? "#ffaa00" : "#ffe58f", // Distinct highlight for selected vs others
                    color: "#000",
                    border: isSelected ? "2px solid #d46b08" : "none",
                    fontWeight: isSelected ? "bold" : "normal"
                }}
              >
                {part}
              </span>
            );
          }
          return part;
        });
      } catch (e) {
        return text;
      }
    }

    if (node.type === "element") {
      const { tagName, properties, children } = node;
      let style = properties?.style;
      const className = properties?.className;
      const Tag = tagName as any;

      if (
        (!style || Object.keys(style).length === 0) &&
        className &&
        stylesheet
      ) {
        style = className.reduce((acc: any, cls: string) => {
          return { ...acc, ...(stylesheet[cls] || {}) };
        }, {});
      }

      return (
        <Tag
          key={key}
          style={style}
          className={className ? className.join(" ") : undefined}
        >
          {children.map((child: any, i: number) =>
            renderNode(child, i, stylesheet)
          )}
        </Tag>
      );
    }
    return null;
  };

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
      renderer={
        regexPattern
          ? ({ rows, stylesheet }) => {
              // Reset counter at start of render
              globalMatchCounter.current = 0;
              return rows.map((row: any, i: number) => {
                return (
                  <div key={i} style={row.properties?.style}>
                    {row.children.map((child: any, j: number) =>
                      renderNode(child, j, stylesheet)
                    )}
                  </div>
                );
              });
            }
          : undefined
      }
    >
      {content || ""}
    </SyntaxHighlighter>
  );
};

export default FilePreview;
