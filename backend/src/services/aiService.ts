import axios from 'axios';

export class AIService {
  private ollamaBaseUrl: string;
  private ollamaModel: string;

  constructor() {
    this.ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2:1b'; // Default to installed model
  }

  private async callOllama(systemPrompt: string, userPrompt: string, format: 'json' | 'text' = 'text'): Promise<any> {
    try {
      const response = await axios.post(`${this.ollamaBaseUrl}/api/chat`, {
        model: this.ollamaModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        format: format,
        stream: false,
      });
      return response.data.message.content;
    } catch (error: any) {
      console.error('Error calling Ollama:', error);
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Ollama is not running. Please start Ollama locally (run "ollama serve").');
      }
      if (error.response) {
         throw new Error(`Ollama Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
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
      const content = await this.callOllama(systemPrompt, userPrompt, 'json');
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
        const content = await this.callOllama(systemPrompt, userPrompt, 'json');
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
      
      Requirements:
      - Use appropriate emojis if the tone allows.
      - Structure with clear sections (e.g., New Features, Fixes) if appropriate.
      - Keep it under 500 characters if possible, but comprehensive.
      - Return ONLY the generated text, no surrounding quotes.
    `;

    try {
      const content = await this.callOllama(systemPrompt, userPrompt, 'text');
      return content || '';
    } catch (error) {
      console.error('Error generating release notes:', error);
      throw error;
    }
  }
}