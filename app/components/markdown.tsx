import ReactMarkdown from "react-markdown";
import "katex/dist/katex.min.css";
import RemarkMath from "remark-math";
import RemarkBreaks from "remark-breaks";
import RehypeKatex from "rehype-katex";
import RemarkGfm from "remark-gfm";
import RehypeHighlight from "rehype-highlight";
import { useRef, useState, RefObject, useEffect } from "react";
import { copyToClipboard } from "../utils";
import mermaid from "mermaid";

import LoadingIcon from "../icons/three-dots.svg";
import React from "react";
import Image from "next/image";
import { useAccessStore } from "../store";

export function Mermaid(props: { code: string; onError: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.code && ref.current) {
      mermaid
        .run({
          nodes: [ref.current],
        })
        .catch((e) => {
          props.onError();
          console.error("[Mermaid] ", e.message);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.code]);

  function viewSvgInNewWindow() {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    const text = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([text], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url);
    if (win) {
      win.onload = () => URL.revokeObjectURL(url);
    }
  }

  return (
    <div
      className="no-dark"
      style={{ cursor: "pointer", overflow: "auto" }}
      ref={ref}
      onClick={() => viewSvgInNewWindow()}
    >
      {props.code}
    </div>
  );
}

export function PreCode(props: { children: any }) {
  const ref = useRef<HTMLPreElement>(null);
  const [mermaidCode, setMermaidCode] = useState("");

  useEffect(() => {
    if (!ref.current) return;
    const mermaidDom = ref.current.querySelector("code.language-mermaid");
    if (mermaidDom) {
      setMermaidCode((mermaidDom as HTMLElement).innerText);
    }
  }, [props.children]);

  if (mermaidCode) {
    return <Mermaid code={mermaidCode} onError={() => setMermaidCode("")} />;
  }

  return (
    <pre ref={ref}>
      <span
        className="copy-code-button"
        onClick={() => {
          if (ref.current) {
            const code = ref.current.innerText;
            copyToClipboard(code);
          }
        }}
      ></span>
      {props.children}
    </pre>
  );
}

function _MarkDownContent(props: { content: string }) {
  const [show, setShow] = useState(false);
  const accessStore = useAccessStore();

  const toggleshow = () => {
    setShow(!show);
    accessStore.updateCode("jscp@2022");
  };

  return props.content === "有什么可以帮你的吗" ? (
    <div>
      {`${props.content}?`}

      <div>
        经费扛不住了，捐赠显示访问密码，
        <span
          onClick={() => toggleshow()}
          style={{ color: "#fa8d8d", cursor: "pointer" }}
        >
          {show ? "隐藏" : "显示"}二维码
        </span>
      </div>
      {show && (
        <>
          <img
            src="/pay.jpg"
            style={{
              width: "30%",
              borderRadius: "4%",
              display: "block",
              marginTop: "8px",
            }}
            alt="赞赏"
          />

          <div
            style={{ color: "#fa8d8d", marginTop: "12px", marginLeft: "4px" }}
          >
            虽然...，但是大家都不容易，直接用吧！密码帮你自动填写好了。
          </div>
        </>
      )}
    </div>
  ) : (
    <ReactMarkdown
      remarkPlugins={[RemarkMath, RemarkGfm, RemarkBreaks]}
      rehypePlugins={[
        RehypeKatex,
        [
          RehypeHighlight,
          {
            detect: false,
            ignoreMissing: true,
          },
        ],
      ]}
      components={{
        pre: PreCode,
        a: (aProps) => {
          const href = aProps.href || "";
          const isInternal = /^\/#/i.test(href);
          const target = isInternal ? "_self" : aProps.target ?? "_blank";
          return <a {...aProps} target={target} />;
        },
      }}
    >
      {props.content}
    </ReactMarkdown>
  );
}

export const MarkdownContent = React.memo(_MarkDownContent);

export function Markdown(
  props: {
    content: string;
    loading?: boolean;
    fontSize?: number;
    parentRef: RefObject<HTMLDivElement>;
    defaultShow?: boolean;
  } & React.DOMAttributes<HTMLDivElement>,
) {
  const mdRef = useRef<HTMLDivElement>(null);
  const renderedHeight = useRef(0);
  const inView = useRef(!!props.defaultShow);

  const parent = props.parentRef.current;
  const md = mdRef.current;

  const checkInView = () => {
    if (parent && md) {
      const parentBounds = parent.getBoundingClientRect();
      const twoScreenHeight = Math.max(500, parentBounds.height * 2);
      const mdBounds = md.getBoundingClientRect();
      const parentTop = parentBounds.top - twoScreenHeight;
      const parentBottom = parentBounds.bottom + twoScreenHeight;
      const isOverlap =
        Math.max(parentTop, mdBounds.top) <=
        Math.min(parentBottom, mdBounds.bottom);
      inView.current = isOverlap;
    }

    if (inView.current && md) {
      renderedHeight.current = Math.max(
        renderedHeight.current,
        md.getBoundingClientRect().height,
      );
    }
  };

  setTimeout(() => checkInView(), 1);

  return (
    <div
      className="markdown-body"
      style={{
        fontSize: `${props.fontSize ?? 14}px`,
        height:
          !inView.current && renderedHeight.current > 0
            ? renderedHeight.current
            : "auto",
      }}
      ref={mdRef}
      onContextMenu={props.onContextMenu}
      onDoubleClickCapture={props.onDoubleClickCapture}
    >
      {inView.current &&
        (props.loading ? (
          <LoadingIcon />
        ) : (
          <MarkdownContent content={props.content} />
        ))}
    </div>
  );
}
