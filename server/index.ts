import cors from '@fastify/cors';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import Fastify from 'fastify';

dotenv.config();

const fastify = Fastify({
  logger: true,
});

// Register CORS
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map((o) =>
  o.trim(),
) || ['http://localhost:5173'];
await fastify.register(cors, {
  origin: allowedOrigins,
  credentials: true,
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

// Health check route
fastify.get('/', async (_request, _reply) => {
  return { status: 'ok', message: 'Database Normalization API is running' };
});

// Normalization route
fastify.post<{ Body: NormalizeRequestBody }>(
  '/api/normalize',
  async (request, reply) => {
    try {
      const { attributes, businessRules } = request.body;

      if (!attributes || !attributes.trim()) {
        return reply.code(400).send({
          error: 'Attributes are required',
        });
      }

      // Input validation
      if (attributes.length > 5000) {
        return reply.code(400).send({
          error: 'Attributes input too long (max 5000 characters)',
        });
      }

      if (businessRules && businessRules.length > 10000) {
        return reply.code(400).send({
          error: 'Business rules input too long (max 10000 characters)',
        });
      }

      const prompt = `You are a database normalization expert. Given the following attributes and optional business rules, perform complete database normalization.

ATTRIBUTES: ${attributes}

${businessRules?.trim() ? `BUSINESS RULES:\n${businessRules}` : 'BUSINESS RULES: None provided - infer realistic business rules based on the attributes'}

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
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        },
      });

      const text = response.text;

      // Clean the response
      let cleaned = text?.trim() || '';
      cleaned = cleaned.replace(/```json\s*/g, '');
      cleaned = cleaned.replace(/```\s*/g, '');
      cleaned = cleaned.trim();

      const parsed = JSON.parse(cleaned);

      fastify.log.info('Successfully normalized database');
      return parsed;
    } catch (error: unknown) {
      fastify.log.error(error);

      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return reply.code(500).send({
        error: 'Normalization failed',
        message,
      });
    }
  },
);

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
