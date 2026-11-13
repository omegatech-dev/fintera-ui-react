import { useMemo, useRef } from "react";
import Editor from "./Editor";
import Quill from "quill";

const Delta = Quill.import("delta");
const TOOLBAR_OPTIONS = [["bold", "italic", "underline"], ["image"]];

const MessageEditor = ({ onTextChange }) => {
  const defaultValue = useMemo(() => new Delta(), []);
  const quillRef = useRef();

  const handleTextChange = (..._args) => {
    if (onTextChange && quillRef.current) {
      const html = quillRef.current.root.innerHTML;
      onTextChange(html);
    }
  };

  return (
    <div>
      <Editor
        ref={quillRef}
        defaultValue={defaultValue}
        onTextChange={handleTextChange}
        toolbarOptions={TOOLBAR_OPTIONS}
        wrapperClass="quill-wrapper"
      />
    </div>
  );
};

export default MessageEditor;
