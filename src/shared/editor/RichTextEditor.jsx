import "quill/dist/quill.snow.css";
import Quill from "quill";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { countVisibleCharacters } from "../utils/sanitizeHtml";

const DEFAULT_TOOLBAR_OPTIONS = [
  [{ header: [2, 3, false] }],
  ["bold", "italic", "underline"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link"],
  ["clean"],
];

function setEditorHtml(quill, html) {
  if (!html) {
    quill.setContents([], "silent");
    return;
  }
  const delta = quill.clipboard.convert({ html });
  quill.setContents(delta, "silent");
}

function applyAccessibility(quill, { labelId, describedBy, invalid }) {
  const root = quill.root;
  root.setAttribute("role", "textbox");
  root.setAttribute("aria-multiline", "true");
  if (labelId) root.setAttribute("aria-labelledby", labelId);
  if (describedBy) root.setAttribute("aria-describedby", describedBy);
  root.setAttribute("aria-invalid", invalid ? "true" : "false");
}

function applyToolbarLabels(container, labels) {
  if (!labels) return;
  const entries = [
    [".ql-bold", labels.bold],
    [".ql-italic", labels.italic],
    [".ql-underline", labels.underline],
    [".ql-list[value='ordered']", labels.orderedList],
    [".ql-list[value='bullet']", labels.bulletList],
    [".ql-link", labels.link],
    [".ql-clean", labels.clean],
    [".ql-picker.ql-header .ql-picker-label", labels.heading],
  ];
  entries.forEach(([selector, label]) => {
    if (!label) return;
    container.querySelectorAll(selector).forEach((node) => {
      node.setAttribute("aria-label", label);
      node.setAttribute("title", label);
    });
  });
}

/**
 * Reusable Quill editor for admin-authored rich text. It emits sanitized HTML
 * on every change and enforces the character limit over visible text.
 */
function RichTextEditor(
  {
    id,
    value = "",
    onChange,
    labelId,
    describedBy,
    invalid = false,
    placeholder = "",
    maxLength,
    minHeight = 260,
    toolbarOptions = DEFAULT_TOOLBAR_OPTIONS,
    toolbarLabels,
    className = "",
  },
  ref
) {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const maxLengthRef = useRef(maxLength);
  const lastAcceptedRef = useRef("");

  useImperativeHandle(ref, () => ({
    getEditor: () => quillRef.current,
  }));

  useEffect(() => {
    onChangeRef.current = onChange;
    maxLengthRef.current = maxLength;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const editorContainer = container.ownerDocument.createElement("div");
    container.appendChild(editorContainer);
    const quill = new Quill(editorContainer, {
      theme: "snow",
      placeholder,
      modules: { toolbar: toolbarOptions },
    });
    quillRef.current = quill;

    setEditorHtml(quill, value);
    lastAcceptedRef.current = quill.getSemanticHTML();
    applyAccessibility(quill, { labelId, describedBy, invalid });
    applyToolbarLabels(container, toolbarLabels);

    quill.on(Quill.events.TEXT_CHANGE, () => {
      const html = quill.getSemanticHTML();
      const limit = maxLengthRef.current;
      if (limit && countVisibleCharacters(html) > limit) {
        setEditorHtml(quill, lastAcceptedRef.current);
        return;
      }
      lastAcceptedRef.current = html;
      onChangeRef.current?.(html);
    });

    return () => {
      quill.off(Quill.events.TEXT_CHANGE);
      quillRef.current = null;
      container.innerHTML = "";
    };
    // The editor instance is created once; prop updates are synced below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    const nextValue = value || "";
    if (nextValue === lastAcceptedRef.current) return;
    if (nextValue === quill.getSemanticHTML()) {
      lastAcceptedRef.current = nextValue;
      return;
    }
    setEditorHtml(quill, nextValue);
    lastAcceptedRef.current = quill.getSemanticHTML();
  }, [value]);

  useEffect(() => {
    if (quillRef.current) {
      applyAccessibility(quillRef.current, { labelId, describedBy, invalid });
    }
  }, [labelId, describedBy, invalid]);

  return (
    <div
      ref={containerRef}
      id={id}
      className={`rich-text-editor ${className}`.trim()}
      style={{ "--rich-text-min-height": `${minHeight}px` }}
    />
  );
}

export default forwardRef(RichTextEditor);
