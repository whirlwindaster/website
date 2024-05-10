import { getDirEntry } from '.';

export default async function* cat(env: environment, args: string[]) {
  if (args.length == 0) {
    yield `cat: too few arguments<br>`;
    return 1;
  }

  const FILE_TYPES = ['.pdf', 'png'];

  const paths: string[] = [];
  let status = 0;

  for (const arg of args) {
    if (arg == '-h' || arg == '--help') {
      yield `very helpful<br>`;
      return status;
    }
    paths.push(arg);
  }

  for (const path of paths) {
    const entry = getDirEntry(path, env.cwd);
    if (!entry) {
      yield `cat: ${path}: No such file or directory<br>`;
      status = 1;
    } else {
      if (!entry.path.endsWith('.html')) {
        const tokens = path.split('/');
        const url = FILE_TYPES.some((type) => tokens[tokens.length - 1].endsWith(type))
          ? tokens[tokens.length - 1]
          : `https://${tokens[tokens.length - 1]}`;
        yield `redirecting you to ${url}<br>`;
        window.open(url, '_blank')?.focus();
      } else {
        try {
          const response = await fetch(entry.path);
          if (response.status > 399) {
            throw response.status;
          }
          yield await response.text();
        } catch {
          yield `cat: ${path}: Could not retrieve file<br>`;
        }
      }
    }
  }

  return status;
}
