import { Loader2, Play, RotateCcw } from 'lucide-react';

interface InputFormProps {
  attributes: string;
  setAttributes: (value: string) => void;
  businessRules: string;
  setBusinessRules: (value: string) => void;
  processNormalization: () => void;
  isProcessing: boolean;
  setError: (value: string) => void;
  hasResults?: boolean;
  resetSystem?: () => void;
}

const EXAMPLES = [
  {
    label: "E-Commerce",
    attrs: "OrderID, CustomerID, CustomerName, ProductID, ProductName, Price, Quantity",
    rules: "OrderID, ProductID -> Quantity\nCustomerID -> CustomerName\nProductID -> ProductName, Price\nOrderID -> CustomerID"
  },
  {
    label: "University",
    attrs: "StudentID, StudentName, Major, CourseID, CourseName, InstructorID, InstructorName, Grade",
    rules: "StudentID -> StudentName, Major\nCourseID -> CourseName, InstructorID\nInstructorID -> InstructorName\nStudentID, CourseID -> Grade"
  }
];

export function InputForm({
  attributes,
  setAttributes,
  businessRules,
  setBusinessRules,
  processNormalization,
  isProcessing,
  setError,
  hasResults,
  resetSystem
}: InputFormProps) {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-sm font-semibold text-slate-800">
            Attributes <span className="text-red-500">*</span>
          </label>
        </div>
        <textarea
          value={attributes}
          onChange={(e) => {
            setAttributes(e.target.value);
            setError('');
          }}
          placeholder="e.g., StudentID, StudentName, CourseID..."
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow placeholder:text-slate-400 min-h-[100px] resize-y bg-slate-50 focus:bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-1.5">
          Business Rules <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <textarea
          value={businessRules}
          onChange={(e) => setBusinessRules(e.target.value)}
          placeholder="e.g., StudentID -> StudentName"
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow placeholder:text-slate-400 min-h-[140px] resize-y font-mono bg-slate-50 focus:bg-white"
        />
      </div>

      <div className="pt-1">
        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Try an Example</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => {
                setAttributes(ex.attrs);
                setBusinessRules(ex.rules);
                setError('');
              }}
              className="text-xs bg-white hover:bg-slate-50 text-slate-700 py-1.5 px-3 rounded-md border border-slate-200 shadow-sm transition-colors font-medium"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-3 flex flex-col gap-3">
        <button
          onClick={processNormalization}
          disabled={!attributes.trim() || isProcessing}
          className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Run Normalization
            </>
          )}
        </button>

        {hasResults && resetSystem && (
          <button
            onClick={resetSystem}
            disabled={isProcessing}
            className="w-full bg-white border border-slate-300 text-slate-700 py-2.5 px-4 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Clear Workspace
          </button>
        )}
      </div>
    </div>
  );
}
