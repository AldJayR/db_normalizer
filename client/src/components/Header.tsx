import { Database, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-sm">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            DB Normalizer
          </h1>
          <p className="text-sm text-slate-500 font-medium">Technical Workbench</p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-indigo-50/80 border border-indigo-100 px-3 py-1.5 rounded-full text-sm font-medium text-indigo-700">
        <Sparkles className="w-4 h-4 text-indigo-500" />
        <span>Powered by Gemini</span>
      </div>
    </header>
  );
}
