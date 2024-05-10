export type file = {
  path: string;
  kind: 'file' | 'directory';
  files: file[];
};

export function parseCommand(command: string) {
  const tokens = command.trim().split(' ');
  return tokens.length > 0 ? { name: tokens[0], args: tokens.slice(1) } : { name: '', args: [] };
}

export function awaitKeypress(key: string) {
  return new Promise<void>((resolve) => {
    document.addEventListener('keydown', handler);
    function handler(event: KeyboardEvent) {
      if (event.key == key) {
        document.removeEventListener('keydown', handler);
        resolve();
      }
    }
  });
}
