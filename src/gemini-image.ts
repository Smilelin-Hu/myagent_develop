import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

interface GenerateImageInput {
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
}

interface GeminiPart {
  text?: string;

  inlineData?: {
    mimeType?: string;
    data?: string;
  };

  // 兼容部分中转站使用的下划线格式
  inline_data?: {
    mime_type?: string;
    data?: string;
  };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
}

export async function generateGeminiImage({
  prompt,
  aspectRatio = '1:1',
}: GenerateImageInput) {
  const baseURL = process.env.IMAGE_BASE_URL;
  const apiKey = process.env.IMAGE_API_KEY;

  if (!baseURL || !apiKey) {
    throw new Error('缺少 RELAY_GEMINI_BASE_URL 或 RELAY_API_KEY');
  }

  const endpoint =
    `${baseURL.replace(/\/$/, '')}` +
    '/v1beta/models/gemini-2.5-flash-image:generateContent';

  const response = await fetch(endpoint, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },

    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],

      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio,
        },
      },
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `图片接口请求失败：${response.status} ${responseText.slice(0, 500)}`,
    );
  }

  const data = JSON.parse(responseText) as GeminiResponse;

  const parts =
    data.candidates?.flatMap(
      candidate => candidate.content?.parts ?? [],
    ) ?? [];

  const imagePart = parts.find(
    part => part.inlineData?.data || part.inline_data?.data,
  );

  const base64 =
    imagePart?.inlineData?.data ??
    imagePart?.inline_data?.data;

  const mimeType =
    imagePart?.inlineData?.mimeType ??
    imagePart?.inline_data?.mime_type ??
    'image/png';

  if (!base64) {
    const modelText = parts
      .map(part => part.text)
      .filter(Boolean)
      .join('\n');

    throw new Error(
      `接口没有返回图片。模型返回内容：${modelText || '无'}`,
    );
  }

  const extension =
    mimeType === 'image/jpeg'
      ? 'jpg'
      : mimeType === 'image/webp'
        ? 'webp'
        : 'png';

  const outputDir = path.resolve('data/generated');
  await mkdir(outputDir, { recursive: true });

  const filePath = path.join(
    outputDir,
    `${randomUUID()}.${extension}`,
  );

  await writeFile(filePath, Buffer.from(base64, 'base64'));

  return {
    success: true,
    filePath,
    mimeType,
    prompt,
  };
}