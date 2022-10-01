import { Readability } from "@mozilla/readability";
import type { JSDOM } from "jsdom";

export const parseFromJsdom = (doc: JSDOM) => {
  const reader = new Readability(doc.window.document);
  const parsed = reader.parse();

  if (parsed) {
    return { article: parsed.textContent };
  }

  return { article: doc.window.document.textContent ?? "" };
};
