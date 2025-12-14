import { CheckCircle } from 'lucide-react';
import type { NormalizationStepData } from '../types';

interface NormalizationStepProps {
  nf: string;
  data: NormalizationStepData;
}

export function NormalizationStep({ nf, data }: NormalizationStepProps) {
  return (
    <div className="border-2 border-indigo-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="w-6 h-6 text-indigo-600" />
        <h3 className="font-bold text-gray-900 text-xl">{nf}</h3>
      </div>

      <p className="text-gray-700 mb-3">{data.description}</p>

      {nf === '2NF' && (data.partialDependencies?.length ?? 0) > 0 && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="font-semibold text-yellow-900 mb-1">
            Partial Dependencies Found:
          </div>
          {data.partialDependencies?.map((pd, i) => (
            <div key={i} className="text-sm text-yellow-800">
              • {pd.fd}: {pd.explanation}
            </div>
          ))}
        </div>
      )}

      {nf === '3NF' && (data.transitiveDependencies?.length ?? 0) > 0 && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="font-semibold text-yellow-900 mb-1">
            Transitive Dependencies Found:
          </div>
          {data.transitiveDependencies?.map((td, i) => (
            <div key={i} className="text-sm text-yellow-800">
              • {td.fd}: {td.explanation}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <div className="font-semibold text-gray-700">Tables:</div>
        {data.tables.map((table, i) => (
          <div
            key={i}
            className="bg-linear-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200"
          >
            <div className="font-bold text-gray-900 mb-2 text-lg">
              {table.name}
            </div>

            <div className="space-y-1">
              <div className="text-sm break-words">
                <span className="font-semibold text-gray-700">Attributes:</span>
                <span className="ml-2 text-gray-800">
                  {table.attributes.join(', ')}
                </span>
              </div>

              <div className="text-sm break-words">
                <span className="font-semibold text-indigo-700">
                  Primary Key:
                </span>
                <span className="ml-2 text-indigo-800 font-mono">
                  {table.primaryKey.join(', ')}
                </span>
              </div>

              {table.foreignKeys && table.foreignKeys.length > 0 && (
                <div className="text-sm">
                  <span className="font-semibold text-purple-700">
                    Foreign Keys:
                  </span>
                  <div className="ml-2 text-purple-800">
                    {table.foreignKeys.map((fk, j) => (
                      <div key={j} className="font-mono break-words">
                        {fk.attributes.join(', ')} → {fk.references}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {data.notes && data.notes.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="font-semibold text-blue-900 mb-1">Notes:</div>
          {data.notes.map((note, i) => (
            <div key={i} className="text-sm text-blue-800">
              • {note}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
