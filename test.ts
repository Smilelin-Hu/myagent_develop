import 'dotenv/config';                                                                                                                 
import { generateText } from 'ai';                                                                                                      
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';                                                                     
                                                                                                                                        
const provider = createOpenAICompatible({                                                                                               
    name: 'my-provider',                                                                                                                  
    baseURL: process.env.PROVIDER_BASE_URL!,                                                                                              
    apiKey: process.env.PROVIDER_API_KEY!,                                                                                                
});                                                                                                                                     


async function main() {                                                                                                                  
    const { text } = await generateText({                                                                                                 
      model: provider('gpt-5.6-sol'),                                                                                                        
      prompt: '你是什么模型呀',                                                                                                                     
    });                                                                                                                                   
                                                                                                                                          
    console.log(text);                                                                                                                    
  }                                                                                                                                       
                                                                                                                                          
main().catch(console.error); 

// const { text } = await generateText({                                                                                                   
//     model: provider('gpt-5.6-sol'),                                                                                                
//     prompt: '你好',                                                                                                                       
// });                                                                                                                                     
                                                                                                                                        
// console.log(text);