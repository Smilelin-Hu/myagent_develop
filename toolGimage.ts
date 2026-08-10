import { generateGeminiImage } from './src/gemini-image.js';

async function main() {
    const result = await generateGeminiImage({
        prompt: '一座未来城市，电影级灯光',
        aspectRatio: '16:9',
      });
    
    console.log(result);
}

main().catch(console.error);
