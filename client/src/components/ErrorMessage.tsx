import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-red-800">{message}</div>
      </div>
    </div>
  );
}
