import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { VerificationData } from '../types';

interface VerificationProps {
  data: VerificationData;
}

export function Verification({ data }: VerificationProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-slate-700" />
        Verification Report
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className={`p-4 rounded-xl border ${data.losslessJoin ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'}`}>
          <div className="flex items-center gap-2 mb-2.5">
            {data.losslessJoin ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <h4 className={`font-semibold ${data.losslessJoin ? 'text-emerald-900' : 'text-red-900'}`}>
              Lossless Join
            </h4>
          </div>
          <p className={`text-sm leading-relaxed ${data.losslessJoin ? 'text-emerald-800' : 'text-red-800'}`}>
            {data.losslessJoinExplanation}
          </p>
        </div>

        <div className={`p-4 rounded-xl border ${data.dependencyPreservation ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/50 border-amber-200'}`}>
          <div className="flex items-center gap-2 mb-2.5">
            {data.dependencyPreservation ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            )}
            <h4 className={`font-semibold ${data.dependencyPreservation ? 'text-emerald-900' : 'text-amber-900'}`}>
              Dependency Preserving
            </h4>
          </div>
          <p className={`text-sm leading-relaxed ${data.dependencyPreservation ? 'text-emerald-800' : 'text-amber-800'}`}>
            {data.dependencyPreservationExplanation}
          </p>
        </div>
      </div>

      {data.warnings && data.warnings.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-800 mb-2.5 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-slate-500" />
            Additional Warnings
          </h4>
          <ul className="space-y-2">
            {data.warnings.map((warn, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start gap-2.5">
                <span className="text-slate-400 mt-1 flex-shrink-0 text-[10px]">●</span>
                <span className="leading-relaxed">{warn}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
