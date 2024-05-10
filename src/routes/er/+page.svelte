<script lang="ts">
  import getProgram, { programs } from '$lib/bin';
  import { parseCommand } from '$lib/helpers';
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
  let submitted = false;
  let execHistory: executionRecord[] = [];

  onMount(() => {
    const commandLine = document.getElementById('commandline')!;
    document.addEventListener('click', () => {
      commandLine.focus();
    });
    commandLine.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
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
    }
  }

  function tabComplete() {
    const completions: string[] = [];
    const parsed = input.split(' ');
    if (parsed.length === 0) return;

    if (parsed.length > 1) {
      completions.push(
        ...[...env.cwd.entries.keys()].filter(
          (k) => !k.startsWith('.') && k.startsWith(parsed[parsed.length - 1]),
        ),
      );
    } else {
      completions.push(...[...programs.keys()].filter((k) => k.startsWith(parsed[0])));
    }
    completions.sort();

    if (completions.length > 1) {
      execHistory = [
        ...execHistory,
        {
          exitCode: parseInt(env.variables.get('?') || '0'),
          dir: env.cwd.path,
          input: input,
          output: completions.join(' ').concat('<br>'),
        },
      ];
    } else if (completions.length === 1) {
      parsed[parsed.length - 1] = completions[0];
      input = parsed.join(' ').concat(' ');
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

    if (path.startsWith('/home/user')) {
      return path.replace('/home/user', '~');
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
    {#if submitted}
      <div>
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html output}
      </div>
    {/if}
    <input
      id="commandline"
      class="text-inherit bg-inherit border-none focus:outline-none"
      bind:value={input}
      on:keydown|capture={dispatchKeyHandler}
    />
  </div>
</div>
