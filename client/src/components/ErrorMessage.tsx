import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="mt-5 bg-red-50/80 border border-red-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-1 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm font-medium text-red-800 leading-relaxed">{message}</div>
      </div>
    </div>
  );
}
