import type { CliExecFn } from "./types";
import pkg from "../../package.json";

export const helpText = `
Command:
  shodo-site run               webサイトをクローリングして本文校正を行う  
  shodo-site list              webサイトをクローリングして対象のURLリストを出力する
  shodo-site check             APIルートとtokenがあっているかを確認します
  shodo-site --version, -v     バージョンを表示
  shodo-site --help, -h        ヘルプ
`;

export const exec: CliExecFn = () => {
  console.log(helpText);
};
