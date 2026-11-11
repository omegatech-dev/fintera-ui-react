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
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-bgray-500 dark:text-bgray-400">
        {t("docs.onThisPage")}
      </p>
      <ul className="space-y-1.5 border-l border-bgray-200 dark:border-darkblack-400">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? "pl-4" : "pl-3"}>
            <a
              href={`#${heading.id}`}
              className="block border-l-2 border-transparent text-xs leading-5 text-bgray-600 hover:border-blue-500 hover:text-blue-600 dark:text-bgray-300 dark:hover:text-blue-300"
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
