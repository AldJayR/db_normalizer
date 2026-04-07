import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const fastify = Fastify({
  logger: true
});

// Register CORS
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || ['http://localhost:5173'];
await fastify.register(cors, {
  origin: allowedOrigins,
  credentials: true
});

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not defined in environment variables');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

interface NormalizeRequestBody {
  attributes: string;
  businessRules?: string;
}

interface FunctionalDependency {
  left: string[];
  right: string[];
  explanation: string;
}

interface CandidateKey {
  key: string[];
  closure: string[];
}

interface ForeignKey {
  attributes: string[];
  references: string;
}

interface Table {
  name: string;
  attributes: string[];
  primaryKey: string[];
  foreignKeys?: ForeignKey[];
}

interface Dependency {
  fd: string;
  explanation: string;
}

interface NormalizationStepData {
  description: string;
  tables: Table[];
  partialDependencies?: Dependency[];
  transitiveDependencies?: Dependency[];
  notes?: string[];
}

interface VerificationData {
  losslessJoin: boolean;
  losslessJoinExplanation: string;
  dependencyPreservation: boolean;
  dependencyPreservationExplanation: string;
  warnings?: string[];
}

interface NormalizationMeta {
  inferredBusinessRules: boolean;
  warnings: string[];
}

interface NormalizationResult {
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
  meta: NormalizationMeta;
}

class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

const INFERENCE_WARNING = 'Business rules were inferred by AI from attributes. Review and edit them before treating results as final.';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const uniqueStrings = (items: string[]): string[] => {
  return [...new Set(items)];
};

const toCleanString = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const cleaned = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return uniqueStrings(cleaned);
};

const extractFirstJsonObject = (input: string): string | null => {
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === '{') {
      if (depth === 0) {
        start = i;
      }
      depth += 1;
      continue;
    }

    if (char === '}') {
      if (depth > 0) {
        depth -= 1;
      }

      if (depth === 0 && start >= 0) {
        return input.slice(start, i + 1);
      }
    }
  }

  return null;
};

const parseModelJson = (rawText: string): unknown => {
  const cleaned = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  const candidates: string[] = [cleaned];
  const extracted = extractFirstJsonObject(cleaned);
  if (extracted && extracted !== cleaned) {
    candidates.push(extracted);
  }

  let lastError: unknown = null;
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (error: unknown) {
      lastError = error;
    }
  }

  const detail = lastError instanceof Error ? lastError.message : 'Unknown parsing error';
  throw new ApiError(502, `AI returned invalid JSON: ${detail}`);
};

const normalizeDependency = (value: unknown): Dependency | null => {
  if (!isRecord(value)) {
    return null;
  }

  const fd = toCleanString(value.fd);
  const explanation = toCleanString(value.explanation);

  if (!fd && !explanation) {
    return null;
  }

  return {
    fd,
    explanation,
  };
};

const normalizeForeignKey = (value: unknown): ForeignKey | null => {
  if (!isRecord(value)) {
    return null;
  }

  const attributes = toStringArray(value.attributes);
  const references = toCleanString(value.references);

  if (attributes.length === 0 && !references) {
    return null;
  }

  return {
    attributes,
    references,
  };
};

const normalizeTable = (
  value: unknown,
  section: string,
  index: number,
  warnings: string[]
): Table | null => {
  if (!isRecord(value)) {
    warnings.push(`${section} table #${index + 1} was invalid and was ignored.`);
    return null;
  }

  const name = toCleanString(value.name) || `${section}_Table_${index + 1}`;
  const attributes = toStringArray(value.attributes);
  const primaryKey = toStringArray(value.primaryKey);
  const foreignKeys = Array.isArray(value.foreignKeys)
    ? value.foreignKeys
        .map((fk) => normalizeForeignKey(fk))
        .filter((fk): fk is ForeignKey => fk !== null)
    : [];

  if (attributes.length === 0) {
    warnings.push(`${section} table "${name}" has no attributes in AI output.`);
  }

  if (primaryKey.length === 0) {
    warnings.push(`${section} table "${name}" has no primary key in AI output.`);
  }

  return {
    name,
    attributes,
    primaryKey,
    ...(foreignKeys.length > 0 ? { foreignKeys } : {}),
  };
};

const normalizeStep = (
  value: unknown,
  section: '1NF' | '2NF' | '3NF',
  warnings: string[]
): NormalizationStepData => {
  if (!isRecord(value)) {
    warnings.push(`${section} section was missing in AI output.`);
    return {
      description: `No ${section} details were returned by the model.`,
      tables: [],
      notes: [],
    };
  }

  const tables = Array.isArray(value.tables)
    ? value.tables
        .map((table, index) => normalizeTable(table, section, index, warnings))
        .filter((table): table is Table => table !== null)
    : [];

  if (!Array.isArray(value.tables)) {
    warnings.push(`${section} tables were missing or invalid in AI output.`);
  }

  const partialDependencies = Array.isArray(value.partialDependencies)
    ? value.partialDependencies
        .map((dependency) => normalizeDependency(dependency))
        .filter((dependency): dependency is Dependency => dependency !== null)
    : [];

  const transitiveDependencies = Array.isArray(value.transitiveDependencies)
    ? value.transitiveDependencies
        .map((dependency) => normalizeDependency(dependency))
        .filter((dependency): dependency is Dependency => dependency !== null)
    : [];

  return {
    description: toCleanString(value.description) || `No ${section} description was returned by the model.`,
    tables,
    ...(section === '2NF' ? { partialDependencies } : {}),
    ...(section === '3NF' ? { transitiveDependencies } : {}),
    notes: toStringArray(value.notes),
  };
};

const normalizeVerification = (value: unknown, warnings: string[]): VerificationData => {
  if (!isRecord(value)) {
    warnings.push('Verification section was missing in AI output.');
    return {
      losslessJoin: false,
      losslessJoinExplanation: 'No lossless join verification was returned by the model.',
      dependencyPreservation: false,
      dependencyPreservationExplanation: 'No dependency preservation verification was returned by the model.',
      warnings: [],
    };
  }

  return {
    losslessJoin: typeof value.losslessJoin === 'boolean' ? value.losslessJoin : false,
    losslessJoinExplanation:
      toCleanString(value.losslessJoinExplanation) ||
      'No lossless join explanation was returned by the model.',
    dependencyPreservation:
      typeof value.dependencyPreservation === 'boolean' ? value.dependencyPreservation : false,
    dependencyPreservationExplanation:
      toCleanString(value.dependencyPreservationExplanation) ||
      'No dependency preservation explanation was returned by the model.',
    warnings: toStringArray(value.warnings),
  };
};

const normalizeModelOutput = (
  value: unknown,
  options: { inferredBusinessRules: boolean; userBusinessRules: string[] }
): NormalizationResult => {
  if (!isRecord(value)) {
    throw new ApiError(502, 'AI returned an unexpected payload shape.');
  }

  const warnings: string[] = [];
  if (options.inferredBusinessRules) {
    warnings.push(INFERENCE_WARNING);
  }

  let businessRules = toStringArray(value.businessRules);
  if (businessRules.length === 0 && options.userBusinessRules.length > 0) {
    businessRules = options.userBusinessRules;
    warnings.push('AI response omitted business rules, so the provided rules were used for display.');
  }

  const functionalDependencies = Array.isArray(value.functionalDependencies)
    ? value.functionalDependencies
        .map((fd) => {
          if (!isRecord(fd)) {
            return null;
          }

          const left = toStringArray(fd.left);
          const right = toStringArray(fd.right);
          const explanation = toCleanString(fd.explanation);

          if (left.length === 0 && right.length === 0 && !explanation) {
            return null;
          }

          return { left, right, explanation };
        })
        .filter((fd): fd is FunctionalDependency => fd !== null)
    : [];

  const candidateKeys = Array.isArray(value.candidateKeys)
    ? value.candidateKeys
        .map((candidate) => {
          if (!isRecord(candidate)) {
            return null;
          }

          const key = toStringArray(candidate.key);
          const closure = toStringArray(candidate.closure);

          if (key.length === 0) {
            return null;
          }

          return { key, closure };
        })
        .filter((candidate): candidate is CandidateKey => candidate !== null)
    : [];

  const normalizationRoot = isRecord(value.normalization) ? value.normalization : {};
  const normalization = {
    '1NF': normalizeStep(normalizationRoot['1NF'], '1NF', warnings),
    '2NF': normalizeStep(normalizationRoot['2NF'], '2NF', warnings),
    '3NF': normalizeStep(normalizationRoot['3NF'], '3NF', warnings),
  };

  const verification = normalizeVerification(value.verification, warnings);
  const mergedWarnings = uniqueStrings([...(verification.warnings || []), ...warnings]);

  return {
    businessRules,
    functionalDependencies,
    candidateKeys,
    normalization,
    verification: {
      ...verification,
      warnings: mergedWarnings,
    },
    meta: {
      inferredBusinessRules: options.inferredBusinessRules,
      warnings: mergedWarnings,
    },
  };
};

// Health check route
fastify.get('/', async (request, reply) => {
  return { status: 'ok', message: 'Database Normalization API is running' };
});

// Normalization route
fastify.post<{ Body: NormalizeRequestBody }>('/api/normalize', async (request, reply) => {
  try {
    const body = request.body as unknown;
    if (!isRecord(body)) {
      return reply.code(400).send({
        error: 'Invalid request body',
        message: 'Request body must be a JSON object'
      });
    }

    const attributes = body.attributes;
    const businessRulesInput = body.businessRules;

    if (typeof attributes !== 'string') {
      return reply.code(400).send({
        error: 'Invalid attributes',
        message: 'Attributes must be a string'
      });
    }

    if (businessRulesInput !== undefined && typeof businessRulesInput !== 'string') {
      return reply.code(400).send({
        error: 'Invalid business rules',
        message: 'Business rules must be a string when provided'
      });
    }

    if (!attributes.trim()) {
      return reply.code(400).send({
        error: 'Attributes are required',
        message: 'Please provide at least one attribute'
      });
    }

    const businessRules = typeof businessRulesInput === 'string' ? businessRulesInput : '';
    const hasUserBusinessRules = businessRules.trim().length > 0;
    const userBusinessRules = hasUserBusinessRules
      ? businessRules
          .split(/\r?\n/)
          .map((rule) => rule.trim())
          .filter((rule) => rule.length > 0)
      : [];

    // Input validation
    if (attributes.length > 5000) {
      return reply.code(400).send({
        error: 'Attributes input too long (max 5000 characters)'
      });
    }

    if (businessRules && businessRules.length > 10000) {
      return reply.code(400).send({
        error: 'Business rules input too long (max 10000 characters)'
      });
    }

    const prompt = `You are a database normalization expert. Given the following attributes and optional business rules, perform complete database normalization.

ATTRIBUTES: ${attributes}

${hasUserBusinessRules ? `BUSINESS RULES:\n${businessRules}` : 'BUSINESS RULES: None provided - infer realistic business rules based on the attributes'}

Perform the following steps:
1. If no business rules provided, generate realistic business rules based on the attribute names
2. Determine all non-trivial functional dependencies from the business rules
3. Use attribute closure to find ALL candidate keys
4. Normalize to 1NF (ensure atomic attributes)
5. Normalize to 2NF (remove partial dependencies)
6. Normalize to 3NF (remove transitive dependencies)
7. Verify lossless join property
8. Check dependency preservation

Respond ONLY with a valid JSON object (no markdown, no code blocks, no preamble):
{
  "businessRules": ["rule1", "rule2"],
  "functionalDependencies": [
    {"left": ["attr1"], "right": ["attr2"], "explanation": "why this FD exists"}
  ],
  "candidateKeys": [
    {"key": ["attr1", "attr2"], "closure": ["all", "attributes", "it", "determines"]}
  ],
  "normalization": {
    "1NF": {
      "description": "explanation of 1NF status",
      "tables": [
        {
          "name": "TableName",
          "attributes": ["attr1", "attr2"],
          "primaryKey": ["attr1"],
          "foreignKeys": [{"attributes": ["attr2"], "references": "OtherTable"}]
        }
      ],
      "notes": ["any important notes"]
    },
    "2NF": {
      "description": "explanation of 2NF transformation",
      "partialDependencies": [{"fd": "A -> B", "explanation": "why this is partial"}],
      "tables": [],
      "notes": []
    },
    "3NF": {
      "description": "explanation of 3NF transformation",
      "transitiveDependencies": [{"fd": "B -> C", "explanation": "why this is transitive"}],
      "tables": [],
      "notes": []
    }
  },
  "verification": {
    "losslessJoin": true,
    "losslessJoinExplanation": "explanation",
    "dependencyPreservation": true,
    "dependencyPreservationExplanation": "explanation",
    "warnings": []
  }
}`;

    fastify.log.info('Sending request to Gemini API...');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
      }
    });

    const text = response.text;

    if (!text || !text.trim()) {
      throw new ApiError(502, 'AI returned an empty response');
    }

    const parsed = parseModelJson(text);
    const normalized = normalizeModelOutput(parsed, {
      inferredBusinessRules: !hasUserBusinessRules,
      userBusinessRules,
    });

    if ((normalized.meta.warnings || []).length > 0) {
      fastify.log.warn({ warnings: normalized.meta.warnings }, 'Normalization completed with warnings');
    }
    
    fastify.log.info('Successfully normalized database');
    return normalized;
    
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return reply.code(error.statusCode).send({
        error: 'Normalization failed',
        message: error.message,
      });
    }

    fastify.log.error(error);

    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return reply.code(500).send({
      error: 'Normalization failed',
      message,
    });
  }
});

// Start server
const start = async () => {
  try {
    const PORT = Number(process.env.PORT) || 3001;
    const HOST = process.env.HOST || 'localhost';
    
    await fastify.listen({ port: PORT, host: HOST });
    
    console.log(`
╔════════════════════════════════════════════════════╗
║   🚀 Database Normalization API Server            ║
╠════════════════════════════════════════════════════╣
║   Server:  http://${HOST}:${PORT}                 ║
║   Endpoint: POST /api/normalize                    ║
║   Status:  GET /                                   ║
╚════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
