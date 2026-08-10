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
    model: provider.chat('gpt-image-2'),
    prompt: '在成都闹市，驾驶ae86的熊猫，赛博朋克一点',
  });

  console.log(result);

  const imageMatch = result.text.match(
    /data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=\r\n]+)/,
  );

  if (!imageMatch) {
    throw new Error(
      `接口已响应，但没有找到 Base64 图片。返回内容开头：${result.text.slice(0, 200)}`,
    );
  }

  const imageBuffer = Buffer.from(imageMatch[2].replace(/\s/g, ''), 'base64');
  fs.writeFileSync('output2.png', imageBuffer);

  console.log(`图片已保存到 output2.png（${imageBuffer.length} bytes）`);
}

main().catch(console.error);


