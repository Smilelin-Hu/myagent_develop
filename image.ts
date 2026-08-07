import 'dotenv/config';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import fs from 'node:fs';

if (!process.env.IMAGE_API_KEY || !process.env.IMAGE_BASE_URL) {
  throw new Error('请在 .env 中配置 IMAGE_API_KEY 和 IMAGE_BASE_URL');
}

const provider = createOpenAI({
  apiKey: process.env.IMAGE_API_KEY,
  baseURL: process.env.IMAGE_BASE_URL,
});

async function main() {
  const result = await generateText({
    // PackyAPI currently supports this model through Chat Completions.
    model: provider.chat('gemini-2.5-flash-image'),
    prompt: '一只戴着耳机写 TypeScript 程序的橘猫，温暖的室内光线，精致的数字插画',
  });

  const imageMatch = result.text.match(
    /data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=\r\n]+)/,
  );

  if (!imageMatch) {
    throw new Error(
      `接口已响应，但没有找到 Base64 图片。返回内容开头：${result.text.slice(0, 200)}`,
    );
  }

  const imageBuffer = Buffer.from(imageMatch[2].replace(/\s/g, ''), 'base64');
  fs.writeFileSync('output.png', imageBuffer);

  console.log(`图片已保存到 output.png（${imageBuffer.length} bytes）`);
}

main().catch(console.error);
