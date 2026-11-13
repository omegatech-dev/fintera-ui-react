import { useEffect, useState } from "react";
import { useLocale } from "../../../contexts/LocaleContext";

function TableOfContents({ containerRef, contentKey }) {
  const { t } = useLocale();
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      setHeadings([]);
      return;
    }

    const nodes = Array.from(container.querySelectorAll("h2[id], h3[id]"));
    setHeadings(
      nodes.map((node) => ({
        id: node.id,
        text: node.textContent,
        level: Number(node.tagName.slice(1)),
      })),
    );
  }, [containerRef, contentKey]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav aria-label={t("docs.onThisPage")}>
      <p className="mb-2 text-micro font-semibold uppercase tracking-wide text-ink-3">
        {t("docs.onThisPage")}
      </p>
      <ul className="space-y-1 border-l border-line">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? "pl-4" : "pl-3"}>
            <a
              href={`#${heading.id}`}
              className="block border-l-2 border-transparent text-label leading-5 text-ink-3 transition-colors hover:border-brand hover:text-brand-strong"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default TableOfContents;
