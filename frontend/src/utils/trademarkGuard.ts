/**
 * Trademark & Copyright Protection Guard Utility
 * Prevents registration of duplicate, deceptively similar, or acronym-colliding brand names
 * (e.g., KFC vs Kentucky Fried Chicken, BrewCraft vs BrewKraft, IronPulse vs Iron Pulse)
 */

export interface TrademarkConflict {
  conflict: boolean;
  existingName: string;
  reason: string;
  description: string;
}

const LEGAL_STOPWORDS = new Set([
  'pvt', 'ltd', 'private', 'limited', 'llp', 'inc', 'corp', 'corporation',
  'co', 'company', 'enterprises', 'enterprise', 'the', 'and', 'franchise',
  'franchises', 'group', 'india', 'global', 'international', 'holdings',
  'solutions', 'services', 'systems', 'network', 'chain', 'hub', 'brand',
  'brands', 'lounge', 'center', 'centre', 'academy', 'gym', 'fitness',
  'store', 'stores', 'outlet', 'outlets', 'shop', 'shops'
]);

export const BASELINE_PROTECTED_BRANDS = [
  "Kentucky Fried Chicken",
  "KFC",
  "McDonald's",
  "Starbucks",
  "Subway",
  "Burger King",
  "Domino's Pizza",
  "Pizza Hut",
  "Dunkin'",
  "Taco Bell",
  "Baskin Robbins",
  "Cafe Coffee Day",
  "Chai Point",
  "Chaayos",
  "Haldiram's",
  "Barbeque Nation",
  "Tim Hortons",
  "Chipotle Mexican Grill",
  "Wendy's",
  "Krispy Kreme",
  "Nando's",
  "Costa Coffee",
  "Cinnabon",
  "Papa John's",
  "Gold's Gym",
  "Anytime Fitness",
  "Cult.fit",
  "Lenskart",
  "Apollo Pharmacy",
  "Dr Lal PathLabs"
];

function tokenize(text: string = ''): string[] {
  const matches = text.toLowerCase().match(/[a-z0-9]+/g);
  return matches || [];
}

function cleanTokens(text: string): string[] {
  return tokenize(text).filter((t) => !LEGAL_STOPWORDS.has(t));
}

function extractAcronym(tokens: string[]): string {
  return tokens.map((t) => t[0] || '').join('');
}

// Levenshtein similarity ratio between two strings (0.0 to 1.0)
function stringSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;
  
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  const distance = dp[m][n];
  const maxLen = Math.max(m, n);
  return (maxLen - distance) / maxLen;
}

/**
 * Checks candidate brand name against a list of known brand names
 */
export function checkBrandTrademark(
  candidateName: string,
  existingBrands: string[] = []
): TrademarkConflict | null {
  const trimmed = candidateName.trim();
  if (!trimmed || trimmed.length < 2) return null;

  const allCandidateTokens = tokenize(trimmed);
  const candTokens = cleanTokens(trimmed);
  if (allCandidateTokens.length === 0) return null;

  const candNorm = candTokens.length > 0 ? candTokens.join(' ') : allCandidateTokens.join(' ');
  const candCompressed = candTokens.length > 0 ? candTokens.join('') : allCandidateTokens.join('');
  const allCandCompressed = allCandidateTokens.join('');

  const candAcronymStopwords = candTokens.length > 0 ? extractAcronym(candTokens) : '';
  const candAcronymAll = extractAcronym(allCandidateTokens);

  const combinedCatalog = Array.from(new Set([...BASELINE_PROTECTED_BRANDS, ...existingBrands]));

  for (const existingName of combinedCatalog) {
    const exTrimmed = existingName.trim();
    if (!exTrimmed) continue;

    const allExTokens = tokenize(exTrimmed);
    const exTokens = cleanTokens(exTrimmed);
    if (allExTokens.length === 0) continue;

    const exNorm = exTokens.length > 0 ? exTokens.join(' ') : allExTokens.join(' ');
    const exCompressed = exTokens.length > 0 ? exTokens.join('') : allExTokens.join('');
    const allExCompressed = allExTokens.join('');

    const exAcronymStopwords = exTokens.length > 0 ? extractAcronym(exTokens) : '';
    const exAcronymAll = extractAcronym(allExTokens);

    // 1. Exact or Normalized Collision
    if (allCandCompressed === allExCompressed || candCompressed === exCompressed) {
      return {
        conflict: true,
        existingName,
        reason: 'Direct Trademark Collision',
        description: `Direct collision with registered brand "${existingName}".`,
      };
    }

    // 2. Acronym & Initialism Cross-Match (e.g., KFC <-> Kentucky Fried Chicken)
    const candShort = allCandCompressed;
    if (candShort.length >= 2 && candShort.length <= 5) {
      if (candShort === exAcronymAll || (exAcronymStopwords && candShort === exAcronymStopwords)) {
        return {
          conflict: true,
          existingName,
          reason: 'Acronym Trademark Infringement',
          description: `"${candidateName.toUpperCase()}" is the registered commercial acronym for "${existingName}".`,
        };
      }
    }

    const exShort = allExCompressed;
    if (exShort.length >= 2 && exShort.length <= 5) {
      if (exShort === candAcronymAll || (candAcronymStopwords && exShort === candAcronymStopwords)) {
        return {
          conflict: true,
          existingName,
          reason: 'Acronym Trademark Infringement',
          description: `"${candidateName}" expands registered trademark acronym "${existingName}".`,
        };
      }
    }

    // Matching Multi-Word Acronyms (e.g., K.F.C. vs Kentucky Fried Chicken)
    if (
      candAcronymStopwords.length >= 3 &&
      candAcronymStopwords === exAcronymStopwords
    ) {
      return {
        conflict: true,
        existingName,
        reason: 'Acronym Identifier Collision',
        description: `Shares registered acronym identifier "${candAcronymStopwords.toUpperCase()}" with "${existingName}".`,
      };
    }

    // 3. Compound / Prefix Core Collision (e.g. Iron Pulse vs IronPulse)
    const candLeadToken = candTokens[0] || allCandidateTokens[0];
    const exLeadToken = exTokens[0] || allExTokens[0];

    const candTwoLead = allCandidateTokens.slice(0, 2).join('');
    const exTwoLead = allExTokens.slice(0, 2).join('');
    if (
      (candTwoLead.length >= 6 && (candTwoLead === exLeadToken || candTwoLead === exTwoLead)) ||
      (exTwoLead.length >= 6 && (exTwoLead === candLeadToken || exTwoLead === candTwoLead))
    ) {
      return {
        conflict: true,
        existingName,
        reason: 'Core Brand Name Collision',
        description: `Shares proprietary core brand root with registered brand "${existingName}".`,
      };
    }

    // 4. Primary Distinctive Token Similarity (Fuzzy & Exact)
    if (candLeadToken.length >= 4 && exLeadToken.length >= 4) {
      if (candLeadToken === exLeadToken) {
        return {
          conflict: true,
          existingName,
          reason: 'Core Brand Collision',
          description: `Shares distinctive trademark root "${candLeadToken.toUpperCase()}" with registered brand "${existingName}".`,
        };
      }

      const ratioLead = stringSimilarity(candLeadToken, exLeadToken);
      if (ratioLead >= 0.78) {
        return {
          conflict: true,
          existingName,
          reason: 'Deceptive Similarity / Typosquatting',
          description: `Brand root "${candLeadToken}" is deceptively similar (${Math.round(ratioLead * 100)}% match) to registered brand "${existingName}".`,
        };
      }
    }

    // 5. Token Subset Overlap
    const candSet = new Set(candTokens.length > 0 ? candTokens : allCandidateTokens);
    const exSet = new Set(exTokens.length > 0 ? exTokens : allExTokens);
    let commonCount = 0;
    candSet.forEach((t) => {
      if (exSet.has(t)) commonCount++;
    });

    if (
      commonCount >= 2 &&
      (commonCount / candSet.size >= 0.6 || commonCount / exSet.size >= 0.6)
    ) {
      return {
        conflict: true,
        existingName,
        reason: 'Substantial Trademark Overlap',
        description: `Substantial overlapping trademark terms with registered brand "${existingName}".`,
      };
    }

    // 6. Overall String Similarity
    const ratioNorm = stringSimilarity(candNorm, exNorm);
    if (ratioNorm >= 0.78) {
      return {
        conflict: true,
        existingName,
        reason: 'High Visual & Phonetic Similarity',
        description: `Brand name is ${Math.round(ratioNorm * 100)}% visually and phonetically similar to registered brand "${existingName}".`,
      };
    }
  }

  return null;
}
