import type { FunctionalDependency } from '../types';

interface FunctionalDependenciesProps {
  dependencies: FunctionalDependency[];
}

export function FunctionalDependencies({ dependencies }: FunctionalDependenciesProps) {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
        <span className="text-lg">🔗</span> Functional Dependencies ({dependencies.length})
      </h3>
      <div className="space-y-2">
        {dependencies.map((fd, i) => (
          <div key={i} className="bg-white rounded p-2">
            <div className="font-mono text-purple-800 font-semibold">
              {fd.left.join(', ')} → {fd.right.join(', ')}
            </div>
            <div className="text-sm text-purple-600 mt-1">{fd.explanation}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
