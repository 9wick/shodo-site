import type { CliExecFn } from './types';
import pkg from '../../package.json';




export const exec: CliExecFn = () => {
  const version = pkg.version;
  if (!version) {
    console.error('バージョンを取得できませんでした');
    return;
  }
  console.log(version);
};