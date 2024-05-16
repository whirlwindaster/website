import { getDirEntry, parsePath } from '../share';

export default async function* cd(env: environment, args: string[]) {
  if (args.length > 1) {
    yield 'cd: too many arguments';
    return 1;
  }
  if (args.length == 0) {
    return 0;
  }

  const newwd = getDirEntry(parsePath(args[0]), env.cwd);

  if (!newwd) {
    yield `cd: ${args[0]}: No such file or directory`;
    return 1;
  }
  if (newwd.kind == 'file') {
    yield `cd: ${args[0]}: Not a directory`
    return 1;
  }

  env.cwd = newwd;
  return 0;
}
