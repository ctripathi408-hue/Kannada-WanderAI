import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEstimatedBudget,
  getEstimatedDistanceKm,
  getSeasonalWeatherAdvice,
  validateItinerary,
  getTransitRecommendation
} from './travel-calculator.ts';

test('calculateEstimatedBudget calculates tiered budgets correctly for 5 days and 2 travellers', () => {
  const budgetTier = calculateEstimatedBudget(5, 'budget', 2);
  assert.ok(budgetTier.total > 0);
  assert.equal(budgetTier.perPerson, Math.round(budgetTier.total / 2));
  assert.ok(budgetTier.breakdown.stays > 0);
  assert.ok(budgetTier.breakdown.food > 0);
  assert.ok(budgetTier.breakdown.transit > 0);
  assert.ok(budgetTier.breakdown.contingency > 0);

  const comfortTier = calculateEstimatedBudget(5, 'comfort', 2);
  const luxuryTier = calculateEstimatedBudget(5, 'luxury', 2);

  // Comfort should cost more than budget, and luxury more than comfort
  assert.ok(comfortTier.total > budgetTier.total, 'Comfort tier must exceed budget tier');
  assert.ok(luxuryTier.total > comfortTier.total, 'Luxury tier must exceed comfort tier');
});

test('calculateEstimatedBudget handles edge cases like 1 day or 1 traveller', () => {
  const single = calculateEstimatedBudget(1, 'budget', 1);
  assert.ok(single.total > 0);
  assert.equal(single.total, single.perPerson);
});

test('getEstimatedDistanceKm returns accurate Karnataka highway distances', () => {
  const bngMys = getEstimatedDistanceKm('Bengaluru', 'Mysuru');
  assert.equal(bngMys, 145);

  const bngHmp = getEstimatedDistanceKm('Bengaluru', 'Hampi');
  assert.equal(bngHmp, 345);

  const sameCity = getEstimatedDistanceKm('Mysuru', 'Mysuru');
  assert.equal(sameCity, 0);

  const fallback = getEstimatedDistanceKm('UnknownPlaceA', 'UnknownPlaceB');
  assert.ok(fallback > 0);
});

test('getSeasonalWeatherAdvice provides accurate microclimate tips for Western Ghats and Hampi', () => {
  const coorgMonsoon = getSeasonalWeatherAdvice('Coorg (Madikeri)', 7); // July
  assert.ok(coorgMonsoon.seasonName.includes('Monsoon'));
  assert.ok(coorgMonsoon.clothingTip.toLowerCase().includes('waterproof'));

  const hampiWinter = getSeasonalWeatherAdvice('Hampi', 12); // December
  assert.equal(hampiWinter.isPeakSeason, true);

  const hampiSummer = getSeasonalWeatherAdvice('Hampi', 4); // April
  assert.equal(hampiSummer.isPeakSeason, false);
  assert.ok(hampiSummer.summary.includes('42°C') || hampiSummer.summary.includes('38°C') || hampiSummer.clothingTip.toLowerCase().includes('cotton'));
});

test('validateItinerary detects missing fields or invalid structures', () => {
  const emptyRes = validateItinerary(null);
  assert.equal(emptyRes.valid, false);

  const missingTitle = validateItinerary({ durationDays: 3, days: [{ activities: [{}] }], estimatedBudgetInr: { total: 5000 } });
  assert.equal(missingTitle.valid, false);
  assert.ok(missingTitle.errors.some(e => e.includes('title')));

  const validPlan = {
    title: 'Karnataka Quick Tour',
    durationDays: 2,
    days: [
      { dayNumber: 1, activities: [{ title: 'Visit Palace' }] },
      { dayNumber: 2, activities: [{ title: 'Visit Temple' }] }
    ],
    estimatedBudgetInr: { total: 10000, perPerson: 5000 }
  };
  const validRes = validateItinerary(validPlan);
  assert.equal(validRes.valid, true);
  assert.equal(validRes.errors.length, 0);
});

test('getTransitRecommendation returns authentic transit options for key Karnataka routes', () => {
  const bngMys = getTransitRecommendation('Bengaluru', 'Mysuru');
  assert.ok(bngMys.modeLabel.length > 0);
  assert.ok(bngMys.bookingPortal.includes('irctc') || bngMys.bookingPortal.includes('ksrtc'));
  assert.ok(bngMys.estimatedCostInr > 0);
});
