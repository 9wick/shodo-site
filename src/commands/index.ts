import type {CliExecFn} from './types';
import * as run from './run';
import * as check from './check';
import * as list from './list';
import * as version from './version';
import * as help from './help';

type Commands = { [command: string]: CliExecFn };


export async function exec(
  execCommandName: string,
  execCommandArgs: string[]
) {
  const commands: Commands = {
    run: async (argv: string[]) => run.exec(argv),
    check: async (argv: string[]) => check.exec(argv),
    list: async (argv: string[]) => list.exec(argv),
    '--version': async (argv: string[]) => version.exec(argv),
    '-v': async (argv: string[]) => version.exec(argv),
    '--help': async (argv: string[]) => help.exec(argv),
    '-h': async (argv: string[]) => help.exec(argv),
  };

  const commandFunc = commands[execCommandName];

  if (!commandFunc) {
    console.error('該当するCLIコマンドが存在しません');
    await help.exec(execCommandArgs);
    return;
  }
  await commandFunc(execCommandArgs);


}