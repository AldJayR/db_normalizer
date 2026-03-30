import type { NormalizationResult } from '../types';
import { BusinessRules } from './BusinessRules';
import { FunctionalDependencies } from './FunctionalDependencies';
import { CandidateKeys } from './CandidateKeys';
import { NormalizationStep } from './NormalizationStep';
import { Verification } from './Verification';

interface ResultsDisplayProps {
  results: NormalizationResult;
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Top Summary Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <CandidateKeys keys={results.candidateKeys} />
        <FunctionalDependencies dependencies={results.functionalDependencies} />
      </div>

      {results.businessRules && results.businessRules.length > 0 && (
        <BusinessRules rules={results.businessRules} />
      )}

      {/* Normalization Steps */}
      <div className="space-y-5 pt-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
          Normalization Steps
        </h2>
        <div className="space-y-6">
          {['1NF', '2NF', '3NF'].map((nf) => (
            <NormalizationStep key={nf} nf={nf} data={results.normalization[nf]} />
          ))}
        </div>
      </div>

      <div className="pt-4">
        <Verification data={results.verification} />
      </div>
    </div>
  );
}
