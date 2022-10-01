import arg from "arg";
import type {CliExecFn} from "./types";

export const helpText = `
Command:
  shodo-site run       webサイトをクローリングして本文校正を行う  

Usage:
  npx shodo-site run {entryUrl} [options]


Options:
  --urlPrefix             prefixが一致するページのみ本文校正の対象とする(default: entryUrlと同一)
  --bodyOnly              各ページで本文抽出を行い、抽出した本文のみ校正の対象とする(default: true)
  --help, -h              このヘルプを表示
  
`

function parseArgs(argv: string[]) {
  try {
    return arg(
      {
        // Types
        '--urlPrefix': String,
        '--bodyOnly': Boolean,
        '--help': Boolean,

        //Alias
        '-h' : '--help'
      },
      { argv }
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



export const exec: CliExecFn = (argv) => {
  const args = parseArgs(argv);
  if (args === null) return;

  if(args._.length !== 1){
    console.error("不正な引数です");
    console.log(helpText);
    return;
  }
  if (args['--help']) {
    console.log(helpText);
    return;
  }

  const entryUrl = args._[0];
  const prefixUrl = args["--urlPrefix"] ?? entryUrl;
  const bodyOnly = args["--bodyOnly"] ?? true;



};