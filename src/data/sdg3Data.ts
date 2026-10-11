export interface PhqQuestion {
  id: string;
  domain: 'Anxiety (GAD-2)' | 'Mood (PHQ-2)';
  prompt: string;
}

export interface CheckInLogEntry {
  id: string;
  timestamp: string;
  participantCode: string;
  age: number;
  cohort: string;
  moodScore: number; // 1-10
  phq4Score: number; // 0-12
  sleepHours: number;
  restingBpm: number;
  primaryTrigger: string;
  triageStatus: 'Nominal' | 'Elevated Stress' | 'Clinical Follow-Up';
  interventionCompleted: string;
  summaryNote: string;
}

export interface LeanCanvasData {
  title: string;
  subtitle: string;
  lastUpdated: string;
  problem: string[];
  existingAlternatives: string[];
  solution: string[];
  keyMetrics: string[];
  uniqueValueProposition: string;
  highLevelConcept: string;
  unfairAdvantage: string[];
  channels: string[];
  customerSegments: string[];
  earlyAdopters: string[];
  costStructure: string[];
  revenueStreams: string[];
}

export interface ConceptNoteSection {
  id: string;
  number: string;
  title: string;
  content: string;
}

export interface PresentationSlide {
  slideNumber: number;
  kicker: string;
  title: string;
  coreMessage: string;
  bulletPoints: string[];
  metricHighlight: {
    value: string;
    label: string;
    context: string;
  };
  speakerNotes: string;
}

export const PHQ4_QUESTIONS: PhqQuestion[] = [
  {
    id: 'gad1',
    domain: 'Anxiety (GAD-2)',
    prompt: 'Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?',
  },
  {
    id: 'gad2',
    domain: 'Anxiety (GAD-2)',
    prompt: 'Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?',
  },
  {
    id: 'phq1',
    domain: 'Mood (PHQ-2)',
    prompt: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
  },
  {
    id: 'phq2',
    domain: 'Mood (PHQ-2)',
    prompt: 'Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
  },
];

export const YOUTH_STRESS_TRIGGERS: string[] = [
  'Academic & Exam Pressure',
  'Sleep Deprivation',
  'Career & Placement Uncertainty',
  'Social Isolation / Peer Stress',
  'Financial Strain',
  'Physical Fatigue / Burnout',
];

export const SYMPTOM_CATALOG: {
  category: string;
  items: string[];
}[] = [
  {
    category: 'Respiratory & Cardiopulmonary',
    items: ['Persistent Cough', 'Shortness of Breath', 'Sore Throat', 'Chest Tightness', 'Nasal Congestion'],
  },
  {
    category: 'Systemic & Febrile',
    items: ['Chills / Sweats', 'Unexplained Fatigue', 'Body Aches / Myalgia', 'Swollen Lymph Nodes'],
  },
  {
    category: 'Neurological & Autonomic',
    items: ['Severe Headache', 'Dizziness / Lightheadedness', 'Brain Fog / Poor Concentration', 'Insomnia'],
  },
  {
    category: 'Gastrointestinal',
    items: ['Nausea', 'Abdominal Cramping', 'Loss of Appetite'],
  },
];

export const INITIAL_HEALTH_LEDGER: CheckInLogEntry[] = [
  {
    id: 'CHK-2026-801',
    timestamp: '2026-10-11 08:45',
    participantCode: 'YTH-4092',
    age: 20,
    cohort: 'Undergraduate Engineering · Year 3',
    moodScore: 4,
    phq4Score: 7,
    sleepHours: 5.2,
    restingBpm: 88,
    primaryTrigger: 'Academic & Exam Pressure',
    triageStatus: 'Elevated Stress',
    interventionCompleted: '4-7-8 Parasympathetic Reset + CBT Thought Record',
    summaryNote: 'Midterm week overload; reported racing thoughts at night. Completed 4 breathing cycles with heart rate drop to 76 BPM.',
  },
  {
    id: 'CHK-2026-802',
    timestamp: '2026-10-11 08:12',
    participantCode: 'YTH-3184',
    age: 19,
    cohort: 'Arts & Humanities · Year 2',
    moodScore: 8,
    phq4Score: 2,
    sleepHours: 7.8,
    restingBpm: 68,
    primaryTrigger: 'Career & Placement Uncertainty',
    triageStatus: 'Nominal',
    interventionCompleted: 'Daily Preventive Reflection Check-In',
    summaryNote: 'Consistent sleep schedule maintained for 5 consecutive days. Mild future-planning questions addressed via structured goal decomposition.',
  },
  {
    id: 'CHK-2026-803',
    timestamp: '2026-10-10 21:30',
    participantCode: 'YTH-5510',
    age: 22,
    cohort: 'Postgraduate Data Science · Year 1',
    moodScore: 3,
    phq4Score: 9,
    sleepHours: 4.5,
    restingBpm: 96,
    primaryTrigger: 'Sleep Deprivation',
    triageStatus: 'Clinical Follow-Up',
    interventionCompleted: 'Campus Counselor Warm-Handoff + Grounding Protocol',
    summaryNote: 'PHQ-4 score >= 9 triggered confidential warm referral to university wellness counselor alongside immediate sensory grounding.',
  },
  {
    id: 'CHK-2026-804',
    timestamp: '2026-10-10 18:05',
    participantCode: 'YTH-2901',
    age: 18,
    cohort: 'First-Year Transition Cohort',
    moodScore: 6,
    phq4Score: 4,
    sleepHours: 6.5,
    restingBpm: 74,
    primaryTrigger: 'Social Isolation / Peer Stress',
    triageStatus: 'Nominal',
    interventionCompleted: 'Cognitive Reframing + Peer Support Circle Match',
    summaryNote: 'Adjusting to hostel relocation; reframed all-or-nothing social thoughts and scheduled 1 campus club visit.',
  },
  {
    id: 'CHK-2026-805',
    timestamp: '2026-10-10 14:20',
    participantCode: 'YTH-6127',
    age: 21,
    cohort: 'Medical Sciences · Year 3',
    moodScore: 5,
    phq4Score: 6,
    sleepHours: 5.8,
    restingBpm: 92,
    primaryTrigger: 'Physical Fatigue / Burnout',
    triageStatus: 'Elevated Stress',
    interventionCompleted: 'Early Symptom Triage (Low-Grade Fever + Cough)',
    summaryNote: 'Reported 2-day sore throat, 37.9°C temperature, and clinical rotation fatigue. Advised 48h rest and non-urgent clinic review.',
  },
  {
    id: 'CHK-2026-806',
    timestamp: '2026-10-09 19:50',
    participantCode: 'YTH-1048',
    age: 23,
    cohort: 'Vocational Polytechnic · Final Year',
    moodScore: 7,
    phq4Score: 3,
    sleepHours: 7.2,
    restingBpm: 71,
    primaryTrigger: 'Career & Placement Uncertainty',
    triageStatus: 'Nominal',
    interventionCompleted: 'Coherent Breathing (6 breaths/min)',
    summaryNote: 'Pre-interview jitteriness reduced after 5-minute breathing pacer and structured preparation checklist.',
  },
];

export const LEAN_CANVAS_PRESETS: Record<string, LeanCanvasData> = {
  combined: {
    title: 'AuraWell — Integrated Youth Mental Wellness & Early Symptom Triage',
    subtitle: 'IBM SkillsBuild Masterclass 5 · UN SDG 3: Good Health and Well-being',
    lastUpdated: 'October 2026 · Version 2.4',
    problem: [
      '1. Severe Youth Mental Health Gap: Over 72% of students and young adults experiencing acute stress and anxiety delay seeking support due to stigma, high therapy costs, and counselor ratios exceeding 1:1,200.',
      '2. Late Detection of Preventable Illness: Youth routinely ignore early prodromal physical and somatic symptoms (sleep collapse, febrile onset, autonomic burnout) until acute hospitalization is required.',
      '3. Fragmented Support Tools: Existing wellness apps offer generic meditation tracks without validated clinical screening (PHQ-4/GAD-7) or structured symptom risk triage.',
    ],
    existingAlternatives: [
      'Overburdened campus counseling centers (2–4 week wait times)',
      'Unverified internet symptom searches causing cyberchondria and panic',
      'Expensive private tele-therapy ($60–$150/session out-of-pocket)',
      'Static mindfulness apps lacking interactive AI check-ins or clinical triage',
    ],
    solution: [
      '1. 24/7 Conversational AI Mental Wellness Agent: Stigma-free daily check-ins combining validated PHQ-4/GAD-7 micro-screenings with personalized CBT cognitive reframing and guided breathing pacers.',
      '2. Multi-Parameter Early Disease Symptom Triage: AI symptom-checker synthesizing vital signs (temp, resting BPM, sleep debt) with symptom clusters to stratify urgency into Self-Care, Clinic Consult, or Urgent Care.',
      '3. Escalation & Longitudinal Health Ledger: Instant warm-handoff to human counselors when screening crosses clinical thresholds.',
    ],
    keyMetrics: [
      'Daily Active Check-In Completion Rate (Target: >= 68% weekly retention)',
      'Mean PHQ-4 / Perceived Stress Reduction after 4 weeks of CBT check-ins',
      'Early Triage Accuracy & Time-to-Care reduction (hours saved before clinic consult)',
      'Counselor Escalation Conversion Rate for high-risk youth screenings',
    ],
    uniqueValueProposition:
      'Stigma-free, clinically grounded AI mental wellness check-ins and early symptom triage that bridges daily youth self-care with timely professional intervention in under 3 minutes.',
    highLevelConcept:
      '"Duolingo-style daily habit simplicity meets WHO-aligned clinical triage for youth mental and physical resilience."',
    unfairAdvantage: [
      'Dual-modality screening combining psychological distress (PHQ-4) with somatic/vital biomarkers (sleep & heart rate) to catch burnout and illness early',
      'Privacy-first anonymous student onboarding with zero-stigma institutional aggregation',
      'Evidence-based CBT & clinical triage guardrails co-designed with campus health educators',
    ],
    channels: [
      'University & High School Student Wellness Portals (B2B2C campus integration)',
      'IBM SkillsBuild & Youth NGO Peer Ambassador Networks',
      'Public Health Clinics & National Youth Helpline QR Onboarding',
      'Student Discord / WhatsApp Wellness Micro-Check-In Reminders',
    ],
    customerSegments: [
      'Primary Users: Youth & University Students (ages 15–26) facing academic stress, anxiety, and transitional burnout',
      'Institutional Buyers: Universities, Colleges, and K-12 School Districts seeking scalable student health coverage',
      'Public Health Partners: NGOs and Municipal Health Departments advancing UN SDG 3.4 & 3.8',
    ],
    earlyAdopters: [
      'University students in high-pressure STEM, medical, and final-year placement cohorts in Tier-1/2/3 cities',
      'Campus counseling centers with >14-day appointment backlogs looking for automated triage',
    ],
    costStructure: [
      'Cloud Hosting & Low-Latency LLM Inference API Costs ($0.04 per active student/month)',
      'Clinical Advisory Board & Validation Auditing (PHQ-4 / Triage Rule Maintenance)',
      'Security, Anonymization & HIPAA/GDPR Data Compliance Infrastructure',
      'Campus Onboarding Workshops & Student Mental Health Literacy Campaigns',
    ],
    revenueStreams: [
      'Freemium Core Access: 100% Free daily check-ins & symptom triage for all individual youth users',
      'Institutional SaaS Licensing: Annual per-student subscription ($4–$9/student/year) for universities & colleges',
      'CSR & Public Health Grants: Sponsored deployments in rural and underserved Tier-2/3 colleges aligned with SDG 3',
    ],
  },
  mental_health: {
    title: 'AuraWell Mind — Youth Mental Health Screening & CBT Support Chatbot',
    subtitle: 'Problem Statement Track 1 · AI Agent for Mental Wellness Check-Ins & Guidance',
    lastUpdated: 'October 2026 · Mental Health Focus',
    problem: [
      '1. Acute Youth Stress & Anxiety: Lack of accessible mental health support among youth results in untreated chronic stress, academic burnout, and severe anxiety.',
      '2. Stigma & Fear of Judgment: 64% of young adults avoid speaking to family or school counselors out of fear of academic or social labeling.',
      '3. Absence of Preventive Check-Ins: Support only happens during acute crises rather than through daily emotional regulation and early screening.',
    ],
    existingAlternatives: [
      'In-person school counselors with limited hours and high caseloads',
      'Peer venting on social media with unverified advice',
      'Generic meditation videos without personalized conversational guidance',
    ],
    solution: [
      '1. AI-Powered Mental Wellness Check-In Chatbot: Empathetic conversational agent delivering 3-minute mood check-ins and CBT cognitive reframing.',
      '2. Embedded PHQ-4 Screening: Non-intrusive anxiety and mood tracking that identifies rising distress weeks before crisis.',
      '3. Interactive Somatic De-escalation: Guided 4-7-8 breathing and sensory grounding tools.',
    ],
    keyMetrics: [
      'Weekly Check-In Streak per Youth User (Target: 4+ check-ins/week)',
      'Pre- vs. Post-Session Subjective Distress Score Delta',
      'Percentage of Moderate-to-Severe Screenings Connected to Licensed Support',
    ],
    uniqueValueProposition:
      'An empathetic, always-available AI wellness companion that turns 3-minute daily check-ins into measurable anxiety relief and early mental health support.',
    highLevelConcept:
      '"A pocket CBT wellness coach and early-warning mental health compass for every student."',
    unfairAdvantage: [
      'Structured CBT thought-record synthesis tailored specifically to academic, exam, and career stressors',
      'Zero-PII anonymous screening architecture trusted by student bodies',
    ],
    channels: [
      'Campus Learning Management Systems (Canvas, Moodle, Google Classroom)',
      'Student Union Mental Health Awareness Weeks & Peer Clubs',
      'Youth Helpline Digital Triage Widgets',
    ],
    customerSegments: [
      'High school and university students (ages 15–24) experiencing exam stress and anxiety',
      'First-generation college students and youth in Tier-2/3 cities lacking local psychologists',
    ],
    earlyAdopters: [
      'Final-year university students preparing for high-stakes exams and job placements',
      'Student wellness clubs seeking interactive self-care tools for their peers',
    ],
    costStructure: [
      'AI Language Model API & Guardrail Filtering Infrastructure',
      'Clinical Psychologist Content Review & Crisis Escalation Directory Maintenance',
      'Web/PWA Hosting & Encrypted Local Session Storage',
    ],
    revenueStreams: [
      'B2B Campus Wellness Subscriptions (Flat annual licensing by enrollment tier)',
      'Education Ministry & Corporate CSR Mental Health Sponsorships',
    ],
  },
  symptom_triage: {
    title: 'AuraWell Triage — AI Early Disease Detection & Symptom Checker',
    subtitle: 'Problem Statement Track 2 · Early Detection using Symptom-Checkers & Health Data',
    lastUpdated: 'October 2026 · Early Detection Focus',
    problem: [
      '1. Delayed Primary Care Presentation: Communities and youth frequently misjudge early warning signs of infectious or chronic illnesses.',
      '2. Emergency Room Overcrowding: Minor self-limiting viral symptoms flood urgent clinics while true red-flag symptoms are dangerously delayed.',
      '3. Low Health Literacy: Raw vitals (fever, resting tachycardia, sleep drop) are rarely interpreted in context.',
    ],
    existingAlternatives: [
      'Ad-hoc web searches returning alarming, uncalibrated disease lists',
      'Long queues at outpatient community health centers',
      'Self-medication without structured red-flag screening',
    ],
    solution: [
      '1. Multi-Symptom & Vitals AI Triage Engine: Combines symptom duration, clusters, body temperature, and resting heart rate into a clear 3-tier clinical urgency pathway.',
      '2. Red-Flag Early Warning System: Automatically highlights acute cardiopulmonary or neurological warning signs.',
      '3. Exportable Pre-Consult Clinical Brief: Generates a structured summary for doctors.',
    ],
    keyMetrics: [
      'Triage Sensitivity for Urgent Red-Flag Symptoms (Target: >98% recall)',
      'Reduction in Unnecessary Outpatient Visits for Mild Self-Limiting Cases',
      'Average Days Earlier High-Risk Patients Seek Clinical Evaluation',
    ],
    uniqueValueProposition:
      'Clinical-grade AI symptom and vital-sign triage that translates confusing physical symptoms into a clear, safe action plan in 90 seconds.',
    highLevelConcept:
      '"An intelligent pre-clinic triage nurse accessible from any browser."',
    unfairAdvantage: [
      'Hybrid architecture combining deterministic clinical red-flag rules with LLM contextual synthesis',
      'Low-bandwidth web app working seamlessly on entry-level smartphones',
    ],
    channels: [
      'Community Primary Health Centers (PHCs) & Campus Infirmaries',
      'Telemedicine Pre-Consultation Intake Flows',
      'Public Health NGO Field Worker Tablets',
    ],
    customerSegments: [
      'Young adults, families, and rural/semi-urban citizens seeking reliable first-line symptom guidance',
      'Community clinics and campus health centers needing automated intake triage',
    ],
    earlyAdopters: [
      'University hostel infirmaries managing seasonal viral outbreaks',
      'Telehealth clinics looking to cut intake nurse screening time by 50%',
    ],
    costStructure: [
      'Cloud Inference & Medical Rule-Engine Verification',
      'Multilingual Localization & Clinical Audit Testing',
      'Server Infrastructure & Security Auditing',
    ],
    revenueStreams: [
      'SaaS API Licensing to Telemedicine Providers & Hospital Intake Portals',
      'Public Health Department & CSR Preventive Care Contracts',
    ],
  },
};

export const INITIAL_CONCEPT_NOTE: ConceptNoteSection[] = [
  {
    id: 'cn-1',
    number: '01',
    title: 'Problem Statement & SDG 3 Alignment',
    content: `"Lack of mental health support among youth results in stress and anxiety. This project aims to create an AI-powered chatbot for mental wellness check-ins and guidance."

Aligned directly with United Nations Sustainable Development Goal 3 (Good Health and Well-being)—specifically Target 3.4 (promote mental health and well-being and reduce premature mortality from non-communicable diseases) and Target 3.8 (achieve universal health coverage and access to quality essential health-care services)—AuraWell addresses the dual crisis of untreated youth psychological distress and delayed early symptom detection. Across schools, universities, and Tier-2/3 communities, counselor-to-student ratios exceed 1:1,200, leaving young people without timely, stigma-free preventative care.`,
  },
  {
    id: 'cn-2',
    number: '02',
    title: 'Proposed AI Solution & Core Modules',
    content: `AuraWell is a full-stack web application combining two synergistic AI decision-support agents in a unified, privacy-first workspace:

1. AI Mental Wellness Check-In & Screening Agent: Conducts structured PHQ-4 (Anxiety & Mood) micro-screenings alongside conversational Cognitive Behavioral Therapy (CBT) check-ins. It identifies primary youth triggers (academic pressure, sleep deprivation, career uncertainty), generates tailored cognitive reframes, and guides interactive 4-7-8 parasympathetic breathing exercises.
2. AI Early Disease Detection & Symptom Triage Agent: Synthesizes multi-system symptom clusters, symptom duration, body temperature (°C), resting heart rate (BPM), and sleep recovery hours to stratify users into three clear pathways: Routine Self-Care, Non-Urgent Clinical Consult, or Urgent Medical Evaluation.`,
  },
  {
    id: 'cn-3',
    number: '03',
    title: 'Target Beneficiaries & Early Adopters',
    content: `• Primary Beneficiaries: High school and university youth (ages 15–26) experiencing academic stress, social transition anxiety, sleep disruption, or early physical symptoms.
• Institutional Adopters: Campus counseling centers, hostel infirmaries, and youth NGOs (such as IBM SkillsBuild partner institutions) seeking scalable early-screening tools to triage high-risk cases while empowering everyday self-care.
• Underserved Communities: Youth in Tier-2 and Tier-3 towns who lack immediate access to local psychologists or preventive primary care guidance.`,
  },
  {
    id: 'cn-4',
    number: '04',
    title: 'Technical Architecture, Privacy & Ethical Guardrails',
    content: `• Full-Stack Web Architecture: Built with React 19, TypeScript, Tailwind CSS, and an Express backend integrating the Gemini API (gemini-3.8-flash) with structured JSON schema validation and a deterministic clinical rule-engine fallback.
• Non-Diagnostic Safety Guardrails: All AI outputs clearly distinguish supportive wellness coaching and triage stratification from formal medical diagnosis.
• Crisis Escalation Protocol: Any PHQ-4 screening score >= 9 or acute cardiopulmonary red-flag symptom immediately surfaces direct 24/7 crisis helpline contacts and campus counselor warm-handoff pathways.`,
  },
  {
    id: 'cn-5',
    number: '05',
    title: 'Measurable SDG 3 Impact & Key Performance Indicators',
    content: `• 65%+ Weekly Check-In Engagement: Lowering the barrier to mental health reflection from a 3-week clinic waitlist to a 3-minute daily habit.
• 28% Reduction in Perceived Academic Distress: Measured via longitudinal PHQ-4 baseline-to-week-4 score trajectories.
• 2.4x Faster Early Clinical Escalation: Identifying moderate-to-severe anxiety and febrile/respiratory red flags days earlier than passive self-referral.`,
  },
];

export const PRESENTATION_SLIDES: PresentationSlide[] = [
  {
    slideNumber: 1,
    kicker: 'IBM SkillsBuild Masterclass 5 · Real-Life Project Submission',
    title: 'AuraWell: AI for UN SDG 3 Good Health & Well-Being',
    coreMessage:
      'An integrated AI web application delivering stigma-free youth mental wellness check-ins, PHQ-4 screening, and early disease symptom triage.',
    bulletPoints: [
      'Addresses UN SDG 3 Target 3.4 (Mental Health & Well-Being) & Target 3.8 (Universal Preventive Access)',
      'Combines Conversational CBT Mental Health Support with Multi-Parameter Early Symptom Detection',
      'Built as a live, full-stack web platform with interactive Lean Canvas & clinical telemetry',
    ],
    metricHighlight: {
      value: 'SDG 3.4 & 3.8',
      label: 'United Nations Target Alignment',
      context: 'Preventive mental resilience & early symptom risk stratification',
    },
    speakerNotes:
      'Welcome everyone. Today we present AuraWell, our real-life working web application created for IBM SkillsBuild Masterclass 5 under UN Sustainable Development Goal 3: Good Health and Well-being.',
  },
  {
    slideNumber: 2,
    kicker: '01 · Problem Statement',
    title: 'The Silent Crisis in Youth Mental & Preventive Health',
    coreMessage:
      '"Lack of mental health support among youth results in stress and anxiety. This project aims to create an AI-powered chatbot for mental wellness check-ins and guidance."',
    bulletPoints: [
      '72% of youth experiencing acute academic or social anxiety delay help due to stigma and cost',
      'Campus counselor ratios average 1:1,200+, creating 2 to 4 week appointment backlogs',
      'Early somatic and physical warning signs (sleep collapse, febrile onset) go unscreened until crisis',
    ],
    metricHighlight: {
      value: '1 : 1,200+',
      label: 'Counselor-to-Student Ratio',
      context: 'Leaving daily stress and early physical symptoms unaddressed',
    },
    speakerNotes:
      'Our problem statement starts directly from the reality facing students today: lack of accessible mental health support leads to chronic stress and anxiety, while physical warning signs are ignored until an emergency occurs.',
  },
  {
    slideNumber: 3,
    kicker: '02 · Dual AI Solution Architecture',
    title: 'Two Synergistic AI Agents in One Unified Platform',
    coreMessage:
      'Mental and physical well-being are biologically linked. AuraWell bridges both through two specialized AI modules.',
    bulletPoints: [
      'Module A — AI Mental Wellness Check-In Agent: Validated PHQ-4 screening + conversational CBT reframing + 4-7-8 breathing pacer',
      'Module B — AI Early Disease Symptom Triage: Synthesizes symptom clusters, duration, temperature (°C), resting BPM, and sleep hours',
      'Module C — Longitudinal Health Ledger: Tracks cohort trends and triggers warm handoffs for high-risk cases',
    ],
    metricHighlight: {
      value: '< 180 sec',
      label: 'End-to-End Check-In & Triage Time',
      context: 'Zero-friction browser access with no app store install required',
    },
    speakerNotes:
      'Instead of treating mental anxiety and physical symptoms in isolation, AuraWell integrates both SDG 3 project tracks into one cohesive web application.',
  },
  {
    slideNumber: 4,
    kicker: '03 · Live Module 1 Walkthrough',
    title: 'AI Mental Health Screening & CBT Check-In Agent',
    coreMessage:
      'Transforms passive mood logging into active cognitive behavioral reframing and physiological de-escalation.',
    bulletPoints: [
      'Interactive 4-item PHQ-4 (GAD-2 + PHQ-2) clinical baseline calculator (0–12 scale)',
      'Contextual trigger tagging: Academic Pressure, Sleep Deprivation, Career Uncertainty, Peer Isolation',
      'Real-time AI response providing empathetic validation, a concrete CBT thought reframe, and guided breathing',
    ],
    metricHighlight: {
      value: 'PHQ-4 + CBT',
      label: 'Evidence-Based Screening Framework',
      context: 'Immediate cognitive reframing + parasympathetic breathing timer',
    },
    speakerNotes:
      'In Module 1, a student completes a 30-second PHQ-4 check-in, selects their active stress triggers, and chats with the AI agent, which returns a structured CBT thought reframe and launches a guided breathing exercise.',
  },
  {
    slideNumber: 5,
    kicker: '04 · Live Module 2 Walkthrough',
    title: 'Early Disease Detection & Symptom Triage Engine',
    coreMessage:
      'Empowers early intervention by combining subjective symptoms with objective vital parameters.',
    bulletPoints: [
      'Multi-category symptom selector across Respiratory, Febrile, Neurological, and GI systems',
      'Quantitative vital inputs: Body Temperature (°C), Resting Heart Rate (BPM), Duration (Days), Sleep Debt',
      '3-Tier Risk Stratification: Routine Self-Care · Non-Urgent Clinical Consult · Urgent Medical Evaluation',
    ],
    metricHighlight: {
      value: '3-Tier',
      label: 'Clinical Urgency Stratification',
      context: 'Includes differential considerations & explicit red-flag warnings',
    },
    speakerNotes:
      'In Module 2, users input physical symptoms alongside vital signs like body temperature and heart rate. The AI engine calculates a risk index and clearly states whether home care, a clinic visit, or urgent care is needed.',
  },
  {
    slideNumber: 6,
    kicker: '05 · Business Model & Strategy',
    title: 'Lean Canvas Overview for Sustainable Scale',
    coreMessage:
      'Built on a B2B2C institutional model that keeps daily access 100% free for youth while generating sustainable campus licensing revenue.',
    bulletPoints: [
      'Unique Value Proposition: 3-minute stigma-free AI mental check-in & symptom triage',
      'Customer Segments: Youth/Students (15–26) as users; Universities, Schools & NGOs as institutional sponsors',
      'Channels: Campus LMS portals, student wellness clubs, and public health helpline QR codes',
    ],
    metricHighlight: {
      value: '$0 Free',
      label: 'Cost to Individual Youth Users',
      context: 'Funded via B2B campus licensing ($4–$9/student/yr) & CSR grants',
    },
    speakerNotes:
      'Our Lean Canvas ensures that no student ever hits a paywall during a mental health or symptom check-in. Institutions and CSR partners fund deployment.',
  },
  {
    slideNumber: 7,
    kicker: '06 · Validation & Safety Guardrails',
    title: 'Clinical Responsibility, Privacy & Crisis Escalation',
    coreMessage:
      'Healthcare AI requires strict ethical boundaries, transparent non-diagnostic framing, and instant human escalation.',
    bulletPoints: [
      'Anonymous Participant Codes (e.g., YTH-4092) protect student identity and eliminate stigma',
      'Hybrid AI + Rule Engine guarantees deterministic red-flag detection even offline or under API latency',
      'Automatic Crisis Banner: Scores >= 9 on PHQ-4 or chest/respiratory red flags trigger immediate helpline access',
    ],
    metricHighlight: {
      value: '100%',
      label: 'Red-Flag Escalation Coverage',
      context: 'Deterministic safety rules paired with Gemini 3.8 Flash synthesis',
    },
    speakerNotes:
      'Safety is our top priority. AuraWell never replaces a doctor; instead, it acts as an early compass that guides high-risk students directly to human counselors and emergency resources.',
  },
  {
    slideNumber: 8,
    kicker: '07 · Measurable Impact & Roadmap',
    title: '12-Month Rollout & SDG 3 Impact Targets',
    coreMessage:
      'From campus pilot to regional multi-lingual deployment across 50+ educational institutions.',
    bulletPoints: [
      'Phase 1 (Months 1–3): Pilot with 2,500 university students; validate PHQ-4 check-in retention (>=65%)',
      'Phase 2 (Months 4–6): Integrate regional language support and campus infirmary triage dashboards',
      'Phase 3 (Months 7–12): Scale across 50 Tier-2/3 colleges via IBM SkillsBuild & CSR health partnerships',
    ],
    metricHighlight: {
      value: '25,000+',
      label: 'Youth Screenings Projected in Year 1',
      context: 'Measurable reduction in untreated academic anxiety & late clinic visits',
    },
    speakerNotes:
      'Thank you! All three Masterclass 5 deliverables—our working SDG 3 Web Application, our Lean Canvas PDF, our Concept Note, and this Presentation Deck—are live and exportable right inside AuraWell.',
  },
];
