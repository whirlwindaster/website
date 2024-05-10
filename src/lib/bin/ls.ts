import { getDirEntry } from '.';

export default async function* ls(env: environment, args: string[]) {
  let omissionLevel = 2;
  const paths: string[] = [];
  const entries: dirEntry[] = [];
  let status = 0;

  for (const arg of args) {
    if (arg == '-a' || arg == '--all') {
      omissionLevel = 0;
    } else if (arg == '-A' || arg == '--almost-all') {
      omissionLevel = 1;
    } else if (arg == '-h' || arg == '--help') {
      yield 'help';
      return 0;
    } else {
      paths.push(arg);
    }
  }

  if (paths.length == 0) {
    entries.push(env.cwd);
  } else {
    for (const path of paths) {
      const entry = getDirEntry(path, env.cwd);
      if (entry) {
        entries.push(entry);
      } else {
        yield `ls: cannot access '${path}': No such file or directory<br>`;
        status = 1;
      }
    }
  }

  if (entries.length == 0) {
    return status;
  }

  const filter =
    omissionLevel == 0
      ? () => true
      : omissionLevel == 1
        ? (path: string) => path != '.' && path != '..'
        : (path: string) => !path.startsWith('.');

  if (paths.length < 2) {
    yield `${[...entries[0].entries.keys()].filter(filter).sort().join(' ').trim()}`;
  } else {
    // TODO handle case where entry is file
    for (const [i, entry] of entries.entries()) {
      if (i == 0) {
        yield `${paths[i]}:<br>
${[...entry.entries.keys()].filter(filter).sort().join(' ').trim()}<br>`;
      } else {
        yield `<br>${paths[i]}:<br>
${[...entry.entries.keys()].filter(filter).sort().join(' ').trim()}<br>`;
      }
    }
  }

  return status;
}
