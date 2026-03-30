import { ArrowRightLeft } from 'lucide-react';
import type { FunctionalDependency } from '../types';

interface FunctionalDependenciesProps {
  dependencies: FunctionalDependency[];
}

export function FunctionalDependencies({ dependencies }: FunctionalDependenciesProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-full">
      <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
        <ArrowRightLeft className="w-4 h-4 text-indigo-600" /> 
        Dependencies
        <span className="bg-slate-100 text-slate-600 py-0.5 px-2.5 rounded-full text-xs ml-auto font-medium">
          {dependencies.length} found
        </span>
      </h3>
      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar flex-1">
        {dependencies.map((fd, i) => (
          <div key={i} className="bg-slate-50 border border-slate-100 rounded-lg p-3 transition-colors hover:bg-slate-100">
            <div className="font-mono text-sm text-indigo-900 font-semibold flex items-center flex-wrap gap-2">
              <span>{fd.left.join(', ')}</span>
              <span className="text-slate-400">→</span>
              <span>{fd.right.join(', ')}</span>
            </div>
            <div className="text-xs text-slate-500 mt-2 leading-relaxed">{fd.explanation}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
