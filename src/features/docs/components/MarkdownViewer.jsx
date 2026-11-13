import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { Link } from "react-router-dom";

const withoutNode = (props) => {
  const { node, ...rest } = props;
  void node;
  return rest;
};

const el = (Tag, className) => {
  const Component = (props) => <Tag className={className} {...withoutNode(props)} />;
  Component.displayName = `Markdown${Tag}`;
  return Component;
};

const Anchor = ({ node, href, children, ...props }) => {
  void node;
  if (typeof href === "string" && href.startsWith("/")) {
    return (
      <Link to={href} className="font-semibold text-brand hover:text-brand-strong hover:underline">
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className="font-semibold text-brand hover:text-brand-strong hover:underline"
      {...props}
    >
      {children}
    </a>
  );
};

const Table = (props) => (
  <div className="mb-4 overflow-x-auto rounded-control border border-line">
    <table className="w-full border-collapse text-left text-body" {...withoutNode(props)} />
  </div>
);

const TableHeadCell = (props) => (
  <th
    scope="col"
    className="border-b border-line bg-surface-2 px-3 py-2 font-semibold text-ink"
    {...withoutNode(props)}
  />
);

// The page renders the article title as the single h1; drop the leading
// markdown heading to avoid a duplicate heading.
const HeadingOne = () => null;

const components = {
  h1: HeadingOne,
  h2: el(
    "h2",
    "mb-3 mt-8 border-b border-line pb-2 text-section font-bold text-ink",
  ),
  h3: el("h3", "mb-2 mt-6 text-title font-semibold text-ink"),
  h4: el("h4", "mb-2 mt-5 text-body-lg font-semibold text-ink"),
  p: el("p", "mb-4 text-body-lg leading-6 text-ink-2"),
  a: Anchor,
  ul: el(
    "ul",
    "mb-4 list-disc space-y-1 pl-6 text-body-lg leading-6 text-ink-2",
  ),
  ol: el(
    "ol",
    "mb-4 list-decimal space-y-1 pl-6 text-body-lg leading-6 text-ink-2",
  ),
  li: el("li", "leading-6"),
  strong: el("strong", "font-semibold text-ink"),
  em: el("em", "italic"),
  blockquote: el(
    "blockquote",
    "my-4 rounded-control border-l-4 border-brand bg-brand-soft/60 px-4 py-3 text-body-lg text-ink-2",
  ),
  code: el(
    "code",
    "rounded bg-surface-2 px-1.5 py-0.5 text-[0.85em] font-medium text-ink",
  ),
  pre: el(
    "pre",
    "mb-4 overflow-x-auto rounded-control bg-[#0F172A] p-4 text-label leading-5 text-slate-100",
  ),
  table: Table,
  thead: el("thead", "border-b border-line"),
  th: TableHeadCell,
  td: el(
    "td",
    "border-b border-line px-3 py-2 align-top text-ink-2",
  ),
  hr: el("hr", "my-6 border-line"),
};

function MarkdownViewer({ content, containerRef }) {
  return (
    <div ref={containerRef} className="min-w-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownViewer;
