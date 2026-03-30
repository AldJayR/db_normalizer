import { Key } from 'lucide-react';
import type { CandidateKey } from '../types';

interface CandidateKeysProps {
  keys: CandidateKey[];
}

export function CandidateKeys({ keys }: CandidateKeysProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-full">
      <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
        <Key className="w-4 h-4 text-emerald-600" /> 
        Candidate Keys
        <span className="bg-slate-100 text-slate-600 py-0.5 px-2.5 rounded-full text-xs ml-auto font-medium">
          {keys.length} found
        </span>
      </h3>
      <div className="space-y-3 flex-1">
        {keys.map((ck, i) => (
          <div key={i} className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 transition-colors hover:bg-slate-100">
            <div className="font-mono text-sm text-slate-900 font-semibold break-words">
              {ck.key.join(', ')}
            </div>
            {ck.closure && ck.closure.length > 0 && (
              <div className="text-xs text-slate-500 mt-2 break-words leading-relaxed">
                <span className="font-medium text-slate-700">Closure:</span> {ck.closure.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
