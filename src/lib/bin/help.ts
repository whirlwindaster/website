import { programs } from '.';

export default async function* help(): AsyncGenerator<string, void, void> {
  yield `<div style="max-width: 300px">
${[...programs.keys()].join(' ').trim()}
</div>`;
}
