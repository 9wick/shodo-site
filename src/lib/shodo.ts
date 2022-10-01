import fetch from "node-fetch-commonjs";
import {setTimeout} from "timers/promises";
import clc from "cli-color";

export interface ShodoConfig {
  apiRoute: string,
  token: string
}

export interface ShodoMessage {

  /**
   * 推奨される置き換えテキスト
   */
  "after"?: string,

  /**
   * 指摘対象のテキスト
   */
  "before"?: string,


  /**
   * 指摘の終わり位置（{ line: 行, ch: 列 }）。0から始まる順番。
   */
  "to": {
    "ch": number,
    "line": number
  }

  /**
   * 指摘の位置（{ line: 行, ch: 列 }）。0から始まる順番。
   */
  "from": {
    "ch": number,
    "line": number
  },

  /**
   * 指摘のインデックス番号。0から始まる順番。
   */
  "index": number,


  /**
   * 指摘の終わり位置のインデックス番号。
   */
  "index_to": number,

  /**
   * 指摘の内容
   */
  "message": string,

  /**
   * error、warningによる重要度
   */
  "severity": "warning" | "error",

}

export interface ShodoResults {
  "messages": ShodoMessage[];

  /**
   * done（完了）、processing（校正中）、failed（失敗）の3つの状態
   */
  "status": "done" | "processing" | "failed";

  /**
   * 最後に情報が更新された日時（UNIXタイムスタンプ） (seconds)
   */
  "updated": number;
}

export class Shodo {
  constructor(private config: ShodoConfig) {
  }


  private async requestToShodo(path: string, method: "POST" | "GET", body?: any) {
    const url = `${this.config.apiRoute}${path}`;

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.token}`
      },
      ...(body ? {body: JSON.stringify(body)} : {})
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`http request to shodo api error: ${text}`);
    }
    const results = await res.json();
    return results as any;
  }

  public async requestLint(body: string) {
    const results = await this.requestToShodo("lint/", "POST", {body});
    return {lintId: results.lint_id};
  }


  public async getResults(lintId: string) {
    const results = await this.requestToShodo(`lint/${lintId}/`, "GET") as ShodoResults;
    return results;
  }

  public async requestLintWait(body: string) {
    const results = await this.requestLint(body);
    const lintId = results.lintId;


    while (1) {
      await setTimeout(500);  // refer to https://github.com/zenproducts/shodo-python/blob/main/shodo/lint.py#L55
      const results = await this.getResults(lintId);
      if (results.status === "failed") {
        throw new Error(`shodo api failed: ${JSON.stringify(results)}`);
      }
      if (results.status === "done") {
        return results.messages
          .sort((a, b) => a.from.line !== b.from.line ? a.from.line - b.from.line : a.from.ch - b.from.ch);
      }
    }
    throw new Error("unreachable")
  }

  public convertToReadableTextObj(body: string, messages: ShodoMessage[], {color} = {color: true}) {
    return messages.map(m => {
      const colorStyle = color ? (m.severity === "error" ? clc.red : clc.yellow) : (s: string) => s;
      const pos = `${m.from.line + 1}:${m.from.ch + 1}`;

      const message = m.message;
      const highlight =
        body.slice(m.index - 10, m.index) // before
        + colorStyle(
          body.slice(m.index, m.index_to) // target
          + (m.after ? `（→ ${m.after}）` : "") // suggestion
        )
        + body.slice(m.index_to, m.index_to + 10); // after

      return {
        pos,
        message,
        highlight: highlight.split("\n").join("")  // ignore \n
      }
    })
  }

  public printResults(body: string, messages: ShodoMessage[], {color} = {color: true}) {
    const data = this.convertToReadableTextObj(body, messages, {color});
    data.forEach((m) => {
      console.log(`${m.pos} ${m.message}\n    ${m.highlight}`);
    })
  }

}