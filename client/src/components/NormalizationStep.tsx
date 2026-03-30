import { Layers, AlertTriangle, Info } from 'lucide-react';
import type { NormalizationStepData } from '../types';

interface NormalizationStepProps {
  nf: string;
  data: NormalizationStepData;
}

export function NormalizationStep({ nf, data }: NormalizationStepProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 text-indigo-700 p-1.5 rounded-lg shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg tracking-tight">{nf} Form</h3>
          </div>
        </div>
      </div>
      
      <div className="p-5 space-y-6">
        {data.description && (
          <p className="text-slate-600 text-sm leading-relaxed">{data.description}</p>
        )}

        {/* Violations/Dependencies highlighting */}
        {nf === '2NF' && (data.partialDependencies?.length ?? 0) > 0 && (
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Partial Dependencies Resolved
            </h4>
            <ul className="space-y-2.5">
              {data.partialDependencies?.map((pd, i) => (
                <li key={i} className="text-sm text-amber-800 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                  <span className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-xs shrink-0 whitespace-nowrap border border-amber-200 shadow-sm">{pd.fd}</span>
                  <span className="leading-relaxed">{pd.explanation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {nf === '3NF' && (data.transitiveDependencies?.length ?? 0) > 0 && (
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Transitive Dependencies Resolved
            </h4>
            <ul className="space-y-2.5">
              {data.transitiveDependencies?.map((td, i) => (
                <li key={i} className="text-sm text-amber-800 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                  <span className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-xs shrink-0 whitespace-nowrap border border-amber-200 shadow-sm">{td.fd}</span>
                  <span className="leading-relaxed">{td.explanation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tables */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Resulting Tables</h4>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {data.tables.map((table, i) => (
              <div key={i} className="border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm bg-white">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 font-mono font-bold text-sm text-slate-900 flex justify-between items-center">
                  {table.name}
                  <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest bg-slate-200/50 border border-slate-200 px-2 py-0.5 rounded-full">Table</span>
                </div>
                <div className="p-4 flex-1 space-y-4">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Attributes</div>
                    <div className="text-sm text-slate-700 leading-relaxed font-medium">{table.attributes.join(', ')}</div>
                  </div>
                  
                  <div>
                    <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Primary Key</div>
                    <div className="font-mono text-sm text-indigo-700 font-semibold bg-indigo-50 border border-indigo-100 inline-block px-2 py-0.5 rounded-md shadow-sm">
                      {table.primaryKey.join(', ')}
                    </div>
                  </div>
                  
                  {table.foreignKeys && table.foreignKeys.length > 0 && (
                    <div className="pt-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Foreign Keys</div>
                      <div className="space-y-2">
                        {table.foreignKeys.map((fk, j) => (
                          <div key={j} className="font-mono text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-800">{fk.attributes.join(', ')}</span>
                            <span className="text-slate-400">→</span>
                            <span className="text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{fk.references}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {data.notes && data.notes.length > 0 && (
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-2">
              <Info className="w-4 h-4 text-blue-600" />
              Notes
            </h4>
            <ul className="space-y-1.5">
              {data.notes.map((note, i) => (
                <li key={i} className="text-sm text-blue-800 flex items-start gap-2.5">
                  <span className="mt-1 text-[10px] leading-none opacity-50 flex-shrink-0">●</span>
                  <span className="leading-relaxed">{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
