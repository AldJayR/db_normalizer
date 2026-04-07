import { useState } from 'react';
import { Database } from 'lucide-react';
import type { NormalizationResult } from './types';
import { Header } from './components/Header';
import { ErrorMessage } from './components/ErrorMessage';
import { InputForm } from './components/InputForm';
import { ResultsDisplay } from './components/ResultsDisplay';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [attributes, setAttributes] = useState<string>('');
  const [businessRules, setBusinessRules] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [results, setResults] = useState<NormalizationResult | null>(null);
  const [error, setError] = useState<string>('');

  const processNormalization = async (): Promise<void> => {
    if (!attributes.trim()) {
      setError('Please enter at least one attribute');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/normalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attributes,
          businessRules
        })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to normalize';
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
          const errorData = await response.json();
          if (errorData && typeof errorData.message === 'string' && errorData.message.trim()) {
            errorMessage = errorData.message;
          }
        } else {
          const text = await response.text();
          if (text.trim()) {
            errorMessage = text.trim();
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      setResults(data);
    } catch (err: unknown) {
      console.error('Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process normalization. Please check your input and try again.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetSystem = (): void => {
    setAttributes('');
    setBusinessRules('');
    setResults(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <Header />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mt-6">
          {/* Left Column: Input */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 md:p-6 sticky top-6">
              <InputForm
                attributes={attributes}
                setAttributes={setAttributes}
                businessRules={businessRules}
                setBusinessRules={setBusinessRules}
                processNormalization={processNormalization}
                isProcessing={isProcessing}
                setError={setError}
                hasResults={!!results}
                resetSystem={resetSystem}
              />
              <ErrorMessage message={error} />
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8 xl:col-span-9">
            {results ? (
              <ResultsDisplay results={results} />
            ) : (
              <div className="h-full min-h-[400px] flex items-center justify-center bg-slate-100/50 rounded-xl border-2 border-slate-200 border-dashed">
                <div className="text-center max-w-md p-6">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Database className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready to Normalize</h3>
                  <p className="text-slate-500">
                    Enter your attributes and business rules on the left, then click normalize to see the AI-generated functional dependencies, candidate keys, and normalized tables.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
