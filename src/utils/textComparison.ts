/**
 * Text comparison and pronunciation phonetics helper
 */

export interface TokenComparison {
  word: string;
  status: 'correct' | 'warning' | 'missing' | 'extra';
  spokenWord?: string;
}

// Simple phonetics guide for common A1-B1 words in this evidence
export const PHONETIC_GUIDE: Record<string, { ipa: string; easy: string; tipEs: string }> = {
  responsible: {
    ipa: '/rɪˈspɒn.sə.bəl/',
    easy: 'ri-SPON-suh-buhl',
    tipEs: 'Acento en la segunda sílaba "spon". La "r" inicial es suave y gutural en inglés.',
  },
  obligation: {
    ipa: '/ˌɒb.lɪˈɡeɪ.ʃən/',
    easy: 'ob-li-GAY-shun',
    tipEs: 'Acento fuerte en "GAY". Termina en un sonido suave "shun".',
  },
  obligations: {
    ipa: '/ˌɒb.lɪˈɡeɪ.ʃənz/',
    easy: 'ob-li-GAY-shunz',
    tipEs: 'Termina con sonido vibrante "z".',
  },
  respect: {
    ipa: '/rɪˈspekt/',
    easy: 'ri-SPEKT',
    tipEs: 'No añadas una "e" antes de la "s". No digas "es-respect", empieza directamente con "r-spekt".',
  },
  coworkers: {
    ipa: '/ˈkoʊˌwɜːr.kərz/',
    easy: 'KOH-wur-kurz',
    tipEs: 'La "w" suena como una "u" prolongada: co-wér-kers.',
  },
  instructor: {
    ipa: '/ɪnˈstrʌk.tər/',
    easy: 'in-STRUK-ter',
    tipEs: 'Empieza con sonido "in", no con "es". Termina con "er" suave.',
  },
  schedule: {
    ipa: '/ˈskedʒ.uːl/',
    easy: 'SKEH-dzhool',
    tipEs: 'En inglés americano suena como "skéd-yul".',
  },
  academic: {
    ipa: '/ˌæk.əˈdem.ɪk/',
    easy: 'ak-uh-DEM-ik',
    tipEs: 'Acento en "DEM".',
  },
  attitudes: {
    ipa: '/ˈæt̬.ə.tuːdz/',
    easy: 'AT-ih-toodz',
    tipEs: 'Acento en la primera sílaba "AT".',
  },
  beliefs: {
    ipa: '/bɪˈliːfs/',
    easy: 'bi-LEEFS',
    tipEs: 'Sonido "ee" largo en el medio.',
  },
  should: {
    ipa: '/ʃʊd/',
    easy: 'SHUD',
    tipEs: '¡La "L" es muda! No pronuncies la "l". Se dice "shud".',
  },
  shouldnt: {
    ipa: '/ˈʃʊd.ənt/',
    easy: 'SHUD-nt',
    tipEs: 'La "L" sigue siendo muda. Se pronuncia "shud-nt".',
  },
  "shouldn't": {
    ipa: '/ˈʃʊd.ənt/',
    easy: 'SHUD-nt',
    tipEs: 'La "L" es muda. No digas "sholdent", di "shud-nt".',
  },
  must: {
    ipa: '/mʌst/',
    easy: 'MUHST',
    tipEs: 'Vocal corta central, parecida a una "a/o" suave, no una "u" española cerrada.',
  },
  knowledge: {
    ipa: '/ˈnɑː.lɪdʒ/',
    easy: 'NAH-lidzh',
    tipEs: 'La "K" inicial es completamente muda.',
  },
  environment: {
    ipa: '/ɪnˈvaɪ.rən.mənt/',
    easy: 'in-VYE-ron-ment',
    tipEs: 'Acento en la segunda sílaba "vye".',
  },
  punctual: {
    ipa: '/ˈpʌŋk.tʃu.əl/',
    easy: 'PUNK-choo-uhl',
    tipEs: 'Sonido "ch" en el medio.',
  },
  discipline: {
    ipa: '/ˈdɪs.ə.plɪn/',
    easy: 'DIS-ih-plin',
    tipEs: 'Acento en la primera sílaba "DIS".',
  },
  commitment: {
    ipa: '/kəˈmɪt.mənt/',
    easy: 'kuh-MIT-ment',
    tipEs: 'Doble "m" suena como una sola. Acento en "MIT".',
  },
  evidence: {
    ipa: '/ˈev.ə.dəns/',
    easy: 'EV-ih-duhns',
    tipEs: 'Acento en la primera sílaba "EV".',
  }
};

/**
 * Clean a string of punctuation and return lowercase array of words
 */
export function tokenizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

/**
 * Compare target script tokens against spoken transcript tokens
 */
export function compareScriptToSpoken(expectedScript: string, spokenText: string): TokenComparison[] {
  const expectedWords = tokenizeWords(expectedScript);
  const spokenWords = tokenizeWords(spokenText);

  if (expectedWords.length === 0) return [];
  if (spokenWords.length === 0) {
    return expectedWords.map((w) => ({ word: w, status: 'missing' }));
  }

  const spokenSet = new Set(spokenWords);
  const comparisons: TokenComparison[] = [];

  let spokenIndex = 0;

  for (let i = 0; i < expectedWords.length; i++) {
    const exp = expectedWords[i];
    
    // Check direct match at current cursor
    if (spokenIndex < spokenWords.length && spokenWords[spokenIndex] === exp) {
      comparisons.push({ word: exp, status: 'correct', spokenWord: exp });
      spokenIndex++;
      continue;
    }

    // Check if spoken word is very close (Levenshtein distance <= 2)
    if (spokenIndex < spokenWords.length && isSimilar(exp, spokenWords[spokenIndex])) {
      comparisons.push({
        word: exp,
        status: 'warning',
        spokenWord: spokenWords[spokenIndex],
      });
      spokenIndex++;
      continue;
    }

    // Lookahead a bit in spoken words
    let foundAhead = -1;
    for (let k = spokenIndex; k < Math.min(spokenIndex + 4, spokenWords.length); k++) {
      if (spokenWords[k] === exp) {
        foundAhead = k;
        break;
      }
    }

    if (foundAhead !== -1) {
      comparisons.push({ word: exp, status: 'correct', spokenWord: exp });
      spokenIndex = foundAhead + 1;
    } else if (spokenSet.has(exp)) {
      comparisons.push({ word: exp, status: 'warning', spokenWord: exp });
    } else {
      comparisons.push({ word: exp, status: 'missing' });
    }
  }

  return comparisons;
}

function isSimilar(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 2) return false;
  
  let diffs = 0;
  const minLen = Math.min(a.length, b.length);
  for (let i = 0; i < minLen; i++) {
    if (a[i] !== b[i]) diffs++;
    if (diffs > 2) return false;
  }
  return true;
}

/**
 * Compare ONLY what the student actually spoke.
 * Displays only the words uttered in the audio, checking which ones match the expected script.
 */
export function compareSpokenWordsOnly(spokenText: string, scriptText: string): TokenComparison[] {
  const spokenWords = tokenizeWords(spokenText);
  const scriptWords = new Set(tokenizeWords(scriptText));

  return spokenWords.map((word) => {
    if (scriptWords.has(word)) {
      return { word, status: 'correct' as const };
    }
    for (const scriptWord of scriptWords) {
      if (isSimilar(word, scriptWord)) {
        return { word, status: 'warning' as const, spokenWord: scriptWord };
      }
    }
    return { word, status: 'warning' as const };
  });
}

