import { FileText } from 'lucide-react';

interface BusinessRulesProps {
  rules: string[];
}

export function BusinessRules({ rules }: BusinessRulesProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
        <FileText className="w-4 h-4 text-blue-600" /> 
        Business Rules
      </h3>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        {rules.map((rule, i) => (
          <li key={i} className="text-sm text-slate-700 flex items-start gap-2.5">
            <span className="text-blue-500 mt-1 flex-shrink-0 text-[10px]">●</span>
            <span className="leading-relaxed">{rule}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
