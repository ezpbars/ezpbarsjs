/**
 * @jest-environment jsdom
 */

import { LinearOverallProgressBar } from './LinearOverallProgressBar.js';

test('uses progress element', () => {
  const pbar = new LinearOverallProgressBar();
  expect(pbar.element.tagName).toBe('PROGRESS');
});

test('initial value is 0', () => {
  const pbar = new LinearOverallProgressBar();
  expect(pbar.element.getAttribute('value')).toBe('0');
});

test('initial max is 100', () => {
  const pbar = new LinearOverallProgressBar();
  expect(pbar.element.getAttribute('max')).toBe('100');
});

test('value for overall = 100', () => {
  const pbar = new LinearOverallProgressBar();
  pbar.overallEtaSeconds = 100;
  pbar.remainingEtaSeconds = 20;
  expect(pbar.element.getAttribute('value')).toBe('80');
});

test('max and value work for overall time above 100', () => {
  const pbar = new LinearOverallProgressBar();
  pbar.overallEtaSeconds = 200;
  pbar.remainingEtaSeconds = 40;
  expect(pbar.element.getAttribute('value')).toBe('80');
  expect(pbar.element.getAttribute('max')).toBe('100');
});
