import type { NormalizationResult } from '../types';
import { BusinessRules } from './BusinessRules';
import { FunctionalDependencies } from './FunctionalDependencies';
import { CandidateKeys } from './CandidateKeys';
import { NormalizationStep } from './NormalizationStep';
import { Verification } from './Verification';

interface ResultsDisplayProps {
  results: NormalizationResult;
  resetSystem: () => void;
}

export function ResultsDisplay({ results, resetSystem }: ResultsDisplayProps) {
  return (
    <div className="space-y-6">
      <BusinessRules rules={results.businessRules} />
      <FunctionalDependencies dependencies={results.functionalDependencies} />
      <CandidateKeys keys={results.candidateKeys} />

      {['1NF', '2NF', '3NF'].map((nf) => (
        <NormalizationStep key={nf} nf={nf} data={results.normalization[nf]} />
      ))}

      <Verification data={results.verification} />

      <button
        onClick={resetSystem}
        className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
      >
        Start New Normalization
      </button>
    </div>
  );
}
