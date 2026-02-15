import axios from 'axios';
import { configService } from './configService';
import OpenAI from 'openai';

export class AIService {
  
  private async getClient(): Promise<{ type: 'ollama' | 'openai', client: any, config: any }> {
    const config = await configService.getConfig();
    if (config.aiProvider === 'openai') {
      if (!config.openai.apiKey) throw new Error('OpenAI API Key is missing in settings');
      return { 
        type: 'openai', 
        client: new OpenAI({ apiKey: config.openai.apiKey }), 
        config: config.openai 
      };
    } else {
      return { 
        type: 'ollama', 
        client: null, 
        config: config.ollama 
      };
    }
  }

  private async callLLM(systemPrompt: string, userPrompt: string, format: 'json' | 'text' = 'text'): Promise<string> {
    const { type, client, config } = await this.getClient();

    if (type === 'openai') {
      try {
        const completion = await client.chat.completions.create({
          model: config.model || 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: format === 'json' ? { type: 'json_object' } : { type: 'text' },
        });
        return completion.choices[0].message.content || '';
      } catch (error: any) {
        console.error('OpenAI Error:', error);
        throw new Error(`OpenAI Error: ${error.message}`);
      }
    } else {
      // Ollama
      try {
        const response = await axios.post(`${config.baseUrl}/api/chat`, {
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          format: format,
          stream: false,
        });
        return response.data.message.content;
      } catch (error: any) {
        console.error('Ollama Error:', error);
        if (error.code === 'ECONNREFUSED') {
          throw new Error(`Ollama is not running at ${config.baseUrl}. Please start Ollama or check settings.`);
        }
        if (error.response) {
           throw new Error(`Ollama Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        }
        throw error;
      }
    }
  }

  async generateMetadata(appName: string, features: string[], keywords: string[], language: string = 'en'): Promise<any> {
    const systemPrompt = 'You are a helpful assistant that generates App Store metadata in JSON format.';
    const userPrompt = `
      You are an ASO (App Store Optimization) expert.
      Generate metadata for a mobile app with the following details:
      App Name: ${appName}
      Key Features: ${features.join(', ')}
      Keywords: ${keywords.join(', ')}
      Target Language: ${language}

      Please provide the output in JSON format with the following fields:
      - title (max 30 chars for Play Store, 30 for App Store)
      - short_description (max 80 chars)
      - full_description (max 4000 chars, use HTML formatting for Play Store compatibility like <b>, <br>)
      - keywords (comma separated, max 100 chars for App Store)
      - promotional_text (max 170 chars)
    `;

    try {
      const content = await this.callLLM(systemPrompt, userPrompt, 'json');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating metadata:', error);
      throw error;
    }
  }

  async translateMetadata(metadata: any, targetLanguages: string[]): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    const systemPrompt = 'You are a helpful assistant that translates App Store metadata in JSON format.';

    const promises = targetLanguages.map(async (lang) => {
      const userPrompt = `
      You are an expert App Store localization specialist.
      Translate the following App Store metadata to ${lang}. 
      Ensure the translation sounds native, persuasive, and follows ASO best practices for the target culture.
      Keep character limits in mind (Title: 30, Short Desc: 80).
      
      Input JSON: ${JSON.stringify(metadata)}
      
      Output in pure JSON format with the same keys (title, short_description, full_description, keywords, promotional_text).
      `;
      
      try {
        const content = await this.callLLM(systemPrompt, userPrompt, 'json');
        results[lang] = content ? JSON.parse(content) : {};
      } catch (e) {
        console.error(`Failed to translate to ${lang}`, e);
        results[lang] = { error: 'Translation failed' };
      }
    });

    await Promise.all(promises);
    return results;
  }

  async generateReleaseNotes(input: string, tone: string = 'excited'): Promise<string> {
    const systemPrompt = 'You are a helpful assistant that writes App Store release notes.';
    const userPrompt = `
      You are an App Store Manager.
      Convert the following rough bullet points into a professional, engaging "What's New" release note for an App Store update.
      
      Tone: ${tone} (e.g., excited, professional, concise, humorous)
      Input Points: 
      ${input}
    `;
    
    return this.callLLM(systemPrompt, userPrompt, 'text');
  }
}
