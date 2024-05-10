import { getDirEntry } from '.';

export default async function* cd(env: environment, args: string[]) {
  if (args.length > 1) {
    yield 'cd: too many arguments';
    return 1;
  }
  if (args.length == 0) {
    return 0;
  }

  const newwd = getDirEntry(args[0], env.cwd);

  if (!newwd) {
    yield `cd: no such file or directory: ${args[0]}`;
    return 1;
  }

  env.cwd = newwd;
  return 0;
}
