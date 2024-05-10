type dirEntry = {
  path: string;
  kind: 'dir' | 'file';
  executable: boolean;
  entries: Map<string, dirEntry>;
};

type environment = {
  variables: Map<string, string>;
  fsRoot: dirEntry;
  cwd: dirEntry;
};
