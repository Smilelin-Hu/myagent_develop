// import { ModelMessage, streamText } from 'ai';
// import { openai } from "@ai-sdk/openai";
// import 'dotenv/config';
// import * as readline from 'node:readline/promises';

// const terminal = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// const messages: ModelMessage[] = [];

// async function main() {
//   while (true) {
//     const userInput = await terminal.question('You: ');

//     messages.push({ role: 'user', content: userInput });

//     const result = streamText({
//       model: openai("gpt-5.5"),
//       messages,
//     });

//     let fullResponse = '';
//     process.stdout.write('\nAssistant: ');
//     for await (const delta of result.textStream) {
//       fullResponse += delta;
//       process.stdout.write(delta);
//     }
//     process.stdout.write('\n\n');

//     messages.push({ role: 'assistant', content: fullResponse });
//   }
// }

// main().catch(console.error);


import 'dotenv/config';
import { ModelMessage, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import * as readline from 'node:readline/promises';

const provider = createOpenAI({
  apiKey: process.env.PROVIDER_API_KEY,
  baseURL: process.env.PROVIDER_BASE_URL,
});

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages: ModelMessage[] = [];

async function main() {
  while (true) {
    const userInput = await terminal.question('You: ');

    messages.push({
      role: 'user',
      content: userInput,
    });

    const result = streamText({
      model: provider('gpt-5.6-sol'),
      messages,
    });

    let fullResponse = '';

    process.stdout.write('\nAssistant: ');

    for await (const delta of result.textStream) {
      fullResponse += delta;
      process.stdout.write(delta);
    }

    process.stdout.write('\n\n');

    messages.push({
      role: 'assistant',
      content: fullResponse,
    });
  }
}

main().catch(console.error);