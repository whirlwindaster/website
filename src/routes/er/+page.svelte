<script lang="ts">
  import getProgram, { programs } from '$lib/bin';
  import { HOME_DIR, getDirEntry, parseCommand, last, parsePath } from '$lib/share';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  export let data: PageData;

  type executionRecord = {
    exitCode: number;
    dir: string;
    input: string;
    output: string;
  };

  let env = data;
  let input = 'neofetch';
  let output = '';
  let execHistory: executionRecord[] = [];

  onMount(() => {
    const commandLine = document.getElementById('commandline');
    const focusCommandLine = () => {
      commandLine?.focus();
    };
    document.addEventListener('click', focusCommandLine);
    commandLine?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    return () => {
      document.removeEventListener('click', focusCommandLine);
    };
  });

  function dispatchKeyHandler(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        submitCommand();
        break;
      case 'Tab':
        event.preventDefault();
        tabComplete();
        break;
      case 'ArrowUp':
        event.preventDefault();
        getPrevious();
        break;
    }
  }

  function getPrevious() {
    input = execHistory[execHistory.length - 1]?.input || '';
  }

  function tabComplete() {
    const completions: string[] = [];
    const tokens = input.trimStart().split(' ');
    if (tokens.length === 0) return;

    if (tokens.length > 1) {
      // complete with directory entries, filtering . and ..
      const components = parsePath(last(tokens));
      const parent = components.slice(0, components.length - 1);
      const searchDir = getDirEntry(parent, env.cwd);
      if (!searchDir) return;
      completions.push(
        ...[...searchDir.entries.keys()]
          .filter((c) => c !== '.' && c !== '..' && c.startsWith(last(components) || ''))
          .map(
            (c) =>
              `${parent.join('/')}${parent.length > 0 ? '/' : ''}${c}${searchDir.entries.get(c)!.kind == 'dir' ? '/' : ' '}`,
          ),
      );
    } else {
      // complete with commands
      completions.push(
        ...[...programs.keys()].filter((k) => k.startsWith(tokens[0])).map((c) => `${c} `),
      );
    }
    completions.sort();

    if (completions.length > 1) {
      execHistory = [
        ...execHistory,
        {
          exitCode: parseInt(env.variables.get('?') || '0'),
          dir: env.cwd.path,
          input: input,
          // TODO better spacing
          output: completions
            .map((c) => c.substring(c.lastIndexOf('/') + 1))
            .join(' ')
            .concat('<br>'),
        },
      ];
    } else if (completions.length === 1) {
      if (!completions[0].startsWith(last(tokens))) {
        tokens[tokens.length - 1] = last(tokens).concat(completions[0]);
      }
      tokens[tokens.length - 1] = completions[0];
      input = tokens.join(' ');
    }
  }

  async function submitCommand() {
    const parsed = parseCommand(input);
    const oldEnv: [number, string] = [parseInt(env.variables.get('?') || '0'), env.cwd.path];
    await execute(getProgram(parsed.name), parsed.args);
    env = env;

    execHistory = [
      ...execHistory,
      {
        exitCode: oldEnv[0],
        dir: oldEnv[1],
        input: input,
        output: output,
      },
    ];

    input = '';
    output = '';
    document.getElementById('commandline')?.focus();
  }

  async function execute(
    program: (env: environment, args: string[]) => AsyncGenerator<string, number | void, void>,
    args: string[],
  ) {
    const gen = program(env, args);
    let next = await gen.next();
    while (!next.done) {
      output += next.value;
      next = await gen.next();
    }
    env.variables.set('?', (next.value || 0).toString());
  }

  function pathDisplayString(path: string) {
    if (!path) {
      return '/';
    }

    if (path.startsWith(HOME_DIR)) {
      return path.replace(HOME_DIR, '~');
    }

    return path;
  }
</script>

<div class="font-mono text-md m-2">
  {#each execHistory as command}
    <div class="text-cyan h-min">
      <span class="font-semibold text-magenta">user@whirlwinda.st/er</span>:<span
        class="font-medium text-blue">{pathDisplayString(command.dir)}</span
      >
      {#if command.exitCode !== 0}
        <span class="text-red font-medium">✽</span>
      {:else}
        <span class="text-green font-medium">✽</span>
      {/if}
      {command.input}
      <div>
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html command.output}
      </div>
    </div>
  {/each}

  <div class="text-cyan h-min">
    <span class="font-semibold text-magenta">user@whirlwinda.st/er</span>:<span
      class="font-medium text-blue">{pathDisplayString(env.cwd.path)}</span
    >
    {#if parseInt(env.variables.get('?') || '0') !== 0}
      <span class="text-red font-medium">✽</span>
    {:else}
      <span class="text-green font-medium">✽</span>
    {/if}
    <input
      id="commandline"
      class="text-inherit bg-inherit w-8/12 border-none focus:outline-none"
      bind:value={input}
      on:keydown|capture={dispatchKeyHandler}
    />
    <div>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html output}
    </div>
  </div>
</div>
