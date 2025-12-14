import { AlertCircle, CheckCircle } from 'lucide-react';
import type { VerificationData } from '../types';

interface VerificationProps {
  data: VerificationData;
}

export function Verification({ data }: VerificationProps) {
  return (
    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
      <h3 className="font-bold text-gray-900 mb-3 text-lg">Verification Results</h3>
      
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          {data.losslessJoin ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <div className="font-semibold text-gray-900">Lossless Join Property</div>
            <div className="text-sm text-gray-700">{data.losslessJoinExplanation}</div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          {data.dependencyPreservation ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <div className="font-semibold text-gray-900">Dependency Preservation</div>
            <div className="text-sm text-gray-700">{data.dependencyPreservationExplanation}</div>
          </div>
        </div>

        {data.warnings && data.warnings.length > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="font-semibold text-yellow-900 mb-1">Warnings:</div>
            {data.warnings.map((warn, i) => (
              <div key={i} className="text-sm text-yellow-800">⚠️ {warn}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
