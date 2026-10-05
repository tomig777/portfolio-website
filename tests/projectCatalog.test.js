import test from 'node:test';
import assert from 'node:assert/strict';
import { PROJECT_ENTRIES, PROJECT_CHOICE_GROUPS, getProjectSelection, getAvailableProjectChoice } from '../src/utils/projectCatalog.js';

test('the projects list keeps seven entries with Mini Arcade and Fun Project before Archive Preview', () => {
  assert.deepEqual(PROJECT_ENTRIES.map(entry => entry.text), ['ASCII Vortex', 'Music Player', 'Sketch Relay', 'Gradient Drift', 'Mini Arcade', 'Fun Project', 'Archive Preview']);
  assert.equal(new Set(PROJECT_ENTRIES.map(entry => entry.id)).size, 7);
});

test('only Archive Preview requests a password; Mini Arcade goes straight to its selector', () => {
  assert.deepEqual(getProjectSelection('archive-preview'), { kind: 'password', group: 'archive' });
  assert.deepEqual(getProjectSelection('mini-arcade'), { kind: 'selector', group: 'games' });
  assert.deepEqual(getProjectSelection('fun-project'), { kind: 'project', projectId: 'fun-project' });
  assert.equal(PROJECT_ENTRIES.filter(entry => entry.passwordProtected).length, 1);
  assert.equal(getProjectSelection('unknown'), null);
});

test('both selectors have three numbered choices with the last marked coming soon', () => {
  for (const group of Object.values(PROJECT_CHOICE_GROUPS)) {
    assert.deepEqual(group.choices.map(choice => choice.number), ['1', '2', '3']);
    assert.equal(group.choices[2].comingSoon, true);
    assert.equal(group.choices[2].projectId, undefined);
  }
});

test('available choices launch only their own existing projects', () => {
  assert.equal(getAvailableProjectChoice('games', 'roulette'), 'roulette');
  assert.equal(getAvailableProjectChoice('games', 'racing'), 'racing');
  assert.equal(getAvailableProjectChoice('archive', 'mobile-preview'), 'mobile-preview');
  assert.equal(getAvailableProjectChoice('archive', 'website-archive'), 'website-archive');
});

test('coming-soon, unknown and cross-group choices cannot launch a page', () => {
  assert.equal(getAvailableProjectChoice('games', 'card-game'), null);
  assert.equal(getAvailableProjectChoice('archive', 'website-update'), null);
  assert.equal(getAvailableProjectChoice('games', 'website-archive'), null);
  assert.equal(getAvailableProjectChoice('archive', 'roulette'), null);
  assert.equal(getAvailableProjectChoice('unknown', 'roulette'), null);
  assert.equal(getAvailableProjectChoice('archive', 'unknown'), null);
});
