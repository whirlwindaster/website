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
  if (name.length === 0) {
    return async function*() {
      return 0;
    }
  }

  if (programs.has(name)) {
    return programs.get(name)!;
  }

  return async function*() {
    yield `ash: command not found: ${name}`;
    return 1;
  };
}
