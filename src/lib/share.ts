export const HOME_DIR = '/home/user';

export function parseCommand(command: string) {
  const tokens = command.trim().split(' ');
  return tokens.length > 0 ? { name: tokens[0], args: tokens.slice(1) } : { name: '', args: [] };
}

export function parsePath(path: string) {
  return path.trim().split('/');
}

export function getDirEntry(components: string[], source: dirEntry) {
  if (components.length === 0) return source;
  if (components[0] === '~') {
    components = parsePath(HOME_DIR).concat(components.slice(1));
  }
  let curr = source;

  if (components[0].length === 0) {
    while (curr.entries.get('..') !== curr) {
      if (!curr.entries.has('..')) throw new Error('Directory must contain .. entry');
      curr = curr.entries.get('..')!;
    }
  }

  for (const token of components.filter((c) => c.length > 0)) {
    if (!curr.entries.has(token)) {
      return null;
    }
    curr = curr.entries.get(token)!;
  }
  return curr;
}

export function last<T>(arr: T[]) {
  return arr[arr.length - 1];
}
