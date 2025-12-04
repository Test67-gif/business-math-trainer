import { Question, QuestionType, Difficulty } from './types';

// Utility functions
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

function roundToNiceNumber(num: number, significance: number = 2): number {
  if (num === 0) return 0;
  const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(num))) - significance + 1);
  return Math.round(num / magnitude) * magnitude;
}

// Track recently used question signatures to avoid repetition
const recentQuestions: Set<string> = new Set();
const MAX_RECENT = 50;

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
// DIFFICULTY CALIBRATION
// ============================================
// Easy = MBA Intern: Clean numbers, common percentages, single-step
// Medium = McKinsey Jr. Consultant: Realistic business numbers, multi-step, less clean
// Tough = McKinsey Sr. Consultant: Complex scenarios, compound calculations, messy numbers

// Percentage pools by difficulty
const EASY_PERCENTAGES = [5, 10, 15, 20, 25, 30, 50, 75];
const MEDIUM_PERCENTAGES = [3, 7, 8, 12, 15, 17, 18, 22, 24, 28, 33, 35, 40, 45];
const TOUGH_PERCENTAGES = [2.5, 3.5, 4, 6, 7.5, 8.5, 11, 13, 14, 16, 19, 21, 23, 26, 27, 29, 31, 32, 34, 37, 38, 42, 43, 47, 48];

// Business-realistic base numbers
const EASY_BASES = [100, 200, 400, 500, 800, 1000, 2000, 4000, 5000, 10000, 20000, 50000, 100000];
const MEDIUM_BASES = [1200, 1500, 2400, 3600, 4500, 7500, 8000, 12000, 15000, 18000, 24000, 36000, 45000, 75000, 120000, 150000, 240000, 450000, 750000, 1200000, 2400000];
const TOUGH_BASES = [1340, 2670, 3890, 4720, 6430, 7860, 9240, 11500, 13700, 16800, 19400, 23600, 28900, 34500, 41200, 47800, 56300, 67400, 78900, 89500, 123000, 187000, 234000, 345000, 456000, 567000, 789000, 1230000, 2340000, 3450000, 4560000, 7890000];

// ============================================
// QUESTION TEMPLATES
// ============================================

type TemplateGenerator = (difficulty: Difficulty, type: QuestionType) => Question | null;

// 1. Basic percentage of a number
function percentOfNumber(difficulty: Difficulty, type: QuestionType): Question | null {
  let base: number;
  let pct: number;
  
  switch (difficulty) {
    case 'easy':
      base = randomChoice(EASY_BASES);
      pct = randomChoice(EASY_PERCENTAGES);
      break;
    case 'medium':
      base = randomChoice(MEDIUM_BASES);
      pct = randomChoice(MEDIUM_PERCENTAGES);
      break;
    case 'tough':
      base = randomChoice(TOUGH_BASES);
      pct = randomChoice(TOUGH_PERCENTAGES);
      break;
  }
  
  const signature = `pct_${pct}_${base}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const correctAnswer = base * pct / 100;
  const prompt = type === 'estimate' 
    ? `Estimate ${pct}% of ${formatNumber(base)}`
    : `What is ${pct}% of ${formatNumber(base)}?`;
  
  return {
    id: generateId(),
    type,
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: base, percent: pct, operation: 'percent' }
  };
}

// 2. Reverse percentage (find the whole given a part)
function reversePercentage(difficulty: Difficulty, type: QuestionType): Question | null {
  let whole: number;
  let pct: number;
  
  switch (difficulty) {
    case 'easy':
      whole = randomChoice([1000, 2000, 4000, 5000, 10000, 20000, 50000, 100000]);
      pct = randomChoice([10, 20, 25, 50]);
      break;
    case 'medium':
      whole = randomChoice([1500, 2400, 3600, 4500, 7500, 12000, 15000, 24000, 36000, 45000, 75000, 120000]);
      pct = randomChoice([8, 12, 15, 20, 24, 30, 40]);
      break;
    case 'tough':
      whole = randomChoice([1340, 2670, 4720, 7860, 11500, 16800, 23600, 34500, 47800, 67400, 89500, 123000, 234000]);
      pct = randomChoice([6, 8, 12, 15, 18, 22, 35]);
      break;
  }
  
  const part = whole * pct / 100;
  const signature = `rev_pct_${part}_${pct}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const correctAnswer = whole;
  const prompt = type === 'estimate'
    ? `${formatNumber(part)} is ${pct}% of what number? Estimate the total.`
    : `${formatNumber(part)} represents ${pct}% of a total. What is the total?`;
  
  return {
    id: generateId(),
    type,
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: part, percent: pct, operation: 'reverse_percent' }
  };
}

// 3. Simple multiplication
function multiplication(difficulty: Difficulty, type: QuestionType): Question | null {
  let a: number;
  let b: number;
  
  switch (difficulty) {
    case 'easy':
      a = randomChoice([12, 15, 18, 24, 25, 30, 35, 40, 45, 50, 60, 75, 80, 90, 125, 150, 200, 250]);
      b = randomChoice([2, 3, 4, 5, 6, 8, 10, 12]);
      break;
    case 'medium':
      a = randomChoice([35, 45, 55, 65, 75, 85, 95, 120, 140, 160, 180, 220, 250, 280, 320, 350, 450, 550, 650, 750, 850]);
      b = randomChoice([6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 18]);
      break;
    case 'tough':
      a = randomChoice([123, 147, 168, 189, 234, 267, 289, 312, 345, 378, 423, 456, 489, 534, 567, 612, 678, 723, 789, 834, 867, 912, 945, 978]);
      b = randomChoice([7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25]);
      break;
  }
  
  const signature = `mult_${a}_${b}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const correctAnswer = a * b;
  const prompt = type === 'estimate'
    ? `Estimate ${formatNumber(a)} × ${b}`
    : `What is ${formatNumber(a)} × ${b}?`;
  
  return {
    id: generateId(),
    type,
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: a, secondValue: b, operation: 'multiplication' }
  };
}

// 4. Division
function division(difficulty: Difficulty, type: QuestionType): Question | null {
  let divisor: number;
  let quotient: number;
  
  switch (difficulty) {
    case 'easy':
      divisor = randomChoice([2, 4, 5, 8, 10, 20, 25, 50]);
      quotient = randomChoice([12, 15, 18, 24, 25, 30, 35, 40, 45, 50, 60, 75, 80, 100, 120, 150, 200, 250, 400, 500]);
      break;
    case 'medium':
      divisor = randomChoice([3, 6, 7, 8, 9, 12, 15, 16, 18, 24]);
      quotient = randomChoice([45, 65, 85, 95, 120, 145, 165, 185, 220, 280, 320, 380, 420, 480, 520, 580, 620, 720, 850, 950]);
      break;
    case 'tough':
      divisor = randomChoice([7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 23]);
      quotient = randomChoice([123, 156, 189, 234, 267, 312, 345, 378, 423, 456, 512, 567, 623, 678, 734, 789, 845, 912, 978]);
      break;
  }
  
  const base = divisor * quotient;
  const signature = `div_${base}_${divisor}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const correctAnswer = quotient;
  const prompt = type === 'estimate'
    ? `Estimate ${formatNumber(base)} ÷ ${divisor}`
    : `What is ${formatNumber(base)} ÷ ${divisor}?`;
  
  return {
    id: generateId(),
    type,
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: base, secondValue: divisor, operation: 'division' }
  };
}

// 5. Profit margin calculation
function profitMargin(difficulty: Difficulty, type: QuestionType): Question | null {
  let revenue: number;
  let marginPct: number;
  
  const context = randomChoice(['company', 'product line', 'division', 'business unit', 'project']);
  
  switch (difficulty) {
    case 'easy':
      revenue = randomChoice([100000, 200000, 400000, 500000, 800000, 1000000, 2000000, 5000000]);
      marginPct = randomChoice([10, 15, 20, 25, 30, 40, 50]);
      break;
    case 'medium':
      revenue = randomChoice([1200000, 1500000, 2400000, 3600000, 4500000, 7500000, 12000000, 15000000, 24000000, 36000000, 45000000]);
      marginPct = randomChoice([8, 12, 15, 18, 22, 24, 28, 32, 35]);
      break;
    case 'tough':
      revenue = randomInt(10000000, 500000000);
      revenue = roundToNiceNumber(revenue, 3);
      marginPct = randomChoice([4.5, 6, 7.5, 8.5, 11, 13, 14.5, 16, 17.5, 19, 21, 23.5]);
      break;
  }
  
  const signature = `margin_${revenue}_${marginPct}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const correctAnswer = revenue * marginPct / 100;
  const prompt = type === 'estimate'
    ? `A ${context} has ${formatNumber(revenue)} in revenue with a ${marginPct}% profit margin. Estimate the profit.`
    : `A ${context} generates $${formatNumber(revenue)} in revenue with a ${marginPct}% profit margin. What is the profit?`;
  
  return {
    id: generateId(),
    type,
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: revenue, percent: marginPct, operation: 'margin' }
  };
}

// 6. Cost structure / profit from cost percentage
function costStructure(difficulty: Difficulty, type: QuestionType): Question | null {
  let revenue: number;
  let costPct: number;
  
  switch (difficulty) {
    case 'easy':
      revenue = randomChoice([100000, 200000, 400000, 500000, 800000, 1000000, 2000000]);
      costPct = randomChoice([50, 60, 70, 75, 80]);
      break;
    case 'medium':
      revenue = randomChoice([1500000, 2400000, 3600000, 4500000, 7500000, 12000000, 24000000]);
      costPct = randomChoice([55, 62, 65, 68, 72, 78, 82, 85]);
      break;
    case 'tough':
      revenue = randomInt(50000000, 800000000);
      revenue = roundToNiceNumber(revenue, 3);
      costPct = randomChoice([57, 63, 67, 71, 73, 76, 79, 81, 84, 87]);
      break;
  }
  
  const signature = `cost_${revenue}_${costPct}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const askForProfit = Math.random() > 0.5;
  const correctAnswer = askForProfit 
    ? revenue * (100 - costPct) / 100 
    : revenue * costPct / 100;
  
  const metric = askForProfit ? 'profit' : 'total costs';
  const prompt = type === 'estimate'
    ? `Revenue is $${formatNumber(revenue)} and costs are ${costPct}% of revenue. Estimate the ${metric}.`
    : `Revenue is $${formatNumber(revenue)} with costs at ${costPct}% of revenue. What is the ${metric}?`;
  
  return {
    id: generateId(),
    type,
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: revenue, percent: costPct, operation: 'cost_structure' }
  };
}

// 7. Price change (increase/decrease)
function priceChange(difficulty: Difficulty, type: QuestionType): Question | null {
  let price: number;
  let changePct: number;
  const isIncrease = Math.random() > 0.5;
  
  switch (difficulty) {
    case 'easy':
      price = randomChoice([50, 80, 100, 120, 150, 200, 250, 400, 500, 800, 1000, 2000, 5000]);
      changePct = randomChoice([5, 10, 15, 20, 25, 50]);
      break;
    case 'medium':
      price = randomChoice([75, 85, 95, 125, 145, 175, 225, 275, 350, 450, 550, 750, 850, 1250, 1750, 2500, 3500, 4500, 7500]);
      changePct = randomChoice([8, 12, 15, 18, 22, 25, 30, 35]);
      break;
    case 'tough':
      price = randomChoice([67, 83, 97, 123, 147, 178, 234, 289, 347, 423, 567, 678, 789, 892, 1230, 1470, 1890, 2340, 3450, 4560, 5670, 7890]);
      changePct = randomChoice([6, 8.5, 11, 13, 15.5, 17, 19, 21.5, 23, 27, 32]);
      break;
  }
  
  const signature = `price_${price}_${changePct}_${isIncrease}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const changeAmount = price * changePct / 100;
  const correctAnswer = isIncrease ? price + changeAmount : price - changeAmount;
  const action = isIncrease ? 'increases' : 'decreases';
  
  const prompt = type === 'estimate'
    ? `A price of $${formatNumber(price)} ${action} by ${changePct}%. Estimate the new price.`
    : `A product priced at $${formatNumber(price)} ${action} by ${changePct}%. What is the new price?`;
  
  return {
    id: generateId(),
    type,
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: price, percent: changePct, operation: isIncrease ? 'increase' : 'decrease' }
  };
}

// 8. Per-unit calculation
function perUnitCalculation(difficulty: Difficulty, type: QuestionType): Question | null {
  let units: number;
  let perUnit: number;
  const items = randomChoice(['units', 'customers', 'employees', 'stores', 'products', 'subscribers', 'users']);
  const metrics = randomChoice(['revenue', 'profit', 'cost', 'sales']);
  
  switch (difficulty) {
    case 'easy':
      units = randomChoice([10, 20, 25, 40, 50, 100, 200, 250, 500, 1000]);
      perUnit = randomChoice([50, 80, 100, 120, 150, 200, 250, 400, 500, 800, 1000]);
      break;
    case 'medium':
      units = randomChoice([24, 36, 48, 72, 96, 120, 150, 180, 240, 360, 480, 720, 1200, 1500, 2400]);
      perUnit = randomChoice([35, 45, 65, 85, 95, 125, 175, 225, 275, 350, 450, 650, 850]);
      break;
    case 'tough':
      units = randomChoice([137, 189, 234, 312, 456, 567, 678, 789, 892, 1230, 1560, 1890, 2340, 3450, 4560]);
      perUnit = randomChoice([47, 63, 78, 89, 97, 123, 147, 178, 234, 289, 347, 423, 567, 678]);
      break;
  }
  
  const total = units * perUnit;
  const askForPerUnit = Math.random() > 0.5;
  
  const signature = `perunit_${total}_${units}_${askForPerUnit}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  if (askForPerUnit) {
    const prompt = type === 'estimate'
      ? `Total ${metrics} is $${formatNumber(total)} from ${formatNumber(units)} ${items}. Estimate ${metrics} per ${items.slice(0, -1)}.`
      : `Total ${metrics} of $${formatNumber(total)} comes from ${formatNumber(units)} ${items}. What is the ${metrics} per ${items.slice(0, -1)}?`;
    return {
      id: generateId(),
      type,
      difficulty,
      prompt,
      correctAnswer: perUnit,
      meta: { baseValue: total, secondValue: units, operation: 'per_unit' }
    };
  } else {
    const prompt = type === 'estimate'
      ? `With ${formatNumber(units)} ${items} and $${formatNumber(perUnit)} ${metrics} per ${items.slice(0, -1)}, estimate total ${metrics}.`
      : `A business has ${formatNumber(units)} ${items} generating $${formatNumber(perUnit)} ${metrics} each. What is the total ${metrics}?`;
    return {
      id: generateId(),
      type,
      difficulty,
      prompt,
      correctAnswer: total,
      meta: { baseValue: perUnit, secondValue: units, operation: 'total_from_unit' }
    };
  }
}

// 9. Market share calculation
function marketShare(difficulty: Difficulty, type: QuestionType): Question | null {
  let marketSize: number;
  let sharePct: number;
  
  switch (difficulty) {
    case 'easy':
      marketSize = randomChoice([10000000, 20000000, 50000000, 100000000, 200000000, 500000000, 1000000000]);
      sharePct = randomChoice([5, 10, 15, 20, 25, 30, 40, 50]);
      break;
    case 'medium':
      marketSize = randomChoice([15000000, 24000000, 36000000, 45000000, 75000000, 120000000, 180000000, 240000000, 360000000, 450000000, 750000000]);
      sharePct = randomChoice([3, 7, 8, 12, 15, 18, 22, 28, 35]);
      break;
    case 'tough':
      marketSize = randomInt(100000000, 10000000000);
      marketSize = roundToNiceNumber(marketSize, 2);
      sharePct = randomChoice([2.5, 4.5, 6, 7.5, 8.5, 11, 13.5, 16, 18.5, 21, 23.5, 27]);
      break;
  }
  
  const signature = `market_${marketSize}_${sharePct}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const correctAnswer = marketSize * sharePct / 100;
  const industry = randomChoice(['software', 'retail', 'healthcare', 'automotive', 'consumer goods', 'financial services']);
  
  const prompt = type === 'estimate'
    ? `The ${industry} market is $${formatNumber(marketSize)}. A company with ${sharePct}% market share has what revenue?`
    : `In a $${formatNumber(marketSize)} ${industry} market, what is the revenue of a company with ${sharePct}% market share?`;
  
  return {
    id: generateId(),
    type,
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: marketSize, percent: sharePct, operation: 'market_share' }
  };
}

// 10. Growth calculation (year-over-year)
function growthCalculation(difficulty: Difficulty, type: QuestionType): Question | null {
  let baseValue: number;
  let growthPct: number;
  
  switch (difficulty) {
    case 'easy':
      baseValue = randomChoice([100000, 200000, 400000, 500000, 1000000, 2000000, 5000000, 10000000]);
      growthPct = randomChoice([5, 10, 15, 20, 25, 50, 100]);
      break;
    case 'medium':
      baseValue = randomChoice([1500000, 2400000, 3600000, 4500000, 7500000, 12000000, 18000000, 24000000, 36000000, 45000000]);
      growthPct = randomChoice([8, 12, 15, 18, 22, 25, 30, 35, 40, 45]);
      break;
    case 'tough':
      baseValue = randomInt(10000000, 500000000);
      baseValue = roundToNiceNumber(baseValue, 2);
      growthPct = randomChoice([6, 8.5, 11, 13.5, 16, 18.5, 21, 24.5, 27, 32, 37, 43]);
      break;
  }
  
  const signature = `growth_${baseValue}_${growthPct}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const correctAnswer = baseValue * (1 + growthPct / 100);
  const metric = randomChoice(['revenue', 'sales', 'profit', 'subscribers', 'users']);
  
  const prompt = type === 'estimate'
    ? `Last year's ${metric} was $${formatNumber(baseValue)}. With ${growthPct}% growth, estimate this year's ${metric}.`
    : `A company had $${formatNumber(baseValue)} in ${metric} last year. After ${growthPct}% growth, what is this year's ${metric}?`;
  
  return {
    id: generateId(),
    type,
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue, percent: growthPct, operation: 'growth' }
  };
}

// 11. Break-even / target calculation
function breakEvenTarget(difficulty: Difficulty, type: QuestionType): Question | null {
  let fixedCosts: number;
  let pricePerUnit: number;
  let variableCostPerUnit: number;
  
  switch (difficulty) {
    case 'easy':
      fixedCosts = randomChoice([10000, 20000, 50000, 100000, 200000, 500000]);
      pricePerUnit = randomChoice([50, 100, 200, 250, 500]);
      variableCostPerUnit = Math.round(pricePerUnit * randomChoice([0.4, 0.5, 0.6]));
      break;
    case 'medium':
      fixedCosts = randomChoice([75000, 120000, 180000, 240000, 360000, 450000, 720000]);
      pricePerUnit = randomChoice([45, 75, 95, 125, 175, 225, 350]);
      variableCostPerUnit = Math.round(pricePerUnit * randomChoice([0.45, 0.55, 0.65, 0.7]));
      break;
    case 'tough':
      fixedCosts = randomChoice([89000, 134000, 178000, 234000, 312000, 456000, 567000, 789000]);
      pricePerUnit = randomChoice([47, 68, 89, 123, 156, 189, 234, 289]);
      variableCostPerUnit = Math.round(pricePerUnit * randomChoice([0.52, 0.58, 0.63, 0.68, 0.72]));
      break;
  }
  
  const contribution = pricePerUnit - variableCostPerUnit;
  const breakEvenUnits = Math.ceil(fixedCosts / contribution);
  
  const signature = `breakeven_${fixedCosts}_${pricePerUnit}_${variableCostPerUnit}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const prompt = type === 'estimate'
    ? `Fixed costs: $${formatNumber(fixedCosts)}. Price: $${pricePerUnit}/unit. Variable cost: $${variableCostPerUnit}/unit. Estimate break-even units.`
    : `With $${formatNumber(fixedCosts)} fixed costs, $${pricePerUnit} price per unit, and $${variableCostPerUnit} variable cost per unit, how many units to break even?`;
  
  return {
    id: generateId(),
    type,
    difficulty,
    prompt,
    correctAnswer: breakEvenUnits,
    meta: { baseValue: fixedCosts, secondValue: contribution, operation: 'break_even' }
  };
}

// 12. Compound percentage (two-step)
function compoundPercentage(difficulty: Difficulty, type: QuestionType): Question | null {
  let base: number;
  let pct1: number;
  let pct2: number;
  
  switch (difficulty) {
    case 'easy':
      // Skip for easy - too complex
      return null;
    case 'medium':
      base = randomChoice([10000, 20000, 50000, 100000, 200000, 500000]);
      pct1 = randomChoice([10, 20, 25]);
      pct2 = randomChoice([10, 20, 25]);
      break;
    case 'tough':
      base = randomChoice([15000, 24000, 36000, 45000, 75000, 120000, 180000, 240000]);
      pct1 = randomChoice([8, 12, 15, 18, 20, 25]);
      pct2 = randomChoice([5, 8, 10, 12, 15, 20]);
      break;
  }
  
  const signature = `compound_${base}_${pct1}_${pct2}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const operations = [
    { desc: `increases by ${pct1}% then by another ${pct2}%`, mult: (1 + pct1/100) * (1 + pct2/100) },
    { desc: `increases by ${pct1}% then decreases by ${pct2}%`, mult: (1 + pct1/100) * (1 - pct2/100) },
    { desc: `decreases by ${pct1}% then increases by ${pct2}%`, mult: (1 - pct1/100) * (1 + pct2/100) },
  ];
  
  const op = randomChoice(operations);
  const correctAnswer = base * op.mult;
  
  const prompt = type === 'estimate'
    ? `Starting value: $${formatNumber(base)}. It ${op.desc}. Estimate the final value.`
    : `A value of $${formatNumber(base)} ${op.desc}. What is the final value?`;
  
  return {
    id: generateId(),
    type,
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: base, percent: pct1, operation: 'compound' }
  };
}

// 13. Weighted average
function weightedAverage(difficulty: Difficulty, type: QuestionType): Question | null {
  let value1: number, weight1: number;
  let value2: number, weight2: number;
  
  switch (difficulty) {
    case 'easy':
      // Skip for easy
      return null;
    case 'medium':
      value1 = randomChoice([40, 50, 60, 80, 100, 120]);
      weight1 = randomChoice([20, 30, 40, 50, 60]);
      value2 = randomChoice([80, 100, 120, 150, 200]);
      weight2 = 100 - weight1;
      break;
    case 'tough':
      value1 = randomChoice([45, 67, 78, 89, 95, 112, 134, 156]);
      weight1 = randomChoice([15, 22, 28, 35, 42, 48, 55, 62]);
      value2 = randomChoice([89, 112, 134, 167, 189, 212, 234, 267]);
      weight2 = 100 - weight1;
      break;
  }
  
  const signature = `wavg_${value1}_${weight1}_${value2}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const correctAnswer = (value1 * weight1 + value2 * weight2) / 100;
  const context = randomChoice(['products', 'regions', 'segments', 'divisions']);
  
  const prompt = type === 'estimate'
    ? `Two ${context}: one at $${value1} (${weight1}% of sales), another at $${value2} (${weight2}% of sales). Estimate the weighted average price.`
    : `${context.charAt(0).toUpperCase() + context.slice(1)} A sells at $${value1} (${weight1}% of volume). ${context.charAt(0).toUpperCase() + context.slice(1)} B sells at $${value2} (${weight2}% of volume). What is the weighted average price?`;
  
  return {
    id: generateId(),
    type,
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: value1, secondValue: value2, operation: 'weighted_avg' }
  };
}

// 14. Large number estimation (billions)
function largeNumberEstimate(difficulty: Difficulty, type: QuestionType): Question | null {
  // Only for estimate type and medium/tough
  if (type === 'accurate' && difficulty === 'easy') return null;
  
  let base: number;
  let pct: number;
  
  switch (difficulty) {
    case 'easy':
      base = randomChoice([100000000, 200000000, 500000000, 1000000000, 2000000000, 5000000000]);
      pct = randomChoice([5, 10, 20, 25, 50]);
      break;
    case 'medium':
      base = randomInt(1000000000, 50000000000);
      base = roundToNiceNumber(base, 2);
      pct = randomChoice([3, 5, 8, 10, 12, 15, 20, 25]);
      break;
    case 'tough':
      base = randomInt(10000000000, 500000000000);
      base = roundToNiceNumber(base, 2);
      pct = randomChoice([2, 3.5, 4, 5.5, 7, 8.5, 11, 13, 15, 17.5, 19, 22]);
      break;
  }
  
  const signature = `large_${base}_${pct}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const correctAnswer = base * pct / 100;
  const context = randomChoice(['global market', 'company valuation', 'annual budget', 'total addressable market', 'GDP contribution']);
  
  const prompt = `The ${context} is $${formatNumber(base)}. ${type === 'estimate' ? 'Estimate' : 'Calculate'} ${pct}% of that value.`;
  
  return {
    id: generateId(),
    type,
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: base, percent: pct, operation: 'large_percent' }
  };
}

// 15. CAGR-style multi-year growth (tough only)
function multiYearGrowth(difficulty: Difficulty, type: QuestionType): Question | null {
  if (difficulty !== 'tough') return null;
  
  const base: number = randomChoice([10000000, 20000000, 50000000, 100000000, 200000000]);
  const annualGrowth: number = randomChoice([10, 15, 20, 25]);
  const years: number = randomChoice([2, 3]);
  
  const signature = `cagr_${base}_${annualGrowth}_${years}`;
  if (isRecent(signature)) return null;
  addToRecent(signature);
  
  const correctAnswer = base * Math.pow(1 + annualGrowth / 100, years);
  
  const prompt = type === 'estimate'
    ? `Starting revenue: $${formatNumber(base)}. Growing ${annualGrowth}% annually for ${years} years. Estimate final revenue.`
    : `A company starts at $${formatNumber(base)} revenue and grows ${annualGrowth}% each year for ${years} years. What is the final revenue?`;
  
  return {
    id: generateId(),
    type,
    difficulty,
    prompt,
    correctAnswer,
    meta: { baseValue: base, percent: annualGrowth, operation: 'multi_year_growth' }
  };
}

// Template selection by difficulty
function getTemplatesForDifficulty(difficulty: Difficulty, _type: QuestionType): TemplateGenerator[] {
  const baseTemplates: TemplateGenerator[] = [
    percentOfNumber,
    multiplication,
    division,
    profitMargin,
    priceChange,
    perUnitCalculation,
  ];
  
  if (difficulty === 'easy') {
    return [
      percentOfNumber,
      percentOfNumber,  // Weight basic percentages more heavily
      multiplication,
      division,
      profitMargin,
      priceChange,
      perUnitCalculation,
      growthCalculation,
      marketShare,
    ];
  }
  
  if (difficulty === 'medium') {
    return [
      ...baseTemplates,
      reversePercentage,
      costStructure,
      growthCalculation,
      marketShare,
      breakEvenTarget,
      compoundPercentage,
      weightedAverage,
      largeNumberEstimate,
    ];
  }
  
  // Tough
  return [
    ...baseTemplates,
    reversePercentage,
    costStructure,
    growthCalculation,
    marketShare,
    breakEvenTarget,
    compoundPercentage,
    weightedAverage,
    largeNumberEstimate,
    multiYearGrowth,
  ];
}

// Main question generator with retry logic
export function generateQuestion(type: QuestionType, difficulty: Difficulty): Question {
  const templates = getTemplatesForDifficulty(difficulty, type);
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    const template = randomChoice(templates);
    const question = template(difficulty, type);
    
    if (question !== null) {
      return question;
    }
    attempts++;
  }
  
  // Fallback: always generate a percentage question
  const fallbackBases = { easy: EASY_BASES, medium: MEDIUM_BASES, tough: TOUGH_BASES };
  const fallbackPcts = { easy: EASY_PERCENTAGES, medium: MEDIUM_PERCENTAGES, tough: TOUGH_PERCENTAGES };
  
  const base = randomChoice(fallbackBases[difficulty]);
  const pct = randomChoice(fallbackPcts[difficulty]);
  const correctAnswer = base * pct / 100;
  
  return {
    id: generateId(),
    type,
    difficulty,
    prompt: `What is ${pct}% of ${formatNumber(base)}?`,
    correctAnswer,
    meta: { baseValue: base, percent: pct, operation: 'percent' }
  };
}

// Validation functions
export const TOLERANCE = 0.10;

export function checkAnswer(
  userAnswer: number,
  correctAnswer: number,
  type: QuestionType
): { isCorrect: boolean; errorPercent?: number } {
  if (type === 'accurate') {
    // For accurate mode, allow small tolerance for rounding
    const tolerance = Math.max(0.5, correctAnswer * 0.001); // 0.1% or 0.5, whichever is larger
    const isCorrect = Math.abs(userAnswer - correctAnswer) <= tolerance;
    return { isCorrect };
  }
  
  // Estimate mode: ±10% tolerance
  const lower = correctAnswer * (1 - TOLERANCE);
  const upper = correctAnswer * (1 + TOLERANCE);
  const isCorrect = userAnswer >= lower && userAnswer <= upper;
  const errorPercent = Math.abs(userAnswer - correctAnswer) / correctAnswer * 100;
  
  return { isCorrect, errorPercent };
}

// Convert user input to numeric value
export function getNumericAnswer(mantissa: number, suffix: 'none' | 'K' | 'M' | 'B'): number {
  const multipliers = { none: 1, K: 1_000, M: 1_000_000, B: 1_000_000_000 };
  return mantissa * multipliers[suffix];
}

// Clear recent questions (for testing or new sessions)
export function clearRecentQuestions(): void {
  recentQuestions.clear();
}
