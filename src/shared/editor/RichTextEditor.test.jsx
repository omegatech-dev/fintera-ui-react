import { createRef } from "react";
import { render, screen, cleanup, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import RichTextEditor from "./RichTextEditor";

expect.extend(matchers);
afterEach(cleanup);

const LABEL = "branding.legal.termsContentEs";

function EditorHarness({ editorRef, ...props }) {
  return (
    <div>
      <span id="terms-label">{LABEL}</span>
      <RichTextEditor
        ref={editorRef}
        labelId="terms-label"
        describedBy="terms-help terms-count"
        placeholder="Write terms"
        {...props}
      />
    </div>
  );
}

describe("RichTextEditor", () => {
  it("loads the saved HTML and exposes an accessible textbox", () => {
    const editorRef = createRef();
    const onChange = vi.fn();

    render(
      <EditorHarness
        editorRef={editorRef}
        value="<h2>Title</h2><p>Hello <strong>world</strong></p>"
        onChange={onChange}
      />
    );

    const textbox = screen.getByRole("textbox", { name: LABEL });
    expect(textbox).toHaveAttribute("aria-describedby", "terms-help terms-count");
    expect(textbox).toHaveAttribute("aria-multiline", "true");
    expect(editorRef.current.getEditor().getSemanticHTML()).toContain(
      "<strong>world</strong>"
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it("emits semantic HTML when the content changes", () => {
    const editorRef = createRef();
    const onChange = vi.fn();

    render(
      <EditorHarness
        editorRef={editorRef}
        value="<p>Base</p>"
        onChange={onChange}
      />
    );

    const editor = editorRef.current.getEditor();
    act(() => {
      editor.insertText(editor.getLength(), " con negrita", "user");
      editor.formatText(0, 4, "bold", true, "user");
    });

    expect(onChange).toHaveBeenCalled();
    const html = onChange.mock.calls.at(-1)[0];
    expect(html).toContain("con negrita");
    expect(html).toContain("<strong>Base</strong>");
  });

  it("emits semantic lists instead of Quill list attributes", () => {
    const editorRef = createRef();
    const onChange = vi.fn();

    render(
      <EditorHarness
        editorRef={editorRef}
        value="<p>Only item</p>"
        onChange={onChange}
      />
    );

    const editor = editorRef.current.getEditor();
    act(() => {
      editor.formatLine(0, editor.getLength(), "list", "bullet", "user");
    });

    const html = onChange.mock.calls.at(-1)[0];
    expect(html).toContain("<ul>");
    expect(html).not.toContain("data-list");
  });

  it("shows the provided value again when it changes externally", () => {
    const editorRef = createRef();
    const { rerender } = render(
      <EditorHarness editorRef={editorRef} value="<p>First</p>" onChange={vi.fn()} />
    );

    rerender(
      <EditorHarness editorRef={editorRef} value="<p>Second</p>" onChange={vi.fn()} />
    );

    expect(editorRef.current.getEditor().getSemanticHTML()).toContain("Second");
  });

  it("blocks changes that exceed the visible character limit", () => {
    const editorRef = createRef();
    const onChange = vi.fn();

    render(
      <EditorHarness
        editorRef={editorRef}
        value="<p>12345</p>"
        onChange={onChange}
        maxLength={5}
      />
    );

    const editor = editorRef.current.getEditor();
    act(() => {
      editor.insertText(editor.getLength(), "abc", "user");
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(editorRef.current.getEditor().getText()).not.toContain("abc");
  });

  it("translates the toolbar buttons for assistive technology", () => {
    render(
      <EditorHarness
        editorRef={createRef()}
        value="<p>Text</p>"
        onChange={vi.fn()}
        toolbarLabels={{
          bold: "Negrita",
          italic: "Cursiva",
          underline: "Subrayado",
          heading: "Título",
          orderedList: "Lista numerada",
          bulletList: "Lista con viñetas",
          link: "Insertar enlace",
          clean: "Limpiar formato",
        }}
      />
    );

    expect(screen.getByRole("button", { name: "Negrita" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Lista numerada" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Insertar enlace" })).toBeInTheDocument();
  });
});
