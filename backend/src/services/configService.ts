import fs from 'fs-extra';
import path from 'path';

const CONFIG_FILE = process.env.USER_DATA_PATH 
  ? path.join(process.env.USER_DATA_PATH, 'config.json')
  : path.join(process.cwd(), 'config.json');

console.log('Loading config from:', CONFIG_FILE);

export interface AppConfig {
  aiProvider: 'ollama' | 'openai';
  ollama: {
    baseUrl: string;
    model: string;
  };
  openai: {
    apiKey: string;
    model: string;
  };
}

const DEFAULT_CONFIG: AppConfig = {
  aiProvider: 'ollama',
  ollama: {
    baseUrl: 'http://localhost:11434',
    model: 'llama3.2:1b',
  },
  openai: {
    apiKey: '',
    model: 'gpt-4o',
  },
};

export class ConfigService {
  async getConfig(): Promise<AppConfig> {
    try {
      if (await fs.pathExists(CONFIG_FILE)) {
        const currentConfig = await fs.readJson(CONFIG_FILE);
        return { ...DEFAULT_CONFIG, ...currentConfig };
      }
    } catch (error) {
      console.error('Error reading config file:', error);
    }
    return DEFAULT_CONFIG;
  }

  async saveConfig(config: Partial<AppConfig>): Promise<AppConfig> {
    const current = await this.getConfig();
    const newConfig = { ...current, ...config };
    try {
      await fs.writeJson(CONFIG_FILE, newConfig, { spaces: 2 });
    } catch (error) {
      console.error('Error writing config file:', error);
      throw new Error('Failed to save configuration');
    }
    return newConfig;
  }
}

export const configService = new ConfigService();
