import arg from "arg";
import type {CliExecFn} from "./types";
import {crowle} from "../lib/crawler";
import {parseFromJsdom} from "../lib/paser";

export const helpText = `
Command:
  shodo-site list       webサイトをクローリングしてURLリストを出力する

Usage:
  npx shodo-site list {entryUrl} [options]


Options:
  --urlPrefix             prefixが一致するページのみ本文校正の対象とする(default: entryUrlと同一)
  --showBody              本文抽出後の文字列を出力する
  --help, -h              このヘルプを表示
  
`

function parseArgs(argv: string[]) {
  try {
    return arg(
      {
        // Types
        '--urlPrefix': String,
        '--showBody': Boolean,
        '--help': Boolean,

        //Alias
        '-h': '--help'
      },
      {argv}
    );
  } catch (err: any) {
    if (err.code === 'ARG_UNKNOWN_OPTION') {
      console.error("不正な引数です");
    } else {
      console.error('引数のパース時にエラーが発生しました');
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
  if (args['--help']) {
    console.log(helpText);
    return;
  }

  const entryUrl = args._[0]!;
  const targetPrefix = args["--urlPrefix"] ?? entryUrl;
  const showBody = args["--showBody"] ?? false;


  await crowle(entryUrl, {
    targetPrefix, onFetchBody: async ({url, doc}) => {
      console.log(url);
      if (showBody) {
        const body = parseFromJsdom(doc);
        console.log(body);
      }
    }
  })


};