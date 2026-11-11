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
      <Link to={href} className="font-medium text-blue-600 hover:underline dark:text-blue-300">
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className="font-medium text-blue-600 hover:underline dark:text-blue-300"
      {...props}
    >
      {children}
    </a>
  );
};

const Table = (props) => (
  <div className="mb-4 overflow-x-auto">
    <table className="w-full border-collapse text-left text-sm" {...withoutNode(props)} />
  </div>
);

// The page renders the article title as the single h1; drop the leading
// markdown heading to avoid a duplicate heading.
const HeadingOne = () => null;

const components = {
  h1: HeadingOne,
  h2: el(
    "h2",
    "mb-3 mt-8 border-b border-bgray-200 pb-2 text-xl font-bold text-bgray-900 dark:border-darkblack-400 dark:text-white",
  ),
  h3: el("h3", "mb-2 mt-6 text-lg font-semibold text-bgray-900 dark:text-white"),
  h4: el("h4", "mb-2 mt-5 text-base font-semibold text-bgray-900 dark:text-white"),
  p: el("p", "mb-4 text-sm leading-6 text-bgray-700 dark:text-bgray-200"),
  a: Anchor,
  ul: el(
    "ul",
    "mb-4 list-disc space-y-1 pl-6 text-sm leading-6 text-bgray-700 dark:text-bgray-200",
  ),
  ol: el(
    "ol",
    "mb-4 list-decimal space-y-1 pl-6 text-sm leading-6 text-bgray-700 dark:text-bgray-200",
  ),
  li: el("li", "leading-6"),
  strong: el("strong", "font-semibold text-bgray-900 dark:text-white"),
  em: el("em", "italic"),
  blockquote: el(
    "blockquote",
    "my-4 border-l-4 border-blue-200 bg-blue-50 px-4 py-3 text-sm text-bgray-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-bgray-200",
  ),
  code: el(
    "code",
    "rounded bg-bgray-100 px-1.5 py-0.5 text-[0.85em] text-bgray-900 dark:bg-darkblack-500 dark:text-bgray-100",
  ),
  pre: el(
    "pre",
    "mb-4 overflow-x-auto rounded-xl bg-bgray-900 p-4 text-xs leading-5 text-bgray-100",
  ),
  table: Table,
  thead: el("thead", "border-b border-bgray-200 dark:border-darkblack-400"),
  th: el(
    "th",
    "border-b border-bgray-200 bg-bgray-50 px-3 py-2 font-semibold text-bgray-900 dark:border-darkblack-400 dark:bg-darkblack-500 dark:text-white",
  ),
  td: el(
    "td",
    "border-b border-bgray-100 px-3 py-2 align-top text-bgray-700 dark:border-darkblack-500 dark:text-bgray-200",
  ),
  hr: el("hr", "my-6 border-bgray-200 dark:border-darkblack-400"),
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
