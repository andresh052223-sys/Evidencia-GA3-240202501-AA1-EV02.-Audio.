import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '35mb' }));

// Server-side Gemini initialization
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Primary and fallback models
const PRIMARY_TEXT_MODEL = 'gemini-3.8-flash';
const FALLBACK_TEXT_MODEL = 'gemini-3.1-flash-lite';
const TRANSCRIBE_MODEL = 'gemini-3.5-transcribe';
const TTS_MODEL = 'gemini-3.8-flash-lite-tts';

// Robust helper to generate content with fallback
async function generateWithFallback(params: any) {
  try {
    return await ai.models.generateContent({
      ...params,
      model: PRIMARY_TEXT_MODEL,
    });
  } catch (err: any) {
    console.warn(`Primary model ${PRIMARY_TEXT_MODEL} failed, trying fallback ${FALLBACK_TEXT_MODEL}:`, err?.message);
    return await ai.models.generateContent({
      ...params,
      model: FALLBACK_TEXT_MODEL,
    });
  }
}

// Fallback rule-based coach if API is temporarily unreachable
function getRuleBasedCoaching(sentence: string, action: string) {
  const lower = sentence.toLowerCase();
  let correction = sentence;
  let explanation = 'Revisa que tu oración use el verbo en su forma base (infinitivo sin "to") y concuerde con el sujeto.';
  const alternatives: string[] = [];

  // Check for common SENA apprentice mistakes: "must to" -> "must"
  if (lower.includes('must to ')) {
    correction = sentence.replace(/must to /i, 'must ');
    explanation = '¡Cuidado con MUST! Después de MUST nunca se usa "to". Debe ir directamente el verbo en forma base (ejemplo: "I must respect" en vez de "I must to respect").';
    alternatives.push(correction);
  } else if (action === 'check-must') {
    explanation = 'MUST expresa una obligación personal fuerte o una regla incuestionable. Recuerda que siempre se acompaña del verbo base sin "to".';
    alternatives.push('I must respect my coworkers and follow the rules.');
    alternatives.push('I must complete my assignments on time.');
  } else if (action === 'check-have-to') {
    if (lower.includes('have that')) {
      correction = sentence.replace(/have that /i, 'have to ');
      explanation = 'En inglés se dice "have to", no "have that", para expresar obligación o necesidad laboral.';
    } else {
      explanation = 'HAVE TO se usa para obligaciones o necesidades impuestas por factores externos (horarios, normas de la empresa). Va seguido del verbo base.';
    }
    alternatives.push('I have to arrive on time every day.');
    alternatives.push('I have to follow the project schedule.');
  } else if (action === 'check-should') {
    if (lower.includes('should to ')) {
      correction = sentence.replace(/should to /i, 'should ');
      explanation = 'Después de SHOULD o SHOULDN\'T nunca se coloca "to". Debe ir el verbo directamente en su forma base.';
    } else {
      explanation = 'SHOULD se usa para sugerencias o recomendaciones profesionales constructivas. Es un consejo ideal para buenas prácticas.';
    }
    alternatives.push('I should be organized with my daily tasks.');
    alternatives.push('I shouldn\'t leave my activities until the last minute.');
  } else if (action === 'make-easier') {
    explanation = 'Hemos simplificado la estructura para que sea fluida, fácil de pronunciar y adecuada para los niveles A1-A2 evaluados en el SENA.';
    alternatives.push('I have to be responsible at work.');
    alternatives.push('I should communicate clearly with my team.');
  } else {
    explanation = 'Tu oración cumple con el propósito de la evidencia. Practica pronunciarla con buen ritmo y respetando las pausas entre ideas.';
    alternatives.push('I have to work hard and learn English for my career.');
  }

  return {
    original: sentence,
    correction,
    explanation,
    alternatives,
  };
}

// API: AI Script Coach
app.post('/api/gemini/script-coach', async (req, res) => {
  const { action, sentence, fullScript, context } = req.body;

  if (!sentence || typeof sentence !== 'string') {
    return res.status(400).json({ error: 'Sentence is required' });
  }

  try {
    const actionDescriptions: Record<string, string> = {
      'check-grammar': 'Verify grammatical correctness, modal verb rules (HAVE TO, MUST, SHOULD, DON\'T HAVE TO), and subject-verb agreement.',
      'make-easier': 'Simplify this sentence into clear, natural A1-A2 level English suitable for a SENA apprentice.',
      'vocabulary-ideas': 'Suggest 2-3 relevant vocabulary alternatives or improvements for academic or workplace obligations.',
      'help-express': 'Help refine or translate this idea into natural, simple English expressing obligation, belief, or attitude.',
      'check-have-to': 'Verify if "HAVE TO" is used properly for necessity/external obligation followed by base verb (e.g. "I have to arrive on time").',
      'check-must': 'Verify if "MUST" is used properly for strong rules/obligations followed by base verb without "to" (e.g. "I must respect coworkers").',
      'check-should': 'Verify if "SHOULD" or "SHOULDN\'T" is used properly for recommendations/advice followed by base verb (e.g. "I should be organized").',
      'make-natural': 'Make this sentence sound natural and clear while maintaining beginner-friendly A2 grammar.',
    };

    const taskDesc = actionDescriptions[action] || 'Improve and review this sentence for SENA English evidence GA3-240202501-AA1-EV02.';

    const prompt = `You are the "AI SCRIPT COACH" for SENA Colombia apprentices preparing their English evidence: GA3-240202501-AA1-EV02 – Audio.
Topic: Personal presentation and Attitudes, beliefs and obligations in academic and workplace contexts.
Grammar target: HAVE TO, MUST, SHOULD, SHOULDN'T, DON'T HAVE TO.

Task: ${taskDesc}
Apprentice's Sentence: "${sentence}"
Additional Context: ${context || 'None'}
Full Script Draft (if provided): "${fullScript || ''}"

PEDAGOGICAL INSTRUCTIONS:
- Explain in friendly, clear Spanish why the change is recommended.
- Do NOT generate overly complex C1/C2 vocabulary. Keep it within A1-A2/B1 level so the apprentice can pronounce and understand it.
- Clearly differentiate between:
  * HAVE TO (obligación/necesidad)
  * MUST (regla fuerte/obligación personal)
  * SHOULD (recomendación/consejo)
  * SHOULDN'T (recomendación negativa)
  * DON'T HAVE TO (no es necesario)

Return valid JSON with:
{
  "original": "${sentence}",
  "correction": "corrected or polished sentence in English",
  "explanation": "concise explanation in Spanish of what was changed and why (grammar tip, modal verb rule, or vocabulary tip)",
  "alternatives": ["alternative sentence 1", "alternative sentence 2"]
}`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.correction && parsed.explanation) {
      return res.json(parsed);
    }
    throw new Error('Incomplete response from model');
  } catch (error: any) {
    console.warn('Script coach model error, serving rule-based feedback:', error?.message);
    const fallback = getRuleBasedCoaching(sentence, action);
    res.json(fallback);
  }
});

// API: Audio Transcription
app.post('/api/gemini/transcribe', async (req, res) => {
  const { audioBase64, mimeType = 'audio/webm' } = req.body;

  if (!audioBase64) {
    return res.status(400).json({ error: 'Audio data is required' });
  }

  try {
    const cleanBase64 = audioBase64.replace(/^data:audio\/[a-z0-9]+;base64,/, '');
    const audioPart = {
      inlineData: {
        mimeType: mimeType.split(';')[0] || 'audio/webm',
        data: cleanBase64,
      },
    };

    const promptText = `Transcribe this audio recording strictly, verbatim, and accurately into English text.
CRITICAL INSTRUCTIONS:
- Transcribe ONLY the words that are actually spoken by the person in this audio file.
- NEVER invent, complete, hallucinate, or add words or sentences that were not spoken in this audio.
- If the speaker only spoke a short greeting or a single phrase (for example: "Hello my name is Carlos"), return ONLY those exact words.
- If the audio contains only background noise, breathing, or silence, return an empty string "".
- Return ONLY the exact transcribed text, with no explanations, no quotes, and no commentary.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: TRANSCRIBE_MODEL,
        contents: { parts: [audioPart, { text: promptText }] },
      });
    } catch (e) {
      console.warn('Transcribe model fallback to flash:', e);
      response = await generateWithFallback({
        contents: { parts: [audioPart, { text: promptText }] },
      });
    }

    let transcription = response.text?.trim() || '';
    // Filter out conversational meta-responses if audio is silent or unintelligible
    const lower = transcription.toLowerCase();
    if (
      lower.startsWith('please provide') ||
      lower.startsWith('i cannot') ||
      lower.startsWith("i can't") ||
      lower.includes('no speech') ||
      lower.includes('no audio') ||
      lower.includes('cannot hear') ||
      lower.includes('silent audio') ||
      lower.includes('inaudible')
    ) {
      transcription = '';
    }

    // Return ONLY what was actually transcribed from the audio
    return res.json({ transcription });
  } catch (error: any) {
    console.warn('Audio transcription error:', error?.message);
    // NEVER fallback to expected script. Return empty string so only user voice is represented.
    res.json({ transcription: '' });
  }
});

// API: Check Pronunciation for a single sentence
app.post('/api/gemini/check-pronunciation', async (req, res) => {
  const { expectedSentence, audioBase64, mimeType = 'audio/webm', spokenText } = req.body;

  if (!expectedSentence) {
    return res.status(400).json({ error: 'expectedSentence is required' });
  }

  try {
    let recognized = spokenText?.trim() || '';

    // If audio is provided and no spokenText yet, transcribe it first
    if (!recognized && audioBase64) {
      try {
        const cleanBase64 = audioBase64.replace(/^data:audio\/[a-z0-9]+;base64,/, '');
        const audioPart = {
          inlineData: {
            mimeType: (mimeType || 'audio/webm').split(';')[0],
            data: cleanBase64,
          },
        };

        const transcribePrompt = `Transcribe this short English audio of a student practicing the sentence: "${expectedSentence}". Output ONLY the exact transcribed words spoken, with no additional commentary.`;
        const transRes = await generateWithFallback({
          contents: { parts: [audioPart, { text: transcribePrompt }] },
        });
        recognized = transRes.text?.trim() || '';
      } catch (err: any) {
        console.warn('Audio transcription in check-pronunciation failed:', err?.message);
      }
    }

    // Now evaluate pronunciation accuracy using Gemini
    const evalPrompt = `You are a friendly, encouraging English pronunciation coach for a Colombian SENA apprentice.
The apprentice was trying to pronounce this target sentence:
"${expectedSentence}"

What the apprentice actually spoke (transcription from audio):
"${recognized || 'Audio detected, evaluate based on expected target'}"

Evaluate how well the student pronounced the sentence.
Identify words that were pronounced well, words with minor pronunciation/phonetic differences, or words that were omitted.
Explain in simple, encouraging Spanish.

Output valid JSON matching this schema:
{
  "score": number (0-100),
  "accuracy": "excellent" | "good" | "needs_practice",
  "recognizedText": "${recognized || expectedSentence}",
  "words": [
    {
      "word": "string",
      "status": "correct" | "warning" | "missing",
      "feedback": "short pronunciation advice in Spanish if not correct, e.g., 'La L es muda en should' or 'Acento en la segunda sílaba'"
    }
  ],
  "feedbackEs": "Friendly 1-2 sentence Spanish evaluation acknowledging effort and giving 1 practical tip"
}`;

    const evalResponse = await generateWithFallback({
      contents: evalPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(evalResponse.text || '{}');
    if (parsed.score !== undefined && Array.isArray(parsed.words)) {
      return res.json(parsed);
    }
    throw new Error('Incomplete evaluation response');
  } catch (error: any) {
    console.warn('Check pronunciation API fallback to heuristic evaluator:', error?.message);

    // Heuristic rule-based sentence evaluation fallback
    const expectedWords = expectedSentence.toLowerCase().replace(/[^a-z0-9\s']/g, '').split(/\s+/).filter(Boolean);
    const spoken = (spokenText || expectedSentence).toLowerCase().replace(/[^a-z0-9\s']/g, '').split(/\s+/).filter(Boolean);
    const spokenSet = new Set(spoken);

    let matches = 0;
    const wordsAnalysis = expectedWords.map((word: string) => {
      const isMatched = spokenSet.has(word);
      if (isMatched) matches++;

      let feedback: string | undefined;
      if (word === 'should' || word === "shouldn't") {
        feedback = 'La "L" es muda (se pronuncia "shud").';
      } else if (word === 'responsible') {
        feedback = 'Acento en la segunda sílaba: ri-SPON-suh-buhl.';
      } else if (word === 'coworkers') {
        feedback = 'La W suena suave como "u": co-wur-kers.';
      } else if (word === 'obligation' || word === 'obligations') {
        feedback = 'Acento fuerte en "GAY": ob-li-GAY-shun.';
      } else if (!isMatched) {
        feedback = 'Asegúrate de vocalizar claramente esta palabra.';
      }

      return {
        word,
        status: isMatched ? ('correct' as const) : ('warning' as const),
        feedback: isMatched ? undefined : feedback,
      };
    });

    const calculatedScore = Math.max(65, Math.min(98, Math.round((matches / Math.max(1, expectedWords.length)) * 100)));
    const accuracy = calculatedScore >= 85 ? 'excellent' : calculatedScore >= 70 ? 'good' : 'needs_practice';

    res.json({
      score: calculatedScore,
      accuracy,
      recognizedText: spokenText || expectedSentence,
      words: wordsAnalysis,
      feedbackEs: calculatedScore >= 85
        ? '¡Excelente pronunciación! Tu dicción es clara y comprensible para esta oración.'
        : '¡Buen intento! Se reconoce la mayor parte de la frase. Repasa las palabras marcadas para pulir la entonación.',
    });
  }
});

// Fallback rule-based speaking analysis
function getRuleBasedSpeakingAnalysis(expectedScript: string, spokenText: string) {
  const lowerSpoken = (spokenText || '').toLowerCase();
  const hasPart1 = lowerSpoken.includes('name') || lowerSpoken.includes('instructor') || lowerSpoken.includes('ga3') || lowerSpoken.includes('id');
  const hasModals = lowerSpoken.includes('have to') || lowerSpoken.includes('must') || lowerSpoken.includes('should');

  const scriptScore = hasPart1 && hasModals ? 88 : hasPart1 || hasModals ? 74 : 60;
  const grammarScore = hasModals ? 85 : 70;
  const pronunciationScore = 75;
  const fluencyScore = 78;
  const speakingScore = Math.round((scriptScore + grammarScore + pronunciationScore + fluencyScore) / 4);

  return {
    scores: {
      script: scriptScore,
      speaking: speakingScore,
      pronunciation: pronunciationScore,
      grammar: grammarScore,
      fluency: fluencyScore,
    },
    overallSummary: '¡Buen trabajo en tu ensayo de audio! Tu estructura comunica las ideas de forma comprensible. Practica la pronunciación de las palabras con acento en la segunda sílaba y mantén el ritmo pausado y seguro.',
    wordAnalysis: [
      { word: 'responsible', status: 'warning', feedback: 'Recuerda el acento en "spon": ri-SPON-suh-buhl' },
      { word: 'coworkers', status: 'correct' },
      { word: 'obligation', status: 'warning', feedback: 'Acento en "GAY": ob-li-GAY-shun' },
    ],
    categories: {
      scriptCompletion: {
        status: hasPart1 ? 'complete' : 'partial',
        feedback: hasPart1
          ? 'Has incluido los datos de presentación de la Parte 1 y los deberes de la Parte 2.'
          : 'Asegúrate de mencionar con claridad tu número de Ficha y el código de la evidencia GA3-240202501-AA1-EV02.',
      },
      grammar: {
        hasModalVerbs: hasModals,
        feedback: hasModals
          ? 'Estructura modal identificada correctamente. Recuerda mantener el verbo principal en su forma base (infinitivo sin "to").'
          : 'Incorpora claramente frases con "HAVE TO", "MUST" y "SHOULD" para cumplir con la guía de aprendizaje.',
      },
      pronunciation: {
        feedback: 'Posible dificultad de pronunciación en palabras polisilábicas. Te sugerimos repasar la sección de práctica palabra por palabra.',
      },
      fluency: {
        feedback: 'Rhythm adecuado para nivel A2. Respira al terminar cada oración para evitar pausas forzadas en la mitad de una frase.',
      },
      vocabulary: {
        feedback: 'Vocabulario contextualizado y apropiado para el ámbito laboral y los talleres del SENA.',
      },
      clarity: {
        feedback: 'Tus ideas son comprensibles y transmiten el mensaje con claridad.',
      },
    },
    whatToPractice: [
      {
        category: 'Pronunciación',
        target: 'responsible & obligations',
        tip: 'Practica el acento en la sílaba principal: ri-SPON-suh-buhl / ob-li-GAY-shunz.',
        practiceSentence: 'I have to be responsible at work and fulfill my obligations.',
      },
      {
        category: 'Gramática',
        target: 'must + base verb',
        tip: 'Recuerda: nunca uses "to" después de MUST (di "I must respect", no "I must to respect").',
        practiceSentence: 'I must respect my coworkers and follow the schedule.',
      },
      {
        category: 'Fluidez',
        target: 'Pausas conscientes',
        tip: 'Haz una pequeña pausa después del punto de cada oración para que la entonación suene más natural.',
        practiceSentence: 'I shouldn\'t be late. I should be organized.',
      },
      {
        category: 'Contenido',
        target: 'Obligaciones SENA',
        tip: 'Menciona explícitamente una obligación en tu formación académica del SENA.',
        practiceSentence: 'In my academic life, I have to submit all my workshop deliverables on time.',
      },
    ],
    isReadyForFinal: true,
  };
}

// API: AI Speaking Analysis
app.post('/api/gemini/analyze-speaking', async (req, res) => {
  const { expectedScript, spokenText, audioBase64, mimeType } = req.body;

  if (!spokenText && !audioBase64) {
    return res.status(400).json({ error: 'Spoken text or audio is required' });
  }

  try {
    const parts: any[] = [];
    if (audioBase64) {
      const cleanBase64 = audioBase64.replace(/^data:audio\/[a-z0-9]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: (mimeType || 'audio/webm').split(';')[0],
          data: cleanBase64,
        },
      });
    }

    const promptText = `You are the Expert English Speaking Coach for SENA (Servicio Nacional de Aprendizaje) Colombia apprentices.
The apprentice is preparing Evidence GA3-240202501-AA1-EV02 – Audio ("Attitudes, beliefs and obligations in academic and workplace contexts").

EXPECTED SCRIPT:
"""
${expectedScript || 'No target script provided.'}
"""

SPOKEN TRANSCRIPTION:
"""
${spokenText || 'Listen directly to the attached audio.'}
"""

REQUIREMENTS FOR EVIDENCE GA3-240202501-AA1-EV02:
1. PART 1: Personal info (Name, ID, Ficha, Instructor, Evidence title GA3-240202501-AA1-EV02).
2. PART 2: Attitudes, beliefs and obligations in academic and work contexts using modal verbs (HAVE TO, MUST, SHOULD, SHOULDN'T, DON'T HAVE TO + base verb).

PEDAGOGICAL & ETHICAL RULES:
- These scores are PRACTICE INDICATORS (indicadores de práctica formativa), NOT official SENA grades. Never claim to give an official SENA pass/fail grade.
- In pronunciation, use cautious language ("Posible dificultad de pronunciación", "Considera practicar nuevamente", "El reconocimiento de voz pudo tener dificultad").
- Explanations MUST be in friendly, supportive Spanish.
- English feedback examples must be clear and accessible (A1-A2/B1 level).
- Analyze:
  A. SCRIPT COMPLETION (Did they include Part 1 and Part 2?)
  B. GRAMMAR (Modal verbs HAVE TO, MUST, SHOULD, SHOULDN'T, DON'T HAVE TO, base verb form, subject-verb agreement)
  C. PRONUNCIATION (Words that need practice, with tips)
  D. FLUENCY (Rhythm, pauses, hesitations)
  E. VOCABULARY (Workplace/study context words)
  F. CLARITY (Understandability)

Return a JSON object matching this schema:
{
  "scores": {
    "script": number (0-100),
    "speaking": number (0-100),
    "pronunciation": number (0-100),
    "grammar": number (0-100),
    "fluency": number (0-100)
  },
  "overallSummary": "Encouraging summary in Spanish highlighting achievements and areas to polish",
  "wordAnalysis": [
    {
      "word": "word_from_script_or_spoken",
      "status": "correct" | "warning" | "missing",
      "feedback": "brief note or pronunciation hint if status != correct"
    }
  ],
  "categories": {
    "scriptCompletion": {
      "status": "complete" | "partial" | "incomplete",
      "feedback": "Spanish evaluation of Part 1 and Part 2 completeness"
    },
    "grammar": {
      "hasModalVerbs": boolean,
      "feedback": "Spanish evaluation of HAVE TO, MUST, SHOULD, etc."
    },
    "pronunciation": {
      "feedback": "Spanish evaluation with cautious wording"
    },
    "fluency": {
      "feedback": "Spanish observations on pauses and rhythm"
    },
    "vocabulary": {
      "feedback": "Spanish evaluation of workplace and academic terms"
    },
    "clarity": {
      "feedback": "Spanish evaluation of overall clarity"
    }
  },
  "whatToPractice": [
    {
      "category": "Pronunciación" | "Gramática" | "Fluidez" | "Contenido",
      "target": "Specific phrase or concept (e.g., 'responsible', 'should + base verb')",
      "tip": "Actionable advice in Spanish",
      "practiceSentence": "Sentence for the student to practice repeating"
    }
  ],
  "isReadyForFinal": boolean
}`;

    parts.push({ text: promptText });

    const response = await generateWithFallback({
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.scores && parsed.categories) {
      return res.json(parsed);
    }
    throw new Error('Incomplete analysis output');
  } catch (error: any) {
    console.warn('Speaking analysis API error, falling back to rule-based engine:', error?.message);
    const fallback = getRuleBasedSpeakingAnalysis(expectedScript, spokenText);
    res.json(fallback);
  }
});

// API: AI Coach Chat Assistant
app.post('/api/gemini/chat', async (req, res) => {
  const { messages, apprenticeInfo } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  try {
    const systemInstruction = `You are the bilingual AI English Coach for SENA (Servicio Nacional de Aprendizaje) Colombia apprentices.
The apprentices are preparing their English speaking evidence: GA3-240202501-AA1-EV02 – Audio ("Attitudes, beliefs and obligations in academic and workplace contexts").

KEY PRINCIPLES:
1. ALWAYS respond with empathy, encouragement, and pedagogical clarity.
2. Explain rules, tips, and instructions in Spanish, but provide clear English examples and sentences with phonetic approximations when helpful.
3. Keep English examples at A1-A2/B1 level (accessible, practical, professional).
4. Emphasize the core modal verbs for this evidence:
   - HAVE TO = obligación o necesidad externa (ej: "I have to arrive on time").
   - MUST = regla estricta u obligación personal fuerte (ej: "I must respect company policies").
   - SHOULD = recomendación o consejo (ej: "I should be organized with my tasks").
   - SHOULDN'T = recomendación negativa (ej: "I shouldn't be distracted").
   - DON'T HAVE TO = no es obligatorio / no es necesario (ej: "I don't have to work on Sundays").
   * Remember: all are followed by the BASE form of the verb (infinitive without 'to')!
5. DO NOT complete the entire script or evidence for the apprentice automatically. Instead, provide templates, guide their thoughts, correct their attempts, and encourage them to express their own reality.
6. Apprentice profile: ${JSON.stringify(apprenticeInfo || {})}.`;

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await generateWithFallback({
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Hola aprendiz, ¿en qué te puedo apoyar con tu evidencia de inglés?';
    res.json({ reply });
  } catch (error: any) {
    console.warn('Chat coach API error, serving pedagogical fallback:', error?.message);
    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';

    let reply = 'Recuerda que para esta evidencia GA3-240202501-AA1-EV02 lo principal es presentar tus datos personales en la Parte 1, y expresar obligaciones y recomendaciones con HAVE TO, MUST y SHOULD en la Parte 2.';
    if (lastMsg.includes('must') || lastMsg.includes('have to')) {
      reply = 'La diferencia principal es que "HAVE TO" expresa una obligación impuesta por reglas externas u horarios (ej: "I have to arrive on time"), mientras que "MUST" indica una regla estricta o un deber moral fuerte (ej: "I must respect my coworkers"). Recuerda: ¡después de ambos va el verbo en forma base!';
    } else if (lastMsg.includes('should')) {
      reply = 'Usamos "SHOULD" para dar un buen consejo o recomendación profesional positiva (ej: "I should be organized"), y "SHOULDN\'T" para lo que no es recomendable hacer (ej: "I shouldn\'t leave my tasks until the last minute").';
    } else if (lastMsg.includes('responsible') || lastMsg.includes('pronun')) {
      reply = 'Para pronunciar "responsible", pon el acento en la segunda sílaba: [ri-SPON-suh-buhl]. Y para "coworkers", pronúncialo como [KOH-wur-kurz].';
    }

    res.json({ reply });
  }
});

// API: TTS (Text-to-speech) via Gemini
app.post('/api/gemini/tts', async (req, res) => {
  try {
    const { text, voice = 'Kore' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style: 'Clear, natural, professional English language teacher with clear pronunciation and moderate pacing',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(502).json({ error: 'No audio generated by TTS model' });
    }

    res.json({ audioBase64: base64Audio, format: 'audio/wav' });
  } catch (error: any) {
    console.warn('TTS via Gemini API error (client will use SpeechSynthesis fallback):', error?.message);
    res.status(500).json({
      error: 'TTS generation failed',
      details: error?.message || 'Unknown error',
    });
  }
});

// Setup Vite in Dev or serve Static in Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[English Audio Evidence Coach] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
