/**
 * Offline brute-force computation of each level's worst / target / perfect
 * harmony totals.
 *
 * The game must never enumerate the up-to-12! seat permutations at runtime, so
 * these bounds are precomputed here and pasted into `SCORE_STATS` in
 * `src/data/levels.ts`.
 *
 * Method (exact — no sampling, no symmetry reduction):
 *   1. Build a fast integer scorer from each level's active preferences and
 *      table geometry (adjacency / opposite / end seats as bitmasks).
 *   2. Validate that scorer against the canonical `computeSeatingScore` over
 *      many random seatings; abort on any mismatch so the fast path can never
 *      drift from the real rules.
 *   3. Enumerate every one of the S! seat orderings (assigning the guests to
 *      the first C seats, exactly like `computeScoreStats`), accumulating a
 *      histogram of totals so memory stays O(distinct scores) rather than
 *      O(S!).
 *   4. Derive worst = min, perfect = max, target = the value at rank
 *      ceil(0.8 * N) (the 80th percentile, matching the runtime definition).
 *
 * Run with:  npx vite-node scripts/computeLevelStats.ts
 */

import { LEVELS } from "@/data/levels";
import {
  getActivePreferencesForLevel,
  preferenceTargetIds,
} from "@/data/preferences";
import {
  collectAdjacentPairs,
  collectEndSeatIds,
  collectOppositePairs,
  collectSeatIds,
} from "@/game/geometry";
import { computeSeatingScore } from "@/game/scoring";
import type {
  CharacterId,
  LevelDefinition,
  PreferenceDefinition,
  SeatingPlan,
} from "@/types";

/** Completion target percentile, kept in sync with scoring.ts. */
const TARGET_PERCENTILE = 80;

/** Random seatings checked per level before trusting the fast scorer. */
const VALIDATION_SAMPLES = 50_000;

const KIND_END = 0;
const KIND_ADJ = 1;
const KIND_OPP = 2;
const KIND_BOTH = 3;

type FastModel = {
  seatIds: string[];
  seatCount: number;
  guestCount: number;
  characterIds: CharacterId[];
  adjMask: Int32Array;
  oppMask: Int32Array;
  bothMask: Int32Array;
  endMask: number;
  prefOwner: Int32Array;
  prefKind: Int32Array;
  prefPts: Int32Array;
  prefTargetStart: Int32Array;
  prefTargetEnd: Int32Array;
  prefTargetGuests: Int32Array;
};

function buildFastModel(level: LevelDefinition): FastModel {
  const seatIds = collectSeatIds(level.tables);
  const seatCount = seatIds.length;
  const seatIndex = new Map<string, number>();
  seatIds.forEach((id, index) => seatIndex.set(id, index));

  const characterIds = level.characterIds;
  const guestCount = characterIds.length;
  const guestIndex = new Map<CharacterId, number>();
  characterIds.forEach((id, index) => guestIndex.set(id, index));

  const adjMask = new Int32Array(seatCount);
  const oppMask = new Int32Array(seatCount);
  for (const [a, b] of collectAdjacentPairs(level.tables)) {
    const ia = seatIndex.get(a)!;
    const ib = seatIndex.get(b)!;
    adjMask[ia] |= 1 << ib;
    adjMask[ib] |= 1 << ia;
  }
  for (const [a, b] of collectOppositePairs(level.tables)) {
    const ia = seatIndex.get(a)!;
    const ib = seatIndex.get(b)!;
    oppMask[ia] |= 1 << ib;
    oppMask[ib] |= 1 << ia;
  }
  const bothMask = new Int32Array(seatCount);
  for (let s = 0; s < seatCount; s += 1) {
    bothMask[s] = adjMask[s] | oppMask[s];
  }

  let endMask = 0;
  for (const endId of collectEndSeatIds(level.tables)) {
    endMask |= 1 << seatIndex.get(endId)!;
  }

  const active = getActivePreferencesForLevel(characterIds);
  const prefOwner: number[] = [];
  const prefKind: number[] = [];
  const prefPts: number[] = [];
  const prefTargetStart: number[] = [];
  const prefTargetEnd: number[] = [];
  const prefTargetGuests: number[] = [];

  const kindOf = (preference: PreferenceDefinition): number => {
    switch (preference.condition) {
      case "end-seat":
        return KIND_END;
      case "adjacent":
        return KIND_ADJ;
      case "opposite":
        return KIND_OPP;
      case "adjacent-or-opposite":
        return KIND_BOTH;
    }
  };

  for (const preference of active) {
    const owner = guestIndex.get(preference.ownerId)!;
    const kind = kindOf(preference);
    const start = prefTargetGuests.length;
    if (kind !== KIND_END) {
      for (const targetId of preferenceTargetIds(preference)) {
        if (targetId === preference.ownerId) {
          continue;
        }
        const gi = guestIndex.get(targetId);
        if (gi !== undefined) {
          prefTargetGuests.push(gi);
        }
      }
    }
    prefOwner.push(owner);
    prefKind.push(kind);
    prefPts.push(preference.points);
    prefTargetStart.push(start);
    prefTargetEnd.push(prefTargetGuests.length);
  }

  return {
    seatIds,
    seatCount,
    guestCount,
    characterIds,
    adjMask,
    oppMask,
    bothMask,
    endMask,
    prefOwner: Int32Array.from(prefOwner),
    prefKind: Int32Array.from(prefKind),
    prefPts: Int32Array.from(prefPts),
    prefTargetStart: Int32Array.from(prefTargetStart),
    prefTargetEnd: Int32Array.from(prefTargetEnd),
    prefTargetGuests: Int32Array.from(prefTargetGuests),
  };
}

/**
 * Scores a seat ordering. `order[g]` is the seat index of guest `g` (only the
 * first `guestCount` entries matter; the rest are empty seats).
 */
function scoreOrder(model: FastModel, order: Int32Array): number {
  const {
    prefOwner,
    prefKind,
    prefPts,
    prefTargetStart,
    prefTargetEnd,
    prefTargetGuests,
    adjMask,
    oppMask,
    bothMask,
    endMask,
  } = model;
  let total = 0;
  for (let p = 0; p < prefOwner.length; p += 1) {
    const ownerSeat = order[prefOwner[p]];
    const kind = prefKind[p];
    if (kind === KIND_END) {
      if ((endMask >> ownerSeat) & 1) {
        total += prefPts[p];
      }
      continue;
    }
    const relMask =
      kind === KIND_ADJ
        ? adjMask[ownerSeat]
        : kind === KIND_OPP
          ? oppMask[ownerSeat]
          : bothMask[ownerSeat];
    const start = prefTargetStart[p];
    const end = prefTargetEnd[p];
    let triggered = false;
    for (let t = start; t < end; t += 1) {
      if ((relMask >> order[prefTargetGuests[t]]) & 1) {
        triggered = true;
        break;
      }
    }
    if (triggered) {
      total += prefPts[p];
    }
  }
  return total;
}

function planFromOrder(model: FastModel, order: Int32Array): SeatingPlan {
  const plan: SeatingPlan = {};
  for (const seatId of model.seatIds) {
    plan[seatId] = null;
  }
  for (let g = 0; g < model.guestCount; g += 1) {
    plan[model.seatIds[order[g]]] = model.characterIds[g];
  }
  return plan;
}

function validate(model: FastModel, level: LevelDefinition): void {
  const { seatCount } = model;
  const order = new Int32Array(seatCount);
  for (let i = 0; i < VALIDATION_SAMPLES; i += 1) {
    for (let s = 0; s < seatCount; s += 1) {
      order[s] = s;
    }
    // Fisher-Yates shuffle.
    for (let s = seatCount - 1; s > 0; s -= 1) {
      const j = Math.floor(Math.random() * (s + 1));
      const tmp = order[s];
      order[s] = order[j];
      order[j] = tmp;
    }
    const fast = scoreOrder(model, order);
    const canonical = computeSeatingScore(
      level,
      planFromOrder(model, order),
    ).total;
    if (fast !== canonical) {
      throw new Error(
        `Fast scorer mismatch for level ${level.id}: fast=${fast} canonical=${canonical}`,
      );
    }
  }
}

type Stats = { worst: number; target: number; perfect: number; count: number };

/** Enumerates every S! ordering with Heap's algorithm, histogramming totals. */
function enumerate(model: FastModel): Stats {
  const n = model.seatCount;
  const order = new Int32Array(n);
  for (let s = 0; s < n; s += 1) {
    order[s] = s;
  }
  const stack = new Int32Array(n).fill(0);
  const histogram = new Map<number, number>();
  let count = 0;

  const record = (score: number) => {
    histogram.set(score, (histogram.get(score) ?? 0) + 1);
    count += 1;
  };

  record(scoreOrder(model, order));

  let i = 0;
  while (i < n) {
    if (stack[i] < i) {
      const swapWith = i % 2 === 0 ? 0 : stack[i];
      const tmp = order[swapWith];
      order[swapWith] = order[i];
      order[i] = tmp;
      record(scoreOrder(model, order));
      stack[i] += 1;
      i = 0;
    } else {
      stack[i] = 0;
      i += 1;
    }
  }

  let worst = Infinity;
  let perfect = -Infinity;
  for (const score of histogram.keys()) {
    if (score < worst) {
      worst = score;
    }
    if (score > perfect) {
      perfect = score;
    }
  }

  const rank = Math.ceil((TARGET_PERCENTILE / 100) * count);
  let cumulative = 0;
  let target = perfect;
  const sortedScores = [...histogram.keys()].sort((a, b) => a - b);
  for (const score of sortedScores) {
    cumulative += histogram.get(score)!;
    if (cumulative >= rank) {
      target = score;
      break;
    }
  }

  return { worst, target, perfect, count };
}

function main(): void {
  const lines: string[] = [];
  for (const level of LEVELS) {
    const started = Date.now();
    const model = buildFastModel(level);
    validate(model, level);
    const stats = enumerate(model);
    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    console.log(
      `Level ${level.id} (${model.guestCount} guests / ${model.seatCount} seats): ` +
        `worst=${stats.worst} target=${stats.target} perfect=${stats.perfect} ` +
        `[${stats.count.toLocaleString()} orderings, ${seconds}s]`,
    );
    lines.push(
      `  "${level.id}": { worst: ${stats.worst}, target: ${stats.target}, perfect: ${stats.perfect} },`,
    );
  }

  console.log("\nPaste into SCORE_STATS in src/data/levels.ts:\n");
  console.log(
    'const SCORE_STATS: Record<string, LevelDefinition["scoreStats"]> = {',
  );
  for (const line of lines) {
    console.log(line);
  }
  console.log("};");
}

main();
