'use client';

import React, { useState } from 'react';
import { Loader2, Code, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

interface DevinResponse {
  session_id: string;
  url: string;
  is_new_session: boolean;
}

export default function DevinInterface() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState<'pull-request' | 'code' | 'generate'>('pull-request');
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState<DevinResponse | null>(null);

  const handleAnalysisTypeChange = (value: 'pull-request' | 'code' | 'generate') => {
    setAnalysisType(value);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLanguage(e.target.value);
  };

  const handleContextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContext(e.target.value);
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      let requestBody;

      switch (analysisType) {
        case 'pull-request':
          if (!prompt.trim()) {
            toast.error('Pull request URL is required');
            return;
          }
          requestBody = {
            type: 'pull-request',
            content: { url: prompt }
          };
          break;

        case 'code':
          if (!code.trim()) {
            toast.error('Code is required');
            return;
          }
          requestBody = {
            type: 'code',
            content: { code },
            context: context || undefined
          };
          break;

        case 'generate':
          if (!prompt.trim()) {
            toast.error('Description is required');
            return;
          }
          requestBody = {
            type: 'generate',
            content: { 
              description: prompt,
              language: language || undefined
            }
          };
          break;
      }

      const response = await fetch('/api/devin/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }

      const data: DevinResponse = await response.json();
      setResult(data);
      toast.success('Session created successfully');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => {
    switch (analysisType) {
      case 'pull-request':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="pr-url" className="block text-sm font-medium mb-1">
                Pull Request URL
              </label>
              <input
                id="pr-url"
                type="text"
                placeholder="https://github.com/example/repo/pull/123"
                value={prompt}
                onChange={handlePromptChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'code':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="code-input" className="block text-sm font-medium mb-1">
                Code
              </label>
              <textarea
                id="code-input"
                placeholder="Paste your code here..."
                value={code}
                onChange={handleCodeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] font-mono"
              />
            </div>
            <div>
              <label htmlFor="context" className="block text-sm font-medium mb-1">
                Context (optional)
              </label>
              <textarea
                id="context"
                placeholder="Additional context about the code..."
                value={context}
                onChange={handleContextChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'generate':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                id="description"
                placeholder="Describe what code you want to generate..."
                value={prompt}
                onChange={handlePromptChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="language" className="block text-sm font-medium mb-1">
                Programming Language (optional)
              </label>
              <input
                id="language"
                type="text"
                placeholder="e.g., TypeScript, Python, JavaScript"
                value={language}
                onChange={handleLanguageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
            <Code className="h-5 w-5" />
            Devin AI Integration
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Analyze pull requests, review code, or generate new code using Devin AI
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Analysis Type Selection */}
          <div>
            <label htmlFor="analysis-type" className="block text-sm font-medium mb-2">
              Analysis Type
            </label>
            <select
              id="analysis-type"
              value={analysisType}
              onChange={(e) => handleAnalysisTypeChange(e.target.value as 'pull-request' | 'code' | 'generate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pull-request">
                Review Pull Request
              </option>
              <option value="code">
                Analyze Code
              </option>
              <option value="generate">
                Generate Code
              </option>
            </select>
          </div>

          {/* Dynamic Form */}
          {renderForm()}

          {/* Submit Button */}
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Analyze
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Analysis Results</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Session ID: {result.session_id} | New Session: {result.is_new_session ? 'Yes' : 'No'}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Session URL:</h4>
              <a 
                href={result.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all"
              >
                {result.url}
              </a>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Click the link above to view your Devin AI session
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
