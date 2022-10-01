import {Readability} from '@mozilla/readability';
import type {JSDOM} from "jsdom";


export const parseFromJsdom = (doc: JSDOM) => {
  let reader = new Readability(doc.window.document);
  let parsed = reader.parse();

  if (parsed) {
    return {article: parsed.textContent}
  }

  return {article: doc.window.document.textContent ?? ""};
}
