interface BusinessRulesProps {
  rules: string[];
}

export function BusinessRules({ rules }: BusinessRulesProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
        <span className="text-lg">📋</span> Business Rules
      </h3>
      <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
        {rules.map((rule, i) => (
          <li key={i}>{rule}</li>
        ))}
      </ul>
    </div>
  );
}
