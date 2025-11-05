import axios from 'axios';

export interface DevinSessionRequest {
  prompt: string;
  idempotent?: boolean;
}

export interface DevinSessionResponse {
  session_id: string;
  url: string;
  is_new_session: boolean;
}

interface DevinSession {
  session_id: string;
  url: string;
  is_new_session: boolean;
  status?: string;
  result?: unknown;
  error?: string;
}

class DevinService {
  private baseURL = 'https://api.devin.ai/v1';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.DEVIN_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Devin API key not found in environment variables');
    }
  }

  async createSession(request: DevinSessionRequest): Promise<DevinSessionResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/sessions`,
        request,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(`Devin API error: ${errorMessage}`);
      }
      throw error;
    }
  }

  async getSession(sessionId: string): Promise<DevinSession> {
    try {
      const response = await axios.get(
        `${this.baseURL}/sessions/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(`Devin API error: ${errorMessage}`);
      }
      throw error;
    }
  }

  async waitForSessionCompletion(
    sessionId: string,
    maxWaitTime: number = 300000, // 5 minutes
    pollInterval: number = 5000 // 5 seconds
  ): Promise<DevinSession> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const session = await this.getSession(sessionId);
        
        if (session.status === 'completed' || session.status === 'failed') {
          return session;
        }
        
        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error('Error polling session status:', error);
        throw error;
      }
    }
    
    throw new Error(`Session ${sessionId} did not complete within ${maxWaitTime}ms`);
  }

  async analyzePullRequest(prUrl: string): Promise<DevinSessionResponse> {
    const prompt = `Review the pull request at ${prUrl}`;
    
    const session = await this.createSession({
      prompt,
      idempotent: true,
    });

    // Return session URL for user to check manually
    return session;
  }

  async analyzeCode(code: string, context?: string): Promise<DevinSessionResponse> {
    const prompt = context 
      ? `Analyze this code with the following context: ${context}\n\nCode:\n${code}`
      : `Analyze this code:\n${code}`;
    
    const session = await this.createSession({
      prompt,
      idempotent: false,
    });

    return session;
  }

  async generateCode(description: string, language?: string): Promise<DevinSessionResponse> {
    const prompt = language 
      ? `Generate ${language} code for: ${description}`
      : `Generate code for: ${description}`;
    
    const session = await this.createSession({
      prompt,
      idempotent: false,
    });

    return session;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const devinService = new DevinService();
