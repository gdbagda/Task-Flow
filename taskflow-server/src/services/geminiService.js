const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Initialise client lazily so missing key doesn't crash on import ──────────
let genAI = null;

const getClient = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

// ─── Build a structured prompt ────────────────────────────────────────────────
const buildPrompt = (title, description) => {
  const today = new Date().toISOString().split('T')[0];

  return `
You are a senior project manager and software engineering expert.
Today's date is ${today}.

A developer has created a task with the following details:
- Title: "${title}"
- Description: "${description || 'No description provided'}"

Based on this information, provide a realistic effort estimation.

Respond ONLY with a valid JSON object — no markdown, no explanation, no extra text.

The JSON must follow this exact structure:
{
  "estimatedHours": <number between 0.5 and 200>,
  "suggestedDueDate": "<ISO 8601 date string, YYYY-MM-DD, at least 1 day from today>",
  "reason": "<2-3 sentence explanation of your estimation logic>",
  "confidence": "<low | medium | high>",
  "breakdown": {
    "planning": <hours>,
    "implementation": <hours>,
    "testing": <hours>,
    "review": <hours>
  }
}

Rules:
- estimatedHours must be the sum of all breakdown values
- suggestedDueDate must account for realistic working days (not weekends if possible)
- reason must be specific to this task, not generic
- If the task is vague, set confidence to "low" and explain why in the reason
`.trim();
};

// ─── Parse and validate Gemini response ──────────────────────────────────────
const parseGeminiResponse = (text) => {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  const parsed = JSON.parse(cleaned);

  // Validate required fields
  if (
    typeof parsed.estimatedHours !== 'number' ||
    !parsed.suggestedDueDate ||
    !parsed.reason
  ) {
    throw new Error('Invalid response structure from Gemini');
  }

  // Clamp estimatedHours to safe range
  parsed.estimatedHours = Math.max(0.5, Math.min(200, parsed.estimatedHours));

  // Validate date
  const date = new Date(parsed.suggestedDueDate);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date returned from Gemini');
  }

  // Ensure due date is in the future
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date < tomorrow) {
    parsed.suggestedDueDate = tomorrow.toISOString().split('T')[0];
  }

  return parsed;
};

// ─── Fallback estimate when Gemini fails ─────────────────────────────────────
const buildFallbackEstimate = (title, description) => {
  const wordCount = `${title} ${description || ''}`.split(/\s+/).length;

  let estimatedHours;
  let confidence = 'low';

  if (wordCount < 10) {
    estimatedHours = 2;
  } else if (wordCount < 30) {
    estimatedHours = 4;
  } else if (wordCount < 60) {
    estimatedHours = 8;
  } else {
    estimatedHours = 16;
  }

  const dueDate = new Date();
  const daysToAdd = Math.ceil(estimatedHours / 6);
  dueDate.setDate(dueDate.getDate() + daysToAdd);

  return {
    estimatedHours,
    suggestedDueDate: dueDate.toISOString().split('T')[0],
    reason:
      'This is a fallback estimate generated without AI assistance. ' +
      'The estimate is based on task description length. ' +
      'Please review and adjust manually.',
    confidence,
    breakdown: {
      planning: Math.round(estimatedHours * 0.1 * 10) / 10,
      implementation: Math.round(estimatedHours * 0.6 * 10) / 10,
      testing: Math.round(estimatedHours * 0.2 * 10) / 10,
      review: Math.round(estimatedHours * 0.1 * 10) / 10,
    },
    isFallback: true,
  };
};

// ─── Main estimation function ─────────────────────────────────────────────────
const estimateTask = async (title, description) => {
  if (!title || typeof title !== 'string') {
    throw new Error('Task title is required for estimation');
  }

  // Try Gemini first
  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = buildPrompt(title, description);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim() === '') {
      throw new Error('Empty response from Gemini');
    }

    const parsed = parseGeminiResponse(text);

    return {
      ...parsed,
      isFallback: false,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(`⚠️  Gemini estimation failed: ${error.message}. Using fallback.`);

    return {
      ...buildFallbackEstimate(title, description),
      generatedAt: new Date().toISOString(),
    };
  }
};

module.exports = { estimateTask };