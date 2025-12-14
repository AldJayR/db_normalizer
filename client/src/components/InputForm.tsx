import { Loader, Sparkles } from 'lucide-react';

interface InputFormProps {
  attributes: string;
  setAttributes: (value: string) => void;
  businessRules: string;
  setBusinessRules: (value: string) => void;
  processNormalization: () => void;
  isProcessing: boolean;
  setError: (value: string) => void;
}

export function InputForm({
  attributes,
  setAttributes,
  businessRules,
  setBusinessRules,
  processNormalization,
  isProcessing,
  setError
}: InputFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Enter Attributes (comma-separated)
        </label>
        <input
          type="text"
          value={attributes}
          onChange={(e) => {
            setAttributes(e.target.value);
            setError('');
          }}
          placeholder="e.g., StudentID, StudentName, CourseID, CourseName, InstructorID, InstructorName"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Business Rules (Optional)
        </label>
        <textarea
          value={businessRules}
          onChange={(e) => setBusinessRules(e.target.value)}
          placeholder="Optional: Describe your business rules or functional dependencies.
e.g., Each student has one name
Each course is taught by one instructor
Or use FD notation: StudentID -> StudentName"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-32"
        />
        <p className="text-sm text-gray-500 mt-2">
          Leave empty to let AI infer realistic business rules from attribute names
        </p>
      </div>

      <button
        onClick={processNormalization}
        disabled={!attributes.trim() || isProcessing}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Processing Normalization...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Normalize with AI
          </>
        )}
      </button>
    </div>
  );
}
