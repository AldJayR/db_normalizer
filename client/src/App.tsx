import { useState } from 'react'
import type { NormalizationResult } from './types';
import { Header } from './components/Header';
import { ErrorMessage } from './components/ErrorMessage';
import { InputForm } from './components/InputForm';
import { ResultsDisplay } from './components/ResultsDisplay';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [step, setStep] = useState<string>('input');
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to normalize');
      }

      const data = await response.json();
      setResults(data);
      setStep('results');
    } catch (err: unknown) {
      console.error('Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process normalization. Please check your input and try again.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetSystem = (): void => {
    setStep('input');
    setAttributes('');
    setBusinessRules('');
    setResults(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-4 md:p-8">
          <Header />
          <ErrorMessage message={error} />

          {step === 'input' && (
            <InputForm
              attributes={attributes}
              setAttributes={setAttributes}
              businessRules={businessRules}
              setBusinessRules={setBusinessRules}
              processNormalization={processNormalization}
              isProcessing={isProcessing}
              setError={setError}
            />
          )}

          {step === 'results' && results && (
            <ResultsDisplay results={results} resetSystem={resetSystem} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;