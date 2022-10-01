import arg from "arg";
import type {CliExecFn} from "./types";
import {crowle} from "../lib/crawler";
import {parseFromJsdom} from "../lib/paser";
import {IsValidUrl, numberWithCommas} from "../lib/util";
import {Shodo} from "../lib/shodo";
import {loadShodoEnv} from '../lib/env'

export const helpText = `
Command:
  shodo-site check           APIルートとtokenがあっているかを確認します

Usage:
  npx shodo-site check
  
Options:
  --help, -h             このヘルプを表示

環境変数
  SHODO_API_ROUTE            [必須]shodoのAPIルート 例：https://api.shodo.ink/@org/project/
  SHODO_TOKEN                [必須]shodoのトークン

`

function parseArgs(argv: string[]) {
  try {
    return arg(
      {
        // Types
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

  if (args['--help']) {
    console.log(helpText);
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

  console.log(`✅SHODO_API_ROUTEとSHODO_TOKENを読み込みました`);

  const shodo = new Shodo({token, apiRoute});
  try{
    const res = await shodo.isValidAccount();
    if(res){
      console.log(`✅shodoアカウントの確認が取れました`)
    }else{
      throw new Error("認証に失敗しました")
    }
  }catch (e) {
    console.log(`shodoアカウントの確認に失敗しました APIルート:${apiRoute}`, e)
    return;
  }


};

