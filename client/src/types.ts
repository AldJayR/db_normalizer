export interface FunctionalDependency {
  left: string[];
  right: string[];
  explanation: string;
}

export interface CandidateKey {
  key: string[];
  closure: string[];
}

export interface ForeignKey {
  attributes: string[];
  references: string;
}

export interface Table {
  name: string;
  attributes: string[];
  primaryKey: string[];
  foreignKeys?: ForeignKey[];
}

export interface Dependency {
  fd: string;
  explanation: string;
}

export interface NormalizationStepData {
  description: string;
  tables: Table[];
  partialDependencies?: Dependency[];
  transitiveDependencies?: Dependency[];
  notes?: string[];
}

export interface VerificationData {
  losslessJoin: boolean;
  losslessJoinExplanation: string;
  dependencyPreservation: boolean;
  dependencyPreservationExplanation: string;
  warnings?: string[];
}

export interface NormalizationResult {
  businessRules: string[];
  functionalDependencies: FunctionalDependency[];
  candidateKeys: CandidateKey[];
  normalization: {
    '1NF': NormalizationStepData;
    '2NF': NormalizationStepData;
    '3NF': NormalizationStepData;
    [key: string]: NormalizationStepData;
  };
  verification: VerificationData;
}
