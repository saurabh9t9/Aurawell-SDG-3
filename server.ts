import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function buildFallbackWellnessReply(message: string, moodScore: number, triggers: string[], phqScore: number): {
  reply: string;
  cognitiveReframe: string;
  recommendedAction: string;
  breathingCadence: string;
  sdgTarget: string;
} {
  const lower = message.toLowerCase();
  const triggerText = triggers.length > 0 ? triggers.join(', ') : 'academic and daily transition pressures';

  if (lower.includes('exam') || lower.includes('study') || lower.includes('grade') || lower.includes('academic') || lower.includes('college')) {
    return {
      reply: `Thank you for sharing how deeply ${triggerText} is weighing on you right now. Experiencing heightened tension before academic milestones is a physiological stress response—not a reflection of your capability or preparation. Let's break the overwhelm down into manageable 25-minute micro-blocks so your nervous system can step out of fight-or-flight mode.`,
      cognitiveReframe: 'Instead of "If I don’t master everything tonight, I will fail," try: "Completing one focused 25-minute review block moves me measurably forward."',
      recommendedAction: 'Write down the single most important topic to review for 25 minutes, close all other tabs, and take a 5-minute hydration walk afterward.',
      breathingCadence: '4-7-8 Parasympathetic Reset (Inhale 4s · Hold 7s · Exhale 8s)',
      sdgTarget: 'UN SDG Target 3.4 — Youth Mental Health & Preventive Resilience',
    };
  }

  if (lower.includes('sleep') || lower.includes('tired') || lower.includes('insomnia') || lower.includes('exhausted')) {
    return {
      reply: `Sleep disruption and racing thoughts often reinforce each other, especially when your current wellness score is ${moodScore}/10. Rather than forcing sleep, focus on lowering cognitive arousal and physical muscle tension over the next 20 minutes.`,
      cognitiveReframe: 'Instead of "I won’t be able to function tomorrow if I don’t sleep right now," try: "Resting my body quietly in a dark room still restores my nervous system."',
      recommendedAction: 'Perform a 3-minute brain dump on paper to offload tomorrow’s tasks, dim screens, and run 4 cycles of Box Breathing.',
      breathingCadence: '4-4-4-4 Box Breathing (Inhale 4s · Hold 4s · Exhale 4s · Hold 4s)',
      sdgTarget: 'UN SDG Target 3.4 — Circadian & Mental Well-Being Support',
    };
  }

  if (lower.includes('anxious') || lower.includes('panic') || lower.includes('overwhelmed') || lower.includes('stress') || phqScore >= 6) {
    return {
      reply: `I hear how overwhelming things feel right now. With your screening indicator at ${phqScore}/12 and ${triggerText} active, your sympathetic nervous system is working overtime. Let's anchor your attention in the present physical environment before tackling any external decisions.`,
      cognitiveReframe: 'Instead of "Everything is spiraling out of control at once," try: "I am experiencing a temporary wave of anxiety, and I only need to handle the next 10 minutes."',
      recommendedAction: 'Practice the 5-4-3-2-1 sensory grounding protocol: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 steady breath.',
      breathingCadence: 'Physiological Sigh (Double Inhale 4s · Slow Extended Exhale 8s)',
      sdgTarget: 'UN SDG Target 3.4 — Early Anxiety Screening & De-escalation',
    };
  }

  return {
    reply: `Thank you for checking in today. Tracking your mental state (currently ${moodScore}/10 alongside ${triggerText}) is one of the strongest protective habits for long-term resilience. Let's focus on one small, restorative action you can take within the next hour to protect your energy.`,
    cognitiveReframe: 'Instead of "I have to solve every challenge immediately," try: "Consistent small check-ins build sustainable emotional clarity."',
    recommendedAction: 'Step away from your workspace for 5 minutes, drink 250ml of water, and complete a brief posture and shoulder release.',
    breathingCadence: 'Coherent Breathing (Inhale 5s · Exhale 5s at 6 breaths/min)',
    sdgTarget: 'UN SDG Target 3.4 — Proactive Youth Mental Wellness Check-In',
  };
}

function buildFallbackTriageResult(payload: {
  symptoms: string[];
  durationDays: number;
  temperatureC: number;
  heartRateBpm: number;
  sleepHours: number;
  age: number;
  notes: string;
}) {
  const { symptoms, durationDays, temperatureC, heartRateBpm, sleepHours } = payload;
  const hasHighFever = temperatureC >= 38.5;
  const hasTachycardia = heartRateBpm >= 105;
  const hasResp = symptoms.some((s) =>
    ['Shortness of Breath', 'Chest Tightness', 'Persistent Cough'].includes(s)
  );
  const hasNeuro = symptoms.some((s) =>
    ['Severe Headache', 'Dizziness / Lightheadedness', 'Visual Aura'].includes(s)
  );

  let urgencyLevel: 'Routine Self-Care' | 'Non-Urgent Clinical Consult' | 'Urgent Medical Evaluation' =
    'Routine Self-Care';
  let riskScore = 24;

  if ((hasHighFever && hasResp) || symptoms.includes('Shortness of Breath') || symptoms.includes('Chest Tightness') || temperatureC >= 39.2 || heartRateBpm >= 118) {
    urgencyLevel = 'Urgent Medical Evaluation';
    riskScore = 78;
  } else if (hasHighFever || hasTachycardia || durationDays >= 5 || symptoms.length >= 3 || hasNeuro) {
    urgencyLevel = 'Non-Urgent Clinical Consult';
    riskScore = 54;
  } else {
    riskScore = Math.min(42, 18 + symptoms.length * 7 + (sleepHours < 6 ? 6 : 0));
  }

  const primaryPattern = hasResp
    ? 'Upper / Lower Respiratory Inflammatory Pattern'
    : hasNeuro
    ? 'Neuro-Vascular & Autonomic Fatigue Pattern'
    : hasHighFever
    ? 'Acute Febrile Viral / Systemic Immune Response'
    : 'Sub-Acute Stress & Mild Somatic Fatigue Cluster';

  return {
    urgencyLevel,
    riskScore,
    primaryPattern,
    clinicalSummary: `Multi-parameter screening across ${symptoms.length} reported symptom(s) lasting ${durationDays} day(s), body temperature ${temperatureC.toFixed(1)}°C, resting heart rate ${heartRateBpm} BPM, and ${sleepHours}h/night sleep recovery indicates a ${urgencyLevel.toLowerCase()} pathway.`,
    differentialConsiderations: [
      hasResp
        ? 'Viral upper respiratory tract infection or post-viral bronchial reactivity'
        : 'Circadian depletion and autonomic stress-response somatization',
      hasHighFever
        ? 'Acute systemic febrile illness warranting antipyretic & hydration monitoring'
        : 'Dehydration or micronutrient/electrolyte imbalance contributing to fatigue',
      durationDays >= 5
        ? 'Secondary bacterial superinfection or persistent inflammatory course (>5 days)'
        : 'Early prodromal phase requiring 24–48 hour symptom trajectory tracking',
    ],
    immediateNextSteps: [
      urgencyLevel === 'Urgent Medical Evaluation'
        ? 'Arrange same-day clinical assessment at an urgent care clinic or campus health center.'
        : urgencyLevel === 'Non-Urgent Clinical Consult'
        ? 'Schedule a primary care or telemedicine appointment within 24–48 hours.'
        : 'Maintain structured home monitoring, oral hydration (2.5L/day), and restorative sleep (>=7.5h).',
      `Re-measure temperature (${temperatureC.toFixed(1)}°C) and resting pulse (${heartRateBpm} BPM) every 6 hours.`,
      'Log any progression in symptom intensity into the SDG 3 Health Ledger for clinician review.',
    ],
    redFlagsToWatch: [
      'Resting shortness of breath, difficulty speaking full sentences, or persistent chest pain',
      'Fever exceeding 39.4°C (103°F) unresponsive to standard antipyretics',
      'New confusion, severe neck stiffness, or inability to keep fluids down for >12 hours',
    ],
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post('/api/wellness-chat', async (req, res) => {
    const { message = '', moodScore = 6, triggers = [], phqScore = 3 } = req.body || {};
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        ...buildFallbackWellnessReply(message, moodScore, triggers, phqScore),
        source: 'clinical-engine',
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `User Check-in Message: "${message}"
Current Mood Rating: ${moodScore}/10
Active Stress Triggers: ${triggers.join(', ') || 'None specified'}
PHQ-4 / GAD-7 Brief Screening Score: ${phqScore}/12

Provide a compassionate, evidence-based youth mental wellness check-in response aligned with UN SDG 3 (Good Health and Well-being, Target 3.4).`,
        config: {
          systemInstruction:
            'You are AuraWell, an empathetic, evidence-based youth mental health screening and support agent built for UN SDG 3 (Good Health and Well-being). Use Cognitive Behavioral Therapy (CBT) framing, validate emotions without diagnosing, keep responses concise (3-4 sentences), and provide practical grounding actions.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: 'Empathetic, validating 3-4 sentence response to the youth user.',
              },
              cognitiveReframe: {
                type: Type.STRING,
                description: 'A concrete CBT thought reframe ("Instead of X, try Y").',
              },
              recommendedAction: {
                type: Type.STRING,
                description: 'One specific, actionable 5-15 minute micro-habit.',
              },
              breathingCadence: {
                type: Type.STRING,
                description: 'Recommended breathing pattern with seconds.',
              },
              sdgTarget: {
                type: Type.STRING,
                description: 'Relevant UN SDG 3 target reference.',
              },
            },
            required: ['reply', 'cognitiveReframe', 'recommendedAction', 'breathingCadence', 'sdgTarget'],
          },
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text.trim());
        return res.json({ ...parsed, source: 'gemini-3.8-flash' });
      }
      return res.json({
        ...buildFallbackWellnessReply(message, moodScore, triggers, phqScore),
        source: 'clinical-engine',
      });
    } catch (_error) {
      return res.json({
        ...buildFallbackWellnessReply(message, moodScore, triggers, phqScore),
        source: 'clinical-engine',
      });
    }
  });

  app.post('/api/symptom-triage', async (req, res) => {
    const payload = {
      symptoms: Array.isArray(req.body?.symptoms) ? req.body.symptoms : ['Fatigue'],
      durationDays: Number(req.body?.durationDays ?? 2),
      temperatureC: Number(req.body?.temperatureC ?? 37.0),
      heartRateBpm: Number(req.body?.heartRateBpm ?? 76),
      sleepHours: Number(req.body?.sleepHours ?? 6.5),
      age: Number(req.body?.age ?? 21),
      notes: String(req.body?.notes ?? ''),
    };

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        ...buildFallbackTriageResult(payload),
        source: 'clinical-engine',
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Perform early disease detection and preventative symptom triage for UN SDG 3:
Age: ${payload.age}
Reported Symptoms: ${payload.symptoms.join(', ')}
Symptom Duration: ${payload.durationDays} days
Body Temperature: ${payload.temperatureC} °C
Resting Heart Rate: ${payload.heartRateBpm} BPM
Average Sleep: ${payload.sleepHours} hours/night
Additional Context: ${payload.notes || 'None'}`,
        config: {
          systemInstruction:
            'You are an AI Early Disease Detection & Symptom Triage decision-support agent for UN SDG 3 (Targets 3.3, 3.4, 3.8). Provide clear non-diagnostic clinical risk stratification, differential considerations, actionable preventative steps, and red-flag warnings.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              urgencyLevel: {
                type: Type.STRING,
                description: 'Must be one of: "Routine Self-Care", "Non-Urgent Clinical Consult", or "Urgent Medical Evaluation"',
              },
              riskScore: {
                type: Type.INTEGER,
                description: 'Numeric risk index between 10 and 95',
              },
              primaryPattern: {
                type: Type.STRING,
                description: 'Concise clinical pattern title',
              },
              clinicalSummary: {
                type: Type.STRING,
                description: '2-3 sentence synthesis of vitals and symptom cluster',
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
              'riskScore',
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
        const parsed = JSON.parse(text.trim());
        return res.json({ ...parsed, source: 'gemini-3.8-flash' });
      }
      return res.json({
        ...buildFallbackTriageResult(payload),
        source: 'clinical-engine',
      });
    } catch (_error) {
      return res.json({
        ...buildFallbackTriageResult(payload),
        source: 'clinical-engine',
      });
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
