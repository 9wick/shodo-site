import arg from "arg";
import type { CliExecFn } from "./types";
import { crowle } from "../lib/crawler";
import { parseFromJsdom } from "../lib/paser";
import { IsValidUrl, numberWithCommas } from "../lib/util";
import { Shodo } from "../lib/shodo";
import { loadShodoEnv } from "../lib/env";

export const helpText = `
Command:
  shodo-site run         webサイトをクローリングして本文校正を行う  

Usage:
  npx shodo-site run {entryUrl} [options]

Parameters:
  entryUrl               クローリングを開始するURL

Options:
  --urlPrefix            prefixが一致するページのみ本文校正の対象とする(default: entryUrlと同一)
  --help, -h             このヘルプを表示
  
環境変数
  SHODO_API_ROUTE        [必須]shodoのAPIルート 例：https://api.shodo.ink/@org/project/
  SHODO_TOKEN            [必須]shodoのトークン
  
`;

function parseArgs(argv: string[]) {
  try {
    return arg(
      {
        // Types
        "--urlPrefix": String,
        "--help": Boolean,

        //Alias
        "-h": "--help",
      },
      { argv }
    );
  } catch (err: any) {
    if (err.code === "ARG_UNKNOWN_OPTION") {
      console.error("不正な引数です");
    } else {
      console.error("引数のパース時にエラーが発生しました");
      console.log(err);
    }
    console.log(helpText);
    return null;
  }
}

export const exec: CliExecFn = async (argv) => {
  const args = parseArgs(argv);
  if (args === null) return;

  if (args._.length !== 1) {
    console.error("不正な引数です");
    console.log(helpText);
    return;
  }
  if (args["--help"]) {
    console.log(helpText);
    return;
  }

  const entryUrl = args._[0]!;
  if (!IsValidUrl(entryUrl)) {
    console.error(`{entryUrl}がURLとして正しくありません:${entryUrl}`);
    return;
  }
  const urlPrefix = args["--urlPrefix"] ?? entryUrl;
  if (!IsValidUrl(urlPrefix)) {
    console.error(`[--urlPrefix]がURLとして正しくありません:${urlPrefix}`);
    return;
  }

  let apiRoute, token;
  try {
    const env = loadShodoEnv();
    apiRoute = env.apiRoute;
    token = env.token;
  } catch (e: any) {
    console.error(e.message);
    return;
  }

  const shodo = new Shodo({ token, apiRoute });
  try {
    const res = await shodo.isValidAccount();
    if (res) {
      // console.log(`✅shodoアカウントの確認が取れました`)
    } else {
      throw new Error("認証に失敗しました");
    }
  } catch (e) {
    console.log(`shodoアカウントの確認に失敗しました`, e);
    return;
  }

  let textLength = 0;
  await crowle(entryUrl, {
    targetPrefix: entryUrl,
    onFetchBody: async ({ url, doc }) => {
      if (!url.startsWith(urlPrefix)) {
        return;
      }
      const { article } = parseFromJsdom(doc);
      const length = article.length;
      textLength += length;
      const messages = await shodo.requestLintWait(article);
      const data = shodo.convertToReadableObj(article, messages);
      console.log(
        `本文抽出文字数:${numberWithCommas(length).padStart(7)} ${url} `
      );
      data.forEach((m) => {
        console.log(`    ${m.pos} ${m.message}\n        ${m.highlight}`);
      });
      if (data.length === 0) {
        console.log(`    ✅チェックok`);
      }
    },
  });

  console.log(`合計文字数:${numberWithCommas(textLength)}`);
};
