import { Database } from 'lucide-react';

export function Header() {
  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-6">
        <Database className="w-8 h-8 text-indigo-600 shrink-0" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          AI Database Normalization System
        </h1>
      </div>

      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="text-sm text-blue-800">
          <strong>Powered by:</strong> Gemini 2.5 Flash
        </div>
      </div>
    </>
  );
}
