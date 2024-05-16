import { getDirEntry, parsePath } from '../share';

export default async function* cat(env: environment, args: string[]) {
  if (args.length == 0) {
    yield `cat: too few arguments<br>`;
    return 1;
  }

  const FILE_TYPES = ['.html', '.pdf', 'png'];

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
    const entry = getDirEntry(parsePath(path), env.cwd);
    if (!entry) {
      yield `cat: ${path}: No such file or directory<br>`;
      status = 1;
    } else {
      const tokens = path.split('/');
      if (FILE_TYPES.some((type) => path.endsWith(type))) {
        if (path.endsWith('.html')) {
          try {
            const response = await fetch(entry.path);
            if (response.status > 399) {
              throw response.status;
            }
            yield await response.text();
          } catch {
            yield `cat: ${path}: Could not retrieve file<br>`;
          }
        } else {
          yield `redirecting you to ${entry.path}`;
          window.open(entry.path, '_blank')?.focus();
        }
      } else {
        const url = `https://${tokens[tokens.length - 1]}`;
        yield `redirecting you to ${url}`;
        window.open(url, '_blank')?.focus();
      }
    }
  }

  return status;
}
