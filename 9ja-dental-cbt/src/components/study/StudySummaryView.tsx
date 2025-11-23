"use client";

import { useEffect, useRef } from "react";

interface StudySummaryViewProps {
  html: string;
}

const TABLE_WRAPPER_CLASSES = [
  "summary-table-wrapper",
  "not-prose",
  "-mx-4",
  "sm:mx-0",
  "overflow-x-auto",
  "rounded-xl",
  "border",
  "border-slate-200",
  "dark:border-slate-700",
  "bg-white",
  "dark:bg-slate-900/30",
  "shadow-sm",
  "my-6",
];

const TABLE_CLASSES = [
  "summary-table",
  "w-full",
  "min-w-[640px]",
  "text-left",
  "text-sm",
  "border-separate",
  "border-spacing-0",
];

const TABLE_HEAD_CELL_CLASSES = [
  "px-4",
  "py-3",
  "font-semibold",
  "text-slate-700",
  "dark:text-slate-100",
  "bg-slate-50",
  "dark:bg-slate-900/60",
  "border-b",
  "border-slate-200",
  "dark:border-slate-700",
  "whitespace-nowrap",
];

const TABLE_BODY_CELL_CLASSES = [
  "px-4",
  "py-3",
  "text-slate-600",
  "dark:text-slate-300",
  "border-b",
  "border-slate-200",
  "dark:border-slate-700",
  "align-top",
];

export function StudySummaryView({ html }: StudySummaryViewProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const tables = Array.from(container.querySelectorAll("table"));
    tables.forEach((node) => {
      const table = node as HTMLTableElement;
      if (table.dataset.enhanced === "true") {
        return;
      }

      table.dataset.enhanced = "true";

      TABLE_CLASSES.forEach((className) => table.classList.add(className));

      const wrapper = document.createElement("div");
      wrapper.className = TABLE_WRAPPER_CLASSES.join(" ");

      const parent = table.parentElement;
      if (parent) {
        parent.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }

      const headCells = table.querySelectorAll("thead th");
      headCells.forEach((cell) => {
        TABLE_HEAD_CELL_CLASSES.forEach((className) =>
          cell.classList.add(className)
        );
      });

      const bodyCells = table.querySelectorAll("tbody td");
      bodyCells.forEach((cell) => {
        TABLE_BODY_CELL_CLASSES.forEach((className) =>
          cell.classList.add(className)
        );
      });

      const lastRowCells = table.querySelectorAll("tbody tr:last-child td");
      lastRowCells.forEach((cell) => {
        cell.classList.add("border-b-0");
      });
    });
  }, [html]);

  return (
    <article className="prose prose-slate max-w-none dark:prose-invert prose-headings:mt-8 prose-headings:mb-4 prose-headings:font-semibold prose-p:my-3 prose-p:leading-7 prose-li:my-1 prose-ul:my-3 prose-ol:my-3">
      <div
        ref={contentRef}
        className="summary-content text-slate-700 dark:text-slate-300"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
