import fetch from "node-fetch-commonjs";
import {JSDOM} from 'jsdom';
import * as querystring from "querystring";
import type {PromiseType} from "utility-types";
import {setTimeout} from 'timers/promises'
import {createSerialExecutor, SerialExecutor} from "@9wick/serial-executor"

const contentTypeParser = require("content-type-parser");

class ContentTypeError extends Error {
  static mark = Symbol()
  mark = ContentTypeError.mark;
}

export const getSiteLinks = async (url: string) => {
  let html;
  let contentType;
  try {
    const res = await fetch(url, {headers: {'Accept-Language': 'ja-JP'}});
    html = await res.text();
    contentType = res.headers.get('Content-Type');

  } catch (e) {
    console.warn(`fetching ${url} error`, e);
  }

  if (!contentTypeParser(contentType).isText()) {
    throw new ContentTypeError(`${url} is not html file`)
  }

  const doc = new JSDOM(html, {
    url
  });
  const aTagList = doc.window.document.querySelectorAll(`a`);
  const linkList = Array.from(aTagList)
    .map(e => e.href)
    .map(href => {
      try {
        const u = new URL(href);
        // u.search = "";
        u.hash = "";
        return u.toString();
      } catch (e) {
        return null;
      }
    }).filter(e => e !== null) as string[];
  return {url, isHtml: true, linkList, html, doc};
}

export const crowle = async (url: string, config: { targetPrefix: string, already?: Set<string>, executor?: SerialExecutor, onFetchBody?: (params: PromiseType<ReturnType<typeof getSiteLinks>>) => Promise<void> }) => {
  const already = config.already ?? new Set();
  const executor = config.executor ?? createSerialExecutor();
  if (already.has(url)) {
    return;
  }
  already.add(url);


  let results;
  try {
    results = await executor.execute(async () => {
      const r = await getSiteLinks(url);
      if (r.isHtml && config.onFetchBody) {
        await config.onFetchBody(r);
      }
      await setTimeout(10);
      return r;
    });
  } catch (e: any) {
    if (e.mark && e.mark === ContentTypeError.mark) {
      // ignore
      return;
    } else {
      throw e;
    }
  }

  const targetUrlList = results.linkList
    .filter(u => u.startsWith(config.targetPrefix))
    .filter(u => !already.has(u));

  await Promise.all(targetUrlList.map(async (u) => crowle(u, {...config, already, executor})))

}