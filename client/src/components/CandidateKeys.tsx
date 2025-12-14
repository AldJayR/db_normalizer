import { Key } from 'lucide-react';
import type { CandidateKey } from '../types';

interface CandidateKeysProps {
  keys: CandidateKey[];
}

export function CandidateKeys({ keys }: CandidateKeysProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
        <Key className="w-5 h-5" /> Candidate Keys ({keys.length})
      </h3>
      <div className="space-y-2">
        {keys.map((ck, i) => (
          <div key={i} className="bg-white rounded p-2">
            <div className="font-mono text-green-800 font-semibold">
              Key {i + 1}: {ck.key.join(', ')}
            </div>
            <div className="text-sm text-green-600 mt-1">
              Closure: {ck.closure.join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
