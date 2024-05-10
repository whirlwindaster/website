import cat from './cat';
import cd from './cd';
import help from './help';
import ls from './ls';
import neofetch from './neofetch';

export const programs = new Map<
  string,
  (env: environment, args: string[]) => AsyncGenerator<string, number | void, void>
>([
  ['cat', cat],
  ['cd', cd],
  ['help', help],
  ['ls', ls],
  ['neofetch', neofetch],
]);

export default function getProgram(name: string) {
  if (programs.has(name)) {
    return programs.get(name)!;
  }

  return async function* () {
    yield `ash: command not found: ${name}`;
    return 1;
  };
}

export function getDirEntry(path: string, source: dirEntry) {
  const tokens = path.split('/').filter((tok) => tok.length > 0);

  let curr = source;

  if (path.startsWith('/')) {
    while (curr.entries.get('..') !== curr) {
      // TODO make this a real error
      if (!curr.entries.has('..')) throw '';
      curr = curr.entries.get('..')!;
    }
  }

  for (const token of tokens) {
    if (!curr.entries.has(token)) {
      return null;
    }
    curr = curr.entries.get(token)!;
  }
  return curr;
}
