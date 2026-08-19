export type EnglishReviewStatus = "corrected" | "natural" | "skip";

export interface EnglishReview {
  status: EnglishReviewStatus;
  correctedText: string;
  notes: string[];
}

export interface ReviewToken {
  text: string;
  leadingSpace: boolean;
  changed: boolean;
}

export interface EnglishReviewDiff {
  before: ReviewToken[];
  after: ReviewToken[];
  hasChanges: boolean;
}

const MAX_DIFF_TOKENS = 1_000;
const LOW_SIMILARITY_THRESHOLD = 0.3;

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function extractJsonRecord(text: string): Record<string, unknown> | undefined {
  const normalized = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const start = normalized.indexOf("{");
  const end = normalized.lastIndexOf("}");
  if (start === -1 || end <= start) return undefined;

  try {
    return asRecord(JSON.parse(normalized.slice(start, end + 1)));
  } catch {
    return undefined;
  }
}

function normalizeNotes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((note): note is string => typeof note === "string")
    .map((note) => note.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function normalizeStatus(value: unknown): EnglishReviewStatus | undefined {
  return value === "corrected" || value === "natural" || value === "skip"
    ? value
    : undefined;
}

function parseLegacyReview(response: string, originalText: string): EnglishReview {
  const normalized = response.trim();
  if (/no english feedback (?:is )?needed/i.test(normalized)) {
    return { status: "skip", correctedText: originalText, notes: [] };
  }
  if (/already (?:natural|correct|clear)/i.test(normalized)) {
    return { status: "natural", correctedText: originalText, notes: [] };
  }

  const lines = normalized.split(/\r?\n/);
  const noteStart = lines.findIndex((line) => /^\s*\d+[.)]\s+/.test(line));
  const correctionLines = noteStart === -1 ? lines : lines.slice(0, noteStart);
  const noteLines = noteStart === -1 ? [] : lines.slice(noteStart);
  const correctedText = correctionLines.join("\n").trim() || originalText;
  const notes = noteLines
    .map((line) => line.replace(/^\s*\d+[.)]\s+/, "").trim())
    .filter(Boolean)
    .slice(0, 3);

  return {
    status: correctedText === originalText.trim() ? "natural" : "corrected",
    correctedText,
    notes,
  };
}

export function parseEnglishReview(
  response: string,
  originalText: string,
): EnglishReview {
  const payload = extractJsonRecord(response);
  if (!payload) return parseLegacyReview(response, originalText);

  const declaredStatus = normalizeStatus(payload.status);
  const correctedText =
    typeof payload.corrected === "string" && payload.corrected.trim()
      ? payload.corrected.trim()
      : originalText;
  const notes = normalizeNotes(payload.notes);

  if (declaredStatus === "skip") {
    return { status: "skip", correctedText: originalText, notes };
  }

  return {
    status:
      correctedText === originalText.trim() ? "natural" : "corrected",
    correctedText,
    notes,
  };
}

interface SourceToken {
  text: string;
  leadingSpace: boolean;
}

function tokenize(text: string): SourceToken[] {
  const tokens: SourceToken[] = [];
  const pattern = /[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*|[^\s]/gu;
  let previousEnd = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? previousEnd;
    tokens.push({
      text: match[0],
      leadingSpace: /\s/.test(text.slice(previousEnd, index)),
    });
    previousEnd = index + match[0].length;
  }

  return tokens;
}

function markEveryTokenChanged(
  before: SourceToken[],
  after: SourceToken[],
): EnglishReviewDiff {
  return {
    before: before.map((token) => ({ ...token, changed: true })),
    after: after.map((token) => ({ ...token, changed: true })),
    hasChanges: true,
  };
}

export function createEnglishReviewDiff(
  originalText: string,
  correctedText: string,
): EnglishReviewDiff {
  const before = tokenize(originalText.trim());
  const after = tokenize(correctedText.trim());

  if (originalText.trim() === correctedText.trim()) {
    return {
      before: before.map((token) => ({ ...token, changed: false })),
      after: after.map((token) => ({ ...token, changed: false })),
      hasChanges: false,
    };
  }

  if (
    before.length === 0 ||
    after.length === 0 ||
    before.length > MAX_DIFF_TOKENS ||
    after.length > MAX_DIFF_TOKENS
  ) {
    return markEveryTokenChanged(before, after);
  }

  const columns = after.length + 1;
  const lengths = new Uint16Array((before.length + 1) * columns);

  for (let beforeIndex = before.length - 1; beforeIndex >= 0; beforeIndex--) {
    for (let afterIndex = after.length - 1; afterIndex >= 0; afterIndex--) {
      const offset = beforeIndex * columns + afterIndex;
      lengths[offset] =
        before[beforeIndex].text === after[afterIndex].text
          ? lengths[(beforeIndex + 1) * columns + afterIndex + 1] + 1
          : Math.max(
              lengths[(beforeIndex + 1) * columns + afterIndex],
              lengths[beforeIndex * columns + afterIndex + 1],
            );
    }
  }

  const matchedBefore = new Set<number>();
  const matchedAfter = new Set<number>();
  let beforeIndex = 0;
  let afterIndex = 0;

  while (beforeIndex < before.length && afterIndex < after.length) {
    if (before[beforeIndex].text === after[afterIndex].text) {
      matchedBefore.add(beforeIndex++);
      matchedAfter.add(afterIndex++);
      continue;
    }

    if (
      lengths[(beforeIndex + 1) * columns + afterIndex] >=
      lengths[beforeIndex * columns + afterIndex + 1]
    ) {
      beforeIndex++;
    } else {
      afterIndex++;
    }
  }

  const similarity =
    matchedBefore.size / Math.max(before.length, after.length, 1);
  if (similarity < LOW_SIMILARITY_THRESHOLD) {
    return markEveryTokenChanged(before, after);
  }

  return {
    before: before.map((token, index) => ({
      ...token,
      changed: !matchedBefore.has(index),
    })),
    after: after.map((token, index) => ({
      ...token,
      changed: !matchedAfter.has(index),
    })),
    hasChanges: true,
  };
}

export function formatEnglishReview(review: EnglishReview): string {
  const notes = review.notes.map((note, index) => `${index + 1}. ${note}`);
  return [review.correctedText, ...notes].join("\n");
}
