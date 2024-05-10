import type { PageLoad } from '../$types';

function makeDirEntry(
  name: string,
  kind: 'dir' | 'file',
  parent?: dirEntry,
  executable = false,
): dirEntry {
  const out: dirEntry = {
    path: parent ? `${parent.path}/${name}` : name,
    kind: kind,
    executable: kind == 'dir' ? false : executable,
    entries: new Map<string, dirEntry>(),
  };

  if (kind == 'dir') {
    out.entries.set('.', out);
    out.entries.set('..', parent ? parent : out);
  }

  return out;
}

export const load: PageLoad = () => {
  const root = makeDirEntry('', 'dir');
  root.entries.set('favicon.png', makeDirEntry('favicon.png', 'file', root));
  root.entries.set('home', makeDirEntry('home', 'dir', root));
  root.entries
    .get('home')!
    .entries.set('user', makeDirEntry('user', 'dir', root.entries.get('home')!));

  root.entries.set('usr', makeDirEntry('usr', 'dir', root));
  root.entries.get('usr')!.entries.set('bin', makeDirEntry('bin', 'dir', root.entries.get('usr')!));

  const userHome = root.entries.get('home')!.entries.get('user')!;
  userHome.entries.set('example.html', makeDirEntry('example.html', 'file', userHome));
  userHome.entries.set(
    'dd.whirlwinda.st',
    makeDirEntry('dd.whirlwinda.st', 'file', userHome, true),
  );

  const bin = root.entries.get('usr')!.entries.get('bin')!;
  bin.entries.set('cat', makeDirEntry('cat', 'file', bin));
  bin.entries.set('cd', makeDirEntry('cd', 'file', bin));
  bin.entries.set('help', makeDirEntry('help', 'file', bin));
  bin.entries.set('ls', makeDirEntry('ls', 'file', bin));
  bin.entries.set('neofetch', makeDirEntry('neofetch', 'file', bin));

  const env = {
    variables: new Map<string, string>([['?', '0']]),
    fsRoot: root,
    cwd: userHome,
  };

  return env;
};
