import { Question, QuestionType, Difficulty } from './types';

// Utility functions
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

function formatCurrency(num: number): string {
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(1)}B`;
  } else if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(1)}M`;
  } else if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(0)}K`;
  }
  return `$${formatNumber(num)}`;
}

// Track recently used question signatures to avoid repetition
const recentQuestions: Set<string> = new Set();
const MAX_RECENT = 100;

function addToRecent(signature: string): void {
  recentQuestions.add(signature);
  if (recentQuestions.size > MAX_RECENT) {
    const first = recentQuestions.values().next().value;
    if (first) recentQuestions.delete(first);
  }
}

function isRecent(signature: string): boolean {
  return recentQuestions.has(signature);
}

// ============================================
// MENTAL MATH FRIENDLY NUMBERS
// These are designed to have clean calculation paths
// ============================================

// Percentages with mental shortcuts
// 10% = divide by 10
// 5% = half of 10%
// 15% = 10% + 5%
// 20% = 10% × 2
// 25% = divide by 4
// 50% = divide by 2
// 1% = divide by 100
const PRECISE_EASY_PERCENTAGES = [10, 20, 25, 50, 5, 15];
const PRECISE_MEDIUM_PERCENTAGES = [10, 15, 20, 25, 30, 5, 12, 8]; // 12 = 10+2, 8 = 10-2
const PRECISE_TOUGH_PERCENTAGES = [15, 12, 18, 22, 35, 45, 8, 6]; // Combinations

// For estimate mode - real world messier percentages
const ESTIMATE_PERCENTAGES = [7, 13, 17, 19, 23, 27, 31, 37, 41, 43, 47];

// Clean base numbers that work well with mental math
const PRECISE_EASY_BASES = [100, 200, 400, 500, 1000, 2000, 4000, 5000, 10000, 20000, 50000, 100000];
const PRECISE_MEDIUM_BASES = [120, 150, 240, 300, 360, 400, 450, 480, 600, 750, 800, 900, 1200, 1500, 1800, 2400, 3000, 3600, 4500, 4800, 6000, 7500, 8000, 9000, 12000, 15000, 18000, 24000, 30000, 36000, 45000, 48000, 60000, 75000, 80000, 90000, 120000, 150000];
const PRECISE_TOUGH_BASES = [125, 175, 225, 275, 325, 375, 425, 475, 525, 625, 725, 825, 925, 1250, 1750, 2250, 2750, 3250, 3750, 4250, 12500, 17500, 22500, 27500, 32500, 125000, 175000, 225000];

// For estimate mode - real world numbers
const ESTIMATE_BASES = [
  1_340_000, 2_780_000, 4_560_000, 7_890_000, 13_400_000, 27_800_000, 
  45_600_000, 78_900_000, 134_000_000, 278_000_000, 456_000_000, 789_000_000,
  1_340_000_000, 2_780_000_000, 4_560_000_000, 7_890_000_000, 13_400_000_000
];

// Easy multipliers with clean mental paths
const EASY_MULTIPLIERS = [2, 3, 4, 5, 6, 8, 10, 11, 12];
const MEDIUM_MULTIPLIERS = [7, 9, 12, 15, 18, 24, 25];
const TOUGH_MULTIPLIERS = [13, 14, 16, 17, 19, 21, 22, 23];

// ============================================
// QUESTION TEMPLATES
// ============================================

// 1. Basic percentage - PRECISE version with mental shortcuts
function percentOfNumberPrecise(difficulty: Difficulty): Question | null {
  let base: number;
  let pct: number;
  
  switch (difficulty) {
    case 'easy':
      base = randomChoice(PRECISE_EASY_BASES);
      pct = randomChoice(PRECISE_EASY_PERCENTAGES);
      break;
    case 'medium':
      base = randomChoice(PRECISE_MEDIUM_BASES);
      pct = randomChoice(PRECISE_MEDIUM_PERCENTAGES);
      break;
    case 'tough':
      base = randomChoice(PRECISE_TOUGH_BASES);
      pct = randomChoice(PRECISE_TOUGH_PERCENTAGES);
      break;
  }
  
  const signature = `pct_precise_${pct}_${base}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const correctAnswer = base * pct / 100;
  
  // Add hint about mental shortcut
  let hint = '';
  if (pct === 10) hint = ' (Tip: divide by 10)';
  else if (pct === 5) hint = ' (Tip: half of 10%)';
  else if (pct === 15) hint = ' (Tip: 10% + 5%)';
  else if (pct === 20) hint = ' (Tip: 10% × 2)';
  else if (pct === 25) hint = ' (Tip: divide by 4)';
  else if (pct === 50) hint = ' (Tip: divide by 2)';
  
  const prompt = `What is ${pct}% of ${formatNumber(base)}?${difficulty === 'easy' ? hint : ''}`;
  
  return {
    id: generateId(),
    type: 'accurate',
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: base, percent: pct, operation: 'percent' }
  };
}

// 2. Percentage for ESTIMATE mode - messier real-world numbers
function percentOfNumberEstimate(difficulty: Difficulty): Question | null {
  let base: number;
  let pct: number;
  
  const contexts = [
    'Total addressable market',
    'Company valuation', 
    'Annual revenue',
    'Market size',
    'Industry revenue',
    'Global sales'
  ];
  
  switch (difficulty) {
    case 'easy':
      base = randomChoice(ESTIMATE_BASES.slice(0, 6));
      pct = randomChoice([5, 10, 15, 20]);
      break;
    case 'medium':
      base = randomChoice(ESTIMATE_BASES.slice(3, 12));
      pct = randomChoice(ESTIMATE_PERCENTAGES.slice(0, 6));
      break;
    case 'tough':
      base = randomChoice(ESTIMATE_BASES.slice(6));
      pct = randomChoice(ESTIMATE_PERCENTAGES);
      break;
  }
  
  const signature = `pct_est_${pct}_${base}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const correctAnswer = base * pct / 100;
  const context = randomChoice(contexts);
  
  const prompt = `${context} is ${formatCurrency(base)}. Estimate ${pct}% of that.`;
  
  return {
    id: generateId(),
    type: 'estimate',
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: base, percent: pct, operation: 'percent_estimate' }
  };
}

// 3. Simple multiplication - PRECISE with clean numbers
function multiplicationPrecise(difficulty: Difficulty): Question | null {
  let a: number;
  let b: number;
  
  switch (difficulty) {
    case 'easy':
      a = randomChoice([12, 15, 18, 20, 24, 25, 30, 36, 40, 45, 48, 50, 60, 72, 75, 80, 90, 100, 120, 125]);
      b = randomChoice(EASY_MULTIPLIERS);
      break;
    case 'medium':
      a = randomChoice([35, 45, 55, 65, 75, 85, 95, 125, 150, 175, 225, 250, 275, 325, 350, 375, 425, 450]);
      b = randomChoice(MEDIUM_MULTIPLIERS);
      break;
    case 'tough':
      a = randomChoice([135, 145, 155, 165, 185, 195, 215, 235, 245, 255, 265, 285, 295, 315, 335, 345]);
      b = randomChoice(TOUGH_MULTIPLIERS);
      break;
  }
  
  const signature = `mult_${a}_${b}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const correctAnswer = a * b;
  const prompt = `${a} × ${b} = ?`;
  
  return {
    id: generateId(),
    type: 'accurate',
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: a, secondValue: b, operation: 'multiplication' }
  };
}

// 4. Division - PRECISE with clean results
function divisionPrecise(difficulty: Difficulty): Question | null {
  let divisor: number;
  let quotient: number;
  
  switch (difficulty) {
    case 'easy':
      divisor = randomChoice([2, 4, 5, 8, 10]);
      quotient = randomChoice([15, 20, 25, 30, 35, 40, 45, 50, 60, 75, 80, 100, 120, 125, 150, 200, 250]);
      break;
    case 'medium':
      divisor = randomChoice([3, 6, 7, 8, 9, 12, 15]);
      quotient = randomChoice([45, 60, 72, 80, 90, 96, 108, 120, 135, 144, 150, 160, 180, 200, 240, 250, 300]);
      break;
    case 'tough':
      divisor = randomChoice([7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18]);
      quotient = randomChoice([125, 144, 156, 168, 175, 192, 225, 234, 256, 275, 288, 325, 350, 375, 400, 425, 450]);
      break;
  }
  
  const base = divisor * quotient;
  const signature = `div_${base}_${divisor}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const prompt = `${formatNumber(base)} ÷ ${divisor} = ?`;
  
  return {
    id: generateId(),
    type: 'accurate',
    difficulty,
    prompt,
    correctAnswer: quotient,
    meta: { baseValue: base, secondValue: divisor, operation: 'division' }
  };
}

// 5. Profit margin - PRECISE
function profitMarginPrecise(difficulty: Difficulty): Question | null {
  let revenue: number;
  let marginPct: number;
  
  switch (difficulty) {
    case 'easy':
      revenue = randomChoice([100000, 200000, 400000, 500000, 800000, 1000000, 2000000]);
      marginPct = randomChoice([10, 20, 25, 50]);
      break;
    case 'medium':
      revenue = randomChoice([120000, 150000, 180000, 240000, 300000, 360000, 450000, 600000, 750000, 900000, 1200000, 1500000]);
      marginPct = randomChoice([10, 15, 20, 25, 30]);
      break;
    case 'tough':
      revenue = randomChoice([125000, 175000, 225000, 275000, 325000, 375000, 425000, 475000, 525000, 625000, 725000, 825000]);
      marginPct = randomChoice([12, 15, 18, 22, 24, 28]);
      break;
  }
  
  const signature = `margin_p_${revenue}_${marginPct}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const correctAnswer = revenue * marginPct / 100;
  const prompt = `Revenue: $${formatNumber(revenue)}. Margin: ${marginPct}%. What is the profit?`;
  
  return {
    id: generateId(),
    type: 'accurate',
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: revenue, percent: marginPct, operation: 'margin' }
  };
}

// 6. Profit margin - ESTIMATE with real-world numbers
function profitMarginEstimate(difficulty: Difficulty): Question | null {
  let revenue: number;
  let marginPct: number;
  
  const companies = ['tech startup', 'retail chain', 'SaaS company', 'manufacturing firm', 'consulting firm', 'e-commerce business'];
  
  switch (difficulty) {
    case 'easy':
      revenue = randomChoice([1_200_000, 3_400_000, 5_600_000, 7_800_000, 12_000_000]);
      marginPct = randomChoice([10, 15, 20, 25]);
      break;
    case 'medium':
      revenue = randomChoice([14_500_000, 27_800_000, 43_200_000, 67_500_000, 89_400_000, 124_000_000]);
      marginPct = randomChoice([8, 12, 17, 23, 28]);
      break;
    case 'tough':
      revenue = randomChoice([156_000_000, 234_000_000, 478_000_000, 567_000_000, 892_000_000, 1_340_000_000]);
      marginPct = randomChoice([7, 11, 13, 19, 21, 27]);
      break;
  }
  
  const signature = `margin_e_${revenue}_${marginPct}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const correctAnswer = revenue * marginPct / 100;
  const company = randomChoice(companies);
  
  const prompt = `A ${company} has ${formatCurrency(revenue)} revenue with ${marginPct}% margin. Estimate profit.`;
  
  return {
    id: generateId(),
    type: 'estimate',
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: revenue, percent: marginPct, operation: 'margin_estimate' }
  };
}

// 7. Per-unit calculation - PRECISE
function perUnitPrecise(difficulty: Difficulty): Question | null {
  let units: number;
  let perUnit: number;
  
  const items = ['units', 'customers', 'stores', 'employees'];
  
  switch (difficulty) {
    case 'easy':
      units = randomChoice([10, 20, 25, 40, 50, 100, 200, 250, 500]);
      perUnit = randomChoice([50, 80, 100, 120, 150, 200, 250, 400, 500]);
      break;
    case 'medium':
      units = randomChoice([24, 36, 48, 60, 72, 84, 96, 120, 144, 150, 180, 240]);
      perUnit = randomChoice([45, 55, 65, 75, 85, 95, 125, 150, 175, 225, 250, 275]);
      break;
    case 'tough':
      units = randomChoice([125, 144, 156, 175, 192, 225, 256, 275, 324, 375, 400, 432, 450, 500]);
      perUnit = randomChoice([48, 64, 72, 84, 96, 108, 125, 144, 156, 175, 196, 225]);
      break;
  }
  
  const total = units * perUnit;
  const askForPerUnit = Math.random() > 0.5;
  const item = randomChoice(items);
  
  const signature = `perunit_p_${total}_${units}_${askForPerUnit}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  if (askForPerUnit) {
    const prompt = `Total revenue: $${formatNumber(total)} from ${units} ${item}. Revenue per ${item.slice(0, -1)}?`;
    return {
      id: generateId(),
      type: 'accurate',
      difficulty,
      prompt,
      correctAnswer: perUnit,
      meta: { baseValue: total, secondValue: units, operation: 'per_unit' }
    };
  } else {
    const prompt = `${units} ${item} × $${perUnit} each = ?`;
    return {
      id: generateId(),
      type: 'accurate',
      difficulty,
      prompt,
      correctAnswer: total,
      meta: { baseValue: perUnit, secondValue: units, operation: 'total_from_unit' }
    };
  }
}

// 8. Price change - PRECISE
function priceChangePrecise(difficulty: Difficulty): Question | null {
  let price: number;
  let changePct: number;
  const isIncrease = Math.random() > 0.5;
  
  switch (difficulty) {
    case 'easy':
      price = randomChoice([100, 200, 400, 500, 800, 1000, 2000, 4000, 5000]);
      changePct = randomChoice([10, 20, 25, 50]);
      break;
    case 'medium':
      price = randomChoice([120, 150, 180, 240, 300, 360, 450, 600, 750, 800, 900, 1200]);
      changePct = randomChoice([10, 15, 20, 25, 30]);
      break;
    case 'tough':
      price = randomChoice([125, 175, 225, 275, 325, 375, 425, 475, 525, 625, 725, 825]);
      changePct = randomChoice([12, 15, 18, 20, 24, 25]);
      break;
  }
  
  const signature = `price_p_${price}_${changePct}_${isIncrease}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const changeAmount = price * changePct / 100;
  const correctAnswer = isIncrease ? price + changeAmount : price - changeAmount;
  const action = isIncrease ? 'increases' : 'decreases';
  
  const prompt = `$${formatNumber(price)} ${action} by ${changePct}%. New price?`;
  
  return {
    id: generateId(),
    type: 'accurate',
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: price, percent: changePct, operation: isIncrease ? 'increase' : 'decrease' }
  };
}

// 9. Market share - ESTIMATE
function marketShareEstimate(difficulty: Difficulty): Question | null {
  let marketSize: number;
  let sharePct: number;
  
  const industries = ['cloud computing', 'electric vehicles', 'streaming services', 'food delivery', 'fintech', 'cybersecurity'];
  
  switch (difficulty) {
    case 'easy':
      marketSize = randomChoice([12_000_000_000, 25_000_000_000, 48_000_000_000, 75_000_000_000, 120_000_000_000]);
      sharePct = randomChoice([5, 10, 15, 20, 25]);
      break;
    case 'medium':
      marketSize = randomChoice([34_000_000_000, 67_000_000_000, 89_000_000_000, 145_000_000_000, 234_000_000_000, 378_000_000_000]);
      sharePct = randomChoice([7, 12, 17, 23, 28]);
      break;
    case 'tough':
      marketSize = randomChoice([156_000_000_000, 289_000_000_000, 423_000_000_000, 567_000_000_000, 789_000_000_000, 1_230_000_000_000]);
      sharePct = randomChoice([3, 7, 11, 13, 17, 19, 23]);
      break;
  }
  
  const signature = `market_${marketSize}_${sharePct}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const correctAnswer = marketSize * sharePct / 100;
  const industry = randomChoice(industries);
  
  const prompt = `The ${industry} market is ${formatCurrency(marketSize)}. Estimate revenue for a ${sharePct}% share.`;
  
  return {
    id: generateId(),
    type: 'estimate',
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: marketSize, percent: sharePct, operation: 'market_share' }
  };
}

// 10. Growth calculation - PRECISE
function growthPrecise(difficulty: Difficulty): Question | null {
  let baseValue: number;
  let growthPct: number;
  
  switch (difficulty) {
    case 'easy':
      baseValue = randomChoice([100000, 200000, 400000, 500000, 1000000, 2000000]);
      growthPct = randomChoice([10, 20, 25, 50, 100]);
      break;
    case 'medium':
      baseValue = randomChoice([120000, 150000, 180000, 240000, 300000, 360000, 450000, 600000, 750000, 900000]);
      growthPct = randomChoice([10, 15, 20, 25, 30, 40]);
      break;
    case 'tough':
      baseValue = randomChoice([125000, 175000, 225000, 275000, 325000, 375000, 425000, 475000, 525000, 625000]);
      growthPct = randomChoice([12, 15, 18, 20, 24, 25, 32, 35]);
      break;
  }
  
  const signature = `growth_p_${baseValue}_${growthPct}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const correctAnswer = baseValue * (1 + growthPct / 100);
  
  const prompt = `Last year: $${formatNumber(baseValue)}. After ${growthPct}% growth, this year = ?`;
  
  return {
    id: generateId(),
    type: 'accurate',
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue, percent: growthPct, operation: 'growth' }
  };
}

// 11. Growth - ESTIMATE with real numbers
function growthEstimate(difficulty: Difficulty): Question | null {
  let baseValue: number;
  let growthPct: number;
  
  const metrics = ['revenue', 'ARR', 'GMV', 'sales', 'bookings'];
  
  switch (difficulty) {
    case 'easy':
      baseValue = randomChoice([12_000_000, 34_000_000, 56_000_000, 78_000_000, 120_000_000]);
      growthPct = randomChoice([15, 20, 25, 30, 40]);
      break;
    case 'medium':
      baseValue = randomChoice([145_000_000, 278_000_000, 432_000_000, 567_000_000, 789_000_000]);
      growthPct = randomChoice([17, 23, 28, 33, 42]);
      break;
    case 'tough':
      baseValue = randomChoice([1_230_000_000, 2_340_000_000, 3_450_000_000, 4_560_000_000, 5_670_000_000]);
      growthPct = randomChoice([13, 19, 27, 31, 37, 43]);
      break;
  }
  
  const signature = `growth_e_${baseValue}_${growthPct}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const correctAnswer = baseValue * (1 + growthPct / 100);
  const metric = randomChoice(metrics);
  
  const prompt = `${metric.toUpperCase()} was ${formatCurrency(baseValue)}. After ${growthPct}% growth, estimate the new value.`;
  
  return {
    id: generateId(),
    type: 'estimate',
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue, percent: growthPct, operation: 'growth_estimate' }
  };
}

// 12. Break-even - PRECISE
function breakEvenPrecise(difficulty: Difficulty): Question | null {
  let fixedCosts: number;
  let pricePerUnit: number;
  let variableCostPerUnit: number;
  
  switch (difficulty) {
    case 'easy':
      fixedCosts = randomChoice([10000, 20000, 50000, 100000]);
      pricePerUnit = randomChoice([50, 100, 200, 250]);
      variableCostPerUnit = pricePerUnit / 2; // 50% contribution margin
      break;
    case 'medium':
      fixedCosts = randomChoice([60000, 90000, 120000, 150000, 180000, 240000]);
      pricePerUnit = randomChoice([40, 60, 80, 100, 120, 150]);
      variableCostPerUnit = pricePerUnit * 0.6; // 40% contribution margin
      break;
    case 'tough':
      fixedCosts = randomChoice([75000, 125000, 175000, 225000, 275000, 325000]);
      pricePerUnit = randomChoice([45, 55, 65, 75, 85, 95, 125]);
      variableCostPerUnit = Math.round(pricePerUnit * 0.65); // 35% contribution margin
      break;
  }
  
  const contribution = pricePerUnit - variableCostPerUnit;
  const breakEvenUnits = fixedCosts / contribution;
  
  const signature = `breakeven_${fixedCosts}_${pricePerUnit}_${variableCostPerUnit}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const prompt = `Fixed costs: $${formatNumber(fixedCosts)}. Price: $${pricePerUnit}. Variable cost: $${variableCostPerUnit}. Break-even units?`;
  
  return {
    id: generateId(),
    type: 'accurate',
    difficulty,
    prompt,
    correctAnswer: breakEvenUnits,
    meta: { baseValue: fixedCosts, secondValue: contribution, operation: 'break_even' }
  };
}

// 13. Reverse percentage - PRECISE
function reversePercentPrecise(difficulty: Difficulty): Question | null {
  let whole: number;
  let pct: number;
  
  switch (difficulty) {
    case 'easy':
      whole = randomChoice([1000, 2000, 4000, 5000, 10000, 20000, 50000, 100000]);
      pct = randomChoice([10, 20, 25, 50]);
      break;
    case 'medium':
      whole = randomChoice([1200, 1500, 1800, 2400, 3000, 3600, 4500, 6000, 7500, 9000, 12000, 15000]);
      pct = randomChoice([10, 15, 20, 25, 30]);
      break;
    case 'tough':
      whole = randomChoice([1250, 1750, 2250, 2750, 3250, 3750, 4250, 4750, 5250, 6250, 7250, 8250]);
      pct = randomChoice([12, 15, 18, 20, 24, 25]);
      break;
  }
  
  const part = whole * pct / 100;
  const signature = `rev_pct_${part}_${pct}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const prompt = `${formatNumber(part)} is ${pct}% of what total?`;
  
  return {
    id: generateId(),
    type: 'accurate',
    difficulty,
    prompt,
    correctAnswer: whole,
    meta: { baseValue: part, percent: pct, operation: 'reverse_percent' }
  };
}

// 14. Cost structure - PRECISE
function costStructurePrecise(difficulty: Difficulty): Question | null {
  let revenue: number;
  let costPct: number;
  
  switch (difficulty) {
    case 'easy':
      revenue = randomChoice([100000, 200000, 400000, 500000, 800000, 1000000]);
      costPct = randomChoice([50, 60, 70, 75, 80]);
      break;
    case 'medium':
      revenue = randomChoice([120000, 150000, 180000, 240000, 300000, 360000, 450000, 600000, 750000]);
      costPct = randomChoice([55, 60, 65, 70, 75, 80]);
      break;
    case 'tough':
      revenue = randomChoice([125000, 175000, 225000, 275000, 325000, 375000, 425000, 475000, 525000]);
      costPct = randomChoice([58, 62, 68, 72, 78, 82]);
      break;
  }
  
  const signature = `cost_${revenue}_${costPct}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const profitPct = 100 - costPct;
  const correctAnswer = revenue * profitPct / 100;
  
  const prompt = `Revenue: $${formatNumber(revenue)}. Costs: ${costPct}% of revenue. Profit?`;
  
  return {
    id: generateId(),
    type: 'accurate',
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: revenue, percent: costPct, operation: 'cost_structure' }
  };
}

// 15. Compound change - MEDIUM/TOUGH only
function compoundChangePrecise(difficulty: Difficulty): Question | null {
  if (difficulty === 'easy') return null;
  
  let base: number;
  let pct1: number;
  let pct2: number;
  
  if (difficulty === 'medium') {
    base = randomChoice([10000, 20000, 50000, 100000, 200000]);
    pct1 = randomChoice([10, 20, 25]);
    pct2 = randomChoice([10, 20, 25]);
  } else {
    base = randomChoice([12000, 15000, 18000, 24000, 30000, 36000, 45000, 60000, 75000]);
    pct1 = randomChoice([10, 15, 20, 25]);
    pct2 = randomChoice([10, 15, 20]);
  }
  
  const signature = `compound_${base}_${pct1}_${pct2}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const isIncreaseThenDecrease = Math.random() > 0.5;
  let correctAnswer: number;
  let prompt: string;
  
  if (isIncreaseThenDecrease) {
    correctAnswer = base * (1 + pct1/100) * (1 - pct2/100);
    prompt = `$${formatNumber(base)} increases ${pct1}%, then decreases ${pct2}%. Final value?`;
  } else {
    correctAnswer = base * (1 + pct1/100) * (1 + pct2/100);
    prompt = `$${formatNumber(base)} grows ${pct1}%, then another ${pct2}%. Final value?`;
  }
  
  return {
    id: generateId(),
    type: 'accurate',
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: base, percent: pct1, operation: 'compound' }
  };
}

// 16. Quick mental addition/subtraction - EASY/MEDIUM
function quickAddSubtract(difficulty: Difficulty): Question | null {
  if (difficulty === 'tough') return null;
  
  let a: number;
  let b: number;
  const isAdd = Math.random() > 0.5;
  
  if (difficulty === 'easy') {
    a = randomChoice([250, 450, 750, 850, 1250, 1750, 2500, 3500, 4500, 7500]);
    b = randomChoice([150, 250, 350, 450, 550, 650, 750, 850, 950]);
  } else {
    a = randomChoice([1250, 1750, 2250, 2750, 3250, 3750, 4250, 4750, 5250, 6250, 7250, 8250, 9250]);
    b = randomChoice([1350, 1650, 1850, 2150, 2350, 2650, 2850, 3150, 3350]);
  }
  
  const signature = `addsub_${a}_${b}_${isAdd}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const correctAnswer = isAdd ? a + b : a - b;
  const prompt = isAdd ? `${formatNumber(a)} + ${formatNumber(b)} = ?` : `${formatNumber(a)} - ${formatNumber(b)} = ?`;
  
  return {
    id: generateId(),
    type: 'accurate',
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: a, secondValue: b, operation: isAdd ? 'addition' : 'subtraction' }
  };
}

// 17. Revenue per employee - ESTIMATE
function revenuePerEmployeeEstimate(difficulty: Difficulty): Question | null {
  let revenue: number;
  let employees: number;
  
  switch (difficulty) {
    case 'easy':
      revenue = randomChoice([12_000_000, 24_000_000, 36_000_000, 48_000_000, 60_000_000]);
      employees = randomChoice([100, 200, 300, 400, 500]);
      break;
    case 'medium':
      revenue = randomChoice([78_000_000, 156_000_000, 234_000_000, 312_000_000, 468_000_000]);
      employees = randomChoice([650, 850, 1200, 1500, 1800, 2400]);
      break;
    case 'tough':
      revenue = randomChoice([567_000_000, 892_000_000, 1_234_000_000, 2_345_000_000, 3_456_000_000]);
      employees = randomChoice([4500, 6700, 8900, 12000, 15000, 23000]);
      break;
  }
  
  const signature = `rev_emp_${revenue}_${employees}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const correctAnswer = revenue / employees;
  
  const prompt = `Company revenue: ${formatCurrency(revenue)}. Employees: ${formatNumber(employees)}. Estimate revenue per employee.`;
  
  return {
    id: generateId(),
    type: 'estimate',
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: revenue, secondValue: employees, operation: 'rev_per_employee' }
  };
}

// 18. Valuation multiple - ESTIMATE
function valuationMultipleEstimate(difficulty: Difficulty): Question | null {
  let revenue: number;
  let multiple: number;
  
  switch (difficulty) {
    case 'easy':
      revenue = randomChoice([10_000_000, 25_000_000, 50_000_000, 100_000_000, 200_000_000]);
      multiple = randomChoice([3, 5, 8, 10]);
      break;
    case 'medium':
      revenue = randomChoice([34_000_000, 67_000_000, 89_000_000, 123_000_000, 178_000_000, 234_000_000]);
      multiple = randomChoice([4, 6, 7, 9, 12]);
      break;
    case 'tough':
      revenue = randomChoice([156_000_000, 278_000_000, 389_000_000, 456_000_000, 567_000_000, 789_000_000]);
      multiple = randomChoice([5.5, 7.5, 8.5, 11, 13, 15]);
      break;
  }
  
  const signature = `valuation_${revenue}_${multiple}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const correctAnswer = revenue * multiple;
  
  const prompt = `Revenue: ${formatCurrency(revenue)}. At ${multiple}x revenue multiple, estimate company value.`;
  
  return {
    id: generateId(),
    type: 'estimate',
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: revenue, secondValue: multiple, operation: 'valuation' }
  };
}

// Template dispatcher
function generatePreciseQuestion(difficulty: Difficulty): Question | null {
  const templates = [
    percentOfNumberPrecise,
    multiplicationPrecise,
    divisionPrecise,
    profitMarginPrecise,
    perUnitPrecise,
    priceChangePrecise,
    growthPrecise,
    reversePercentPrecise,
    costStructurePrecise,
    quickAddSubtract,
  ];
  
  if (difficulty !== 'easy') {
    templates.push(breakEvenPrecise, compoundChangePrecise);
  }
  
  const template = randomChoice(templates);
  return template(difficulty);
}

function generateEstimateQuestion(difficulty: Difficulty): Question | null {
  const templates = [
    percentOfNumberEstimate,
    profitMarginEstimate,
    marketShareEstimate,
    growthEstimate,
    revenuePerEmployeeEstimate,
    valuationMultipleEstimate,
  ];
  
  const template = randomChoice(templates);
  return template(difficulty);
}

// Main question generator
export function generateQuestion(type: QuestionType, difficulty: Difficulty): Question {
  let attempts = 0;
  const maxAttempts = 50;
  
  while (attempts < maxAttempts) {
    const question = type === 'accurate' 
      ? generatePreciseQuestion(difficulty)
      : generateEstimateQuestion(difficulty);
    
    if (question !== null) {
      return question;
    }
    attempts++;
  }
  
  // Fallback
  const base = randomChoice(PRECISE_EASY_BASES);
  const pct = randomChoice(PRECISE_EASY_PERCENTAGES);
  return {
    id: generateId(),
    type,
    difficulty,
    prompt: `What is ${pct}% of ${formatNumber(base)}?`,
    correctAnswer: base * pct / 100,
    meta: { baseValue: base, percent: pct, operation: 'percent' }
  };
}

// Validation
export const TOLERANCE = 0.10;

export function checkAnswer(
  userAnswer: number,
  correctAnswer: number,
  type: QuestionType
): { isCorrect: boolean; errorPercent?: number } {
  if (type === 'accurate') {
    const tolerance = Math.max(0.5, correctAnswer * 0.001);
    const isCorrect = Math.abs(userAnswer - correctAnswer) <= tolerance;
    return { isCorrect };
  }
  
  const lower = correctAnswer * (1 - TOLERANCE);
  const upper = correctAnswer * (1 + TOLERANCE);
  const isCorrect = userAnswer >= lower && userAnswer <= upper;
  const errorPercent = Math.abs(userAnswer - correctAnswer) / correctAnswer * 100;
  
  return { isCorrect, errorPercent };
}

export function getNumericAnswer(mantissa: number, suffix: 'none' | 'K' | 'M' | 'B'): number {
  const multipliers = { none: 1, K: 1_000, M: 1_000_000, B: 1_000_000_000 };
  return mantissa * multipliers[suffix];
}

export function clearRecentQuestions(): void {
  recentQuestions.clear();
}
