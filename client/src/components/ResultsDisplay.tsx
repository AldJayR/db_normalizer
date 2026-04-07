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
  const candidateKeys = Array.isArray(results.candidateKeys) ? results.candidateKeys : [];
  const dependencies = Array.isArray(results.functionalDependencies) ? results.functionalDependencies : [];
  const normalization = results.normalization || ({} as NormalizationResult['normalization']);
  const businessRules = Array.isArray(results.businessRules) ? results.businessRules : [];
  const verificationWarnings = Array.isArray(results.verification?.warnings) ? results.verification.warnings : [];
  const metaWarnings = Array.isArray(results.meta?.warnings) ? results.meta?.warnings : [];
  const mergedWarnings = [...new Set([...(verificationWarnings || []), ...(metaWarnings || [])])];

  const safeVerification = {
    losslessJoin: typeof results.verification?.losslessJoin === 'boolean' ? results.verification.losslessJoin : false,
    losslessJoinExplanation:
      typeof results.verification?.losslessJoinExplanation === 'string' && results.verification.losslessJoinExplanation.trim()
        ? results.verification.losslessJoinExplanation
        : 'No lossless join verification details were returned.',
    dependencyPreservation:
      typeof results.verification?.dependencyPreservation === 'boolean'
        ? results.verification.dependencyPreservation
        : false,
    dependencyPreservationExplanation:
      typeof results.verification?.dependencyPreservationExplanation === 'string' &&
      results.verification.dependencyPreservationExplanation.trim()
        ? results.verification.dependencyPreservationExplanation
        : 'No dependency preservation details were returned.',
    warnings: mergedWarnings,
  };

  const hasInferredRules = !!results.meta?.inferredBusinessRules;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

      {hasInferredRules && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900">
          Business rules were inferred from attributes. Review them before treating this normalization as final.
        </div>
      )}
      
      {/* Top Summary Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <CandidateKeys keys={candidateKeys} />
        <FunctionalDependencies dependencies={dependencies} />
      </div>

      {businessRules.length > 0 && (
        <BusinessRules rules={businessRules} />
      )}

      {/* Normalization Steps */}
      <div className="space-y-5 pt-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
          Normalization Steps
        </h2>
        <div className="space-y-6">
          {['1NF', '2NF', '3NF'].map((nf) => (
            <NormalizationStep
              key={nf}
              nf={nf}
              data={
                normalization?.[nf] || {
                  description: `No ${nf} details were returned by the model.`,
                  tables: [],
                  notes: [],
                }
              }
            />
          ))}
        </div>
      </div>

      <div className="pt-4">
        <Verification data={safeVerification} />
      </div>
    </div>
  );
}
