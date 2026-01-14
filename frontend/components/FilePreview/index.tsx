import React, { useMemo, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface FilePreviewProps {
  content: string;
  fileName?: string;
  regexPattern?: string;
  matchIndex?: number;
  groupIndex?: number;
  onMatchCountChange?: (count: number) => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  content,
  fileName = "",
  regexPattern,
  matchIndex = 0,
  groupIndex = 0,
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
  }, [fileName, regexPattern]);

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

  const renderHighlightedRow = (
    row: any,
    i: number,
    stylesheet?: any
  ): React.ReactNode => {
    // Reconstruct the full text of the line from the row's children
    // In "text" mode, children are typically simple text nodes, but we aggregate just in case.
    const lineText = row.children
      .map((child: any) => {
        if (child.type === "text") return child.value;
        if (child.children && child.children[0] && child.children[0].value)
          return child.children[0].value;
        return "";
      })
      .join("");

    if (!regexPattern || !lineText) {
      return (
        <div key={i} style={row.properties?.style}>
          {lineText}
        </div>
      );
    }

    try {
      let pattern = regexPattern;
      let flags = "g";
      const match = regexPattern.match(/^\/(.*?)\/([gimsuy]*)$/);
      if (match) {
        pattern = match[1];
        flags = match[2] || "g";
      }

      let hasIndices = false;
      try {
        if (groupIndex > 0) {
          new RegExp(pattern, flags + "d");
          flags += "d";
          hasIndices = true;
        }
      } catch (e) {
        // 'd' flag not supported
      }

      const regex = new RegExp(pattern, flags);
      const matches = [...lineText.matchAll(regex)];

      if (matches.length === 0) {
        return (
          <div key={i} style={row.properties?.style}>
            {lineText}
          </div>
        );
      }

      const nodes: React.ReactNode[] = [];
      let lastIndex = 0;

      matches.forEach((m, idx) => {
        const matchIndexInFile = globalMatchCounter.current;
        globalMatchCounter.current++;

        // Text before match
        if (m.index! > lastIndex) {
          nodes.push(
            <span key={`${i}-${idx}-pre-text`}>
              {lineText.slice(lastIndex, m.index)}
            </span>
          );
        }

        const isSelectedMatch = matchIndexInFile === matchIndex;
        const matchStr = m[0];
        const matchStart = m.index!;
        const matchEnd = matchStart + matchStr.length;

        // Highlight logic
        if (
          isSelectedMatch &&
          groupIndex > 0 &&
          hasIndices &&
          (m as any).indices &&
          (m as any).indices[groupIndex]
        ) {
          const indices = (m as any).indices;
          const [gStart, gEnd] = indices[groupIndex];

          // Indices are relative to the original lineText
          // Pre-group (inside match)
          if (gStart > matchStart) {
            nodes.push(
              <span
                key={`${i}-${idx}-g-pre`}
                style={{ backgroundColor: "#ffe58f", color: "#000" }}
              >
                {lineText.slice(matchStart, gStart)}
              </span>
            );
          }

          // The Group (Target)
          nodes.push(
            <span
              key={`${i}-${idx}-g-target`}
              style={{
                backgroundColor: "#ffaa00",
                color: "#000",
                border: "2px solid #d46b08",
                fontWeight: "bold",
              }}
            >
              {lineText.slice(gStart, gEnd)}
            </span>
          );

          // Post-group (inside match)
          if (gEnd < matchEnd) {
            nodes.push(
              <span
                key={`${i}-${idx}-g-post`}
                style={{ backgroundColor: "#ffe58f", color: "#000" }}
              >
                {lineText.slice(gEnd, matchEnd)}
              </span>
            );
          }
        } else {
          // Standard Highlight
          const style = isSelectedMatch
            ? {
                backgroundColor: "#ffaa00",
                color: "#000",
                border: "2px solid #d46b08",
                fontWeight: "bold",
              }
            : {
                backgroundColor: "#ffe58f",
                color: "#000",
                border: "none",
                fontWeight: "normal",
              };

          nodes.push(
            <span key={`${i}-${idx}-match`} style={style}>
              {matchStr}
            </span>
          );
        }

        lastIndex = matchEnd;
      });

      if (lastIndex < lineText.length) {
        nodes.push(
          <span key={`${i}-last`}>{lineText.slice(lastIndex)}</span>
        );
      }

      return (
        <div key={i} style={row.properties?.style}>
          {nodes}
        </div>
      );
    } catch (e) {
      return (
        <div key={i} style={row.properties?.style}>
          {lineText}
        </div>
      );
    }
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
              return rows.map((row: any, i: number) =>
                renderHighlightedRow(row, i, stylesheet)
              );
            }
          : undefined
      }
    >
      {content || ""}
    </SyntaxHighlighter>
  );
};


export default FilePreview;
