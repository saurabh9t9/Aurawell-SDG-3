import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';

type WellnessConversationTurn = {
  role: 'user' | 'assistant';
  text: string;
};

function parseWellnessConversationHistory(value: unknown): WellnessConversationTurn[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (turn): turn is WellnessConversationTurn =>
        typeof turn === 'object' &&
        turn !== null &&
        (turn.role === 'user' || turn.role === 'assistant') &&
        typeof turn.text === 'string'
    )
    .slice(-12)
    .map((turn) => ({ role: turn.role, text: turn.text.trim().slice(0, 2000) }))
    .filter((turn) => turn.text.length > 0);
}

function getGeminiStatus(error: unknown): number | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof error.status === 'number'
  ) {
    return error.status;
  }
  return undefined;
}

async function generateGeminiContent(
  ai: GoogleGenAI,
  request: Parameters<GoogleGenAI['models']['generateContent']>[0]
) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await ai.models.generateContent(request);
    } catch (error) {
      const status = getGeminiStatus(error);
      if ((status !== 429 && status !== 503) || attempt >= 2) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
    }
  }
}

function getGeminiErrorMessage(error: unknown): string {
  const status = getGeminiStatus(error);
  if (status === 401 || status === 403) {
    return 'AuraWell Assistant is temporarily unable to connect to its AI service. Please check the server configuration.';
  }
  if (status === 429) {
    return 'AuraWell Assistant is receiving too many requests right now. Please try again later.';
  }
  if (status === 503) return 'AuraWell Assistant is temporarily unavailable. Please try again shortly.';
  return `AuraWell Assistant could not complete this request${status ? ` (HTTP ${status})` : ''}. Please try again.`;
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function calculateRiskScore(payload: {
  symptoms: string[];
  durationDays: number;
  temperatureC: number;
  heartRateBpm: number;
  sleepHours: number;
  age: number;
}): { score: number; factors: string[] } {
  const factors: string[] = ['Baseline +5'];
  let score = 5;
  const addFactor = (label: string, points: number) => {
    if (points <= 0) return;
    score += points;
    factors.push(`${label} +${points}`);
  };

  const temperaturePoints =
    payload.temperatureC >= 40 ? 28 :
    payload.temperatureC >= 39 ? 22 :
    payload.temperatureC >= 38 ? 14 :
    payload.temperatureC >= 37.5 ? 7 :
    payload.temperatureC >= 37.2 ? 3 : 0;
  addFactor('Temperature', temperaturePoints);

  const heartRatePoints =
    payload.heartRateBpm >= 130 ? 25 :
    payload.heartRateBpm >= 120 ? 20 :
    payload.heartRateBpm >= 110 ? 16 :
    payload.heartRateBpm >= 100 ? 12 :
    payload.heartRateBpm >= 90 ? 6 :
    payload.heartRateBpm >= 80 ? 3 : 0;
  addFactor('Heart rate', heartRatePoints);

  const symptomWeights: Record<string, number> = {
    'Shortness of Breath': 18,
    'Chest Tightness': 15,
    'Severe Headache': 8,
    'Dizziness / Lightheadedness': 7,
    'Chills / Sweats': 5,
    'Body Aches / Myalgia': 4,
    'Swollen Lymph Nodes': 4,
    'Persistent Cough': 4,
    'Sore Throat': 3,
    'Nasal Congestion': 2,
    'Unexplained Fatigue': 3,
    'Brain Fog / Poor Concentration': 3,
    Insomnia: 2,
    Nausea: 3,
    'Abdominal Cramping': 4,
    'Loss of Appetite': 2,
  };
  const symptomPoints = Math.min(
    32,
    payload.symptoms.reduce((total, symptom) => total + (symptomWeights[symptom] ?? 2), 0)
  );
  addFactor('Symptoms', symptomPoints);

  addFactor(
    'Age',
    payload.age < 5 ? 5 : payload.age < 13 ? 2 : payload.age >= 75 ? 8 : payload.age >= 65 ? 6 : payload.age >= 50 ? 3 : 0
  );
  addFactor('Duration', payload.durationDays > 7 ? 8 : payload.durationDays > 3 ? 5 : payload.durationDays > 1 ? 2 : 0);
  addFactor('Sleep', payload.sleepHours < 4 ? 5 : payload.sleepHours < 6 ? 3 : 0);

  return { score: Math.min(100, score), factors };
}

function buildFallbackWellnessReply(): {
  reply: string;
  perspective: string;
  nextStep: string;
  breathingSuggestion: string;
  healthReference: string;
} {
  return {
    reply: 'AuraWell Assistant is not configured yet. Please ask the site administrator to configure the AI service.',
    perspective: '',
    nextStep: '',
    breathingSuggestion: '',
    healthReference: '',
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
      model: GEMINI_MODEL,
    });
  });

  app.post('/api/wellness-chat', async (req, res) => {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    const history = parseWellnessConversationHistory(req.body?.history);
    if (!message) {
      return res.status(400).json({ error: 'Enter a message before sending.' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        ...buildFallbackWellnessReply(),
        source: 'clinical-engine',
      });
    }

    try {
      const response = await generateGeminiContent(ai, {
        model: GEMINI_MODEL,
        contents: [
          ...history.map((turn) => ({
            role: turn.role === 'assistant' ? 'model' as const : 'user' as const,
            parts: [{ text: turn.text }],
          })),
          { role: 'user' as const, parts: [{ text: message }] },
        ],
        config: {
          systemInstruction:
            'You are AuraWell, a warm, flexible conversational assistant. Answer the user’s actual question directly across topics including learning, science, technology, planning, relationships, work, hobbies, and wellbeing. Use recent conversation turns to understand references and continue the same topic; for example, if asked to simplify a prior answer, simplify that answer rather than changing topics. Do not force replies into exams, CBT, mental-health, breathing, or SDG framing unless the user’s request makes it relevant. Be concise, natural, and useful. Ask a clarifying question only when needed. For mental or physical health topics, be supportive and non-diagnostic, and recommend professional or emergency help when appropriate.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: 'A clear, natural answer to the current user message in conversation context.',
              },
              perspective: {
                type: Type.STRING,
                description: 'Optional additional explanation or perspective relevant to the user topic; empty when unnecessary.',
              },
              nextStep: {
                type: Type.STRING,
                description: 'Optional practical next step relevant to the topic; empty when unnecessary.',
              },
              breathingSuggestion: {
                type: Type.STRING,
                description: 'Optional breathing suggestion only when relevant to wellbeing; otherwise empty.',
              },
              healthReference: {
                type: Type.STRING,
                description: 'Optional relevant health or SDG reference; empty for unrelated topics.',
              },
            },
            required: ['reply', 'perspective', 'nextStep', 'breathingSuggestion', 'healthReference'],
          },
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text.trim());
        if (
          typeof parsed.reply !== 'string' ||
          typeof parsed.perspective !== 'string' ||
          typeof parsed.nextStep !== 'string' ||
          typeof parsed.breathingSuggestion !== 'string' ||
          typeof parsed.healthReference !== 'string'
        ) {
          throw new Error('Gemini returned an invalid response shape.');
        }
        return res.json({ ...parsed, source: GEMINI_MODEL });
      }
      console.error('AuraWell assistant request returned an empty response.');
      return res.status(502).json({ error: 'AuraWell Assistant could not provide a response. Please try again.' });
    } catch (error) {
      const status = getGeminiStatus(error);
      console.error(`Gemini wellness request failed (HTTP ${status ?? 'unknown'}).`);
      return res.status(502).json({ error: getGeminiErrorMessage(error) });
    }
  });

  app.post('/api/symptom-triage', async (req, res) => {
    if (!Array.isArray(req.body?.symptoms) || req.body.symptoms.length === 0) {
      return res.status(400).json({ error: 'Select at least one symptom before analysis.' });
    }

    const payload = {
      symptoms: req.body.symptoms.filter((symptom: unknown): symptom is string => typeof symptom === 'string').slice(0, 20),
      durationDays: Number(req.body?.durationDays ?? 2),
      temperatureC: Number(req.body?.temperatureC ?? 37.0),
      heartRateBpm: Number(req.body?.heartRateBpm ?? 76),
      sleepHours: Number(req.body?.sleepHours ?? 6.5),
      age: Number(req.body?.age ?? 21),
      notes: String(req.body?.notes ?? ''),
    };

    if (
      payload.symptoms.length === 0 ||
      !Number.isFinite(payload.durationDays) ||
      payload.durationDays < 1 ||
      payload.durationDays > 365 ||
      !Number.isFinite(payload.temperatureC) ||
      payload.temperatureC < 30 ||
      payload.temperatureC > 45 ||
      !Number.isFinite(payload.heartRateBpm) ||
      payload.heartRateBpm < 20 ||
      payload.heartRateBpm > 250 ||
      !Number.isFinite(payload.sleepHours) ||
      payload.sleepHours < 0 ||
      payload.sleepHours > 24 ||
      !Number.isFinite(payload.age) ||
      payload.age < 1 ||
      payload.age > 120 ||
      payload.notes.length > 2000
    ) {
      return res.status(400).json({ error: 'Enter valid symptom and vital-sign information.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AuraWell AI is not configured. Ask the site administrator to configure the AI service.',
      });
    }

    try {
      const response = await generateGeminiContent(ai, {
        model: GEMINI_MODEL,
        contents: `Create a patient-specific, non-diagnostic symptom triage assessment for this exact current input. Do not copy a generic sample or assume default values.
Age: ${payload.age} years
Selected symptoms (and only these reported symptoms): ${payload.symptoms.join(', ')}
Symptom duration: ${payload.durationDays} days
Measured body temperature: ${payload.temperatureC} °C
Resting heart rate: ${payload.heartRateBpm} BPM
Average sleep: ${payload.sleepHours} hours/night
Additional context: ${payload.notes || 'None'}

Mention the supplied age, duration, selected symptoms, temperature, and heart rate accurately in the clinical summary. Explain how this particular combination of symptoms and measurements informs urgency; do not describe vital signs as abnormal if they are in a normal range. Consider the patient's age in the assessment. Make each differential and next step specifically relevant to the supplied symptoms, while retaining prudent emergency red flags. Never claim a symptom was reported unless it appears in the selected symptom list or additional context.`,
        config: {
          systemInstruction:
            'You are AuraWell AI, an early symptom-triage decision-support agent. Use only the symptoms, vitals, duration, age, and context supplied in this request. Tailor every assessment field to those inputs; do not reuse generic canned assessments or invent unreported symptoms. This is not a diagnosis: express uncertainty, avoid overstating risk, and recommend professional care when appropriate. If the reported information suggests an emergency, clearly prioritize immediate emergency services regardless of the score.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              urgencyLevel: {
                type: Type.STRING,
                description: 'Must be one of: "Routine Self-Care", "Non-Urgent Clinical Consult", or "Urgent Medical Evaluation"',
              },
              primaryPattern: {
                type: Type.STRING,
                description: 'Concise clinical pattern title',
              },
              clinicalSummary: {
                type: Type.STRING,
                description: 'A patient-specific 2-3 sentence synthesis that accurately repeats the supplied age, symptoms, duration, temperature, and heart rate, and explains this particular combination.',
              },
              differentialConsiderations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 possible clinical or physiological factors to discuss with a provider',
              },
              immediateNextSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 concrete next steps for care and monitoring',
              },
              redFlagsToWatch: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 red flag symptoms that require immediate medical attention',
              },
            },
            required: [
              'urgencyLevel',
              'primaryPattern',
              'clinicalSummary',
              'differentialConsiderations',
              'immediateNextSteps',
              'redFlagsToWatch',
            ],
          },
        },
      });

      const text = response.text;
      if (text) {
        let parsed: unknown;
        try {
          parsed = JSON.parse(text.trim());
        } catch {
          console.error('AuraWell AI symptom-triage response was not valid JSON.');
          return res.status(502).json({
            error: 'AuraWell AI returned an unreadable assessment. Please try again.',
          });
        }
        if (typeof parsed !== 'object' || parsed === null) {
          console.error('AuraWell AI symptom-triage response was not a JSON object.');
          return res.status(502).json({
            error: 'AuraWell AI returned an incomplete assessment. Please try again.',
          });
        }
        const result = parsed as Record<string, unknown>;
        const validList = (value: unknown) =>
          Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim().length > 0);
        if (
          !['Routine Self-Care', 'Non-Urgent Clinical Consult', 'Urgent Medical Evaluation'].includes(String(result.urgencyLevel)) ||
          typeof result.primaryPattern !== 'string' ||
          typeof result.clinicalSummary !== 'string' ||
          !validList(result.differentialConsiderations) ||
          !validList(result.immediateNextSteps) ||
          !validList(result.redFlagsToWatch)
        ) {
          console.error('AuraWell AI symptom-triage response did not match the required assessment format.');
          return res.status(502).json({
            error: 'AuraWell AI returned an incomplete assessment. Please try again.',
          });
        }
        const riskAssessment = calculateRiskScore(payload);
        return res.json({
          ...parsed,
          riskScore: riskAssessment.score,
          riskScoreFactors: riskAssessment.factors,
          source: 'AuraWell AI',
          assessedInputs: payload,
        });
      }
      console.error('AuraWell AI symptom-triage request returned an empty response.');
      return res.status(502).json({
        error: 'AuraWell AI could not provide a triage assessment. Please try again.',
      });
    } catch (error) {
      const status = getGeminiStatus(error);
      console.error(
        `AuraWell AI symptom-triage request failed (HTTP ${status ?? 'unknown'}):`,
        error instanceof Error ? error.message : 'Unrecognized error'
      );
      const message =
        status === 401 || status === 403
          ? 'AuraWell AI is unable to connect to its service. Ask the site administrator to check the AI configuration.'
          : status === 429
          ? 'AuraWell AI is receiving too many requests. Please try again later.'
          : status === 503
          ? 'AuraWell AI is temporarily unavailable. Please try again shortly.'
          : 'AuraWell AI could not complete the assessment. Please try again.';
      return res.status(502).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AuraWell SDG 3 server listening on http://localhost:${PORT}`);
  });
}

startServer();
