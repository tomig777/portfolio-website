import test from 'node:test';
import assert from 'node:assert/strict';
import { createFocusScope, getFocusTrapTarget, isolateElements } from '../src/utils/focusScope.js';

test('focus wraps only at the edge and recovers when focus is outside', () => {
  const stops = [{ name: 'first' }, { name: 'middle' }, { name: 'last' }];
  assert.equal(getFocusTrapTarget(stops[2], stops), stops[0]);
  assert.equal(getFocusTrapTarget(stops[0], stops, true), stops[2]);
  assert.equal(getFocusTrapTarget(stops[1], stops), undefined);
  assert.equal(getFocusTrapTarget(stops[1], stops, true), undefined);
  assert.equal(getFocusTrapTarget({}, stops), stops[0]);
  assert.equal(getFocusTrapTarget({}, stops, true), stops[2]);
});

test('empty and single-control dialogs do not leak keyboard focus', () => {
  const stop = {};
  assert.equal(getFocusTrapTarget({}, []), null);
  assert.equal(getFocusTrapTarget(stop, [stop]), stop);
  assert.equal(getFocusTrapTarget(stop, [stop], true), stop);
});

function element(inert = false, ariaHidden = null) {
  const attributes = new Map(ariaHidden === null ? [] : [['aria-hidden', ariaHidden]]);
  return { inert, getAttribute: name => attributes.get(name) ?? null,
    setAttribute: (name, value) => attributes.set(name, value), removeAttribute: name => attributes.delete(name) };
}

test('overlapping dialogs release background isolation only after the last owner', () => {
  const background = element();
  const releasePage = isolateElements([background, background]);
  const releaseDialog = isolateElements([background]);
  assert.equal(background.inert, true);
  assert.equal(background.getAttribute('aria-hidden'), 'true');
  releasePage();
  releasePage();
  assert.equal(background.inert, true);
  releaseDialog();
  assert.equal(background.inert, false);
  assert.equal(background.getAttribute('aria-hidden'), null);
});

test('isolation preserves previously hidden/inert content and tolerates missing nodes', () => {
  const background = element(true, 'true');
  const release = isolateElements([background, null]);
  release();
  assert.equal(background.inert, true);
  assert.equal(background.getAttribute('aria-hidden'), 'true');
});

function scopeFixture() {
  const listeners = new Map();
  const document = {
    activeElement: null,
    defaultView: { getComputedStyle: () => ({ visibility: 'visible' }) },
    addEventListener: (type, handler) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(handler);
    },
    removeEventListener: (type, handler) => listeners.get(type)?.delete(handler),
  };
  const node = (tagName, parentElement = null) => {
    const result = { ...element(), tagName, parentElement, ownerDocument: document, isConnected: true, tabIndex: 0, children: [] };
    result.focus = options => { assert.equal(options.preventScroll, true); document.activeElement = result; };
    result.getClientRects = () => [{}];
    result.closest = () => {
      let branch = result;
      while (branch) {
        if (branch.inert || branch.getAttribute('aria-hidden') === 'true') return branch;
        branch = branch.parentElement;
      }
      return null;
    };
    result.contains = target => target === result || result.children.some(child => child.contains(target));
    parentElement?.children.push(result);
    return result;
  };
  const body = node('BODY');
  document.body = body;
  const background = node('DIV', body);
  const opener = node('BUTTON', background);
  document.activeElement = opener;
  const makeDialog = () => {
    const root = node('DIV', body);
    const first = node('BUTTON', root);
    const last = node('BUTTON', root);
    root.querySelector = () => first;
    root.querySelectorAll = () => [first, last];
    return { root, first, last };
  };
  const key = (key, shiftKey = false) => {
    const event = { key, shiftKey, prevented: false, stopped: false,
      preventDefault() { this.prevented = true; }, stopPropagation() { this.stopped = true; } };
    for (const handler of listeners.get('keydown') || []) handler(event);
    return event;
  };
  return { document, listeners, background, opener, makeDialog, key };
}

test('container initial focus avoids highlighting a control and Tab still enters the choices', () => {
  const fixture = scopeFixture();
  const dialog = fixture.makeDialog();
  const release = createFocusScope(dialog.root, { initialFocus: 'root' });
  assert.equal(fixture.document.activeElement, dialog.root);
  assert.equal(fixture.key('Tab').prevented, true);
  assert.equal(fixture.document.activeElement, dialog.first);
  release();
  assert.equal(fixture.document.activeElement, fixture.opener);
});

test('nested focus scopes give Escape to the top dialog and restore focus in order', () => {
  const fixture = scopeFixture();
  const first = fixture.makeDialog();
  const escaped = [];
  const releaseFirst = createFocusScope(first.root, { onEscape: () => escaped.push('first') });
  assert.equal(fixture.document.activeElement, first.first);
  assert.equal(fixture.background.inert, true);
  const second = fixture.makeDialog();
  const releaseSecond = createFocusScope(second.root, { onEscape: () => escaped.push('second') });
  assert.equal(fixture.key('Escape').prevented, true);
  assert.deepEqual(escaped, ['second']);
  fixture.key('Tab', true);
  assert.equal(fixture.document.activeElement, second.last);
  fixture.key('Tab');
  assert.equal(fixture.document.activeElement, second.first);
  releaseSecond();
  assert.equal(fixture.document.activeElement, first.first);
  assert.equal(fixture.background.inert, true);
  fixture.key('Escape');
  assert.deepEqual(escaped, ['second', 'first']);
  releaseFirst();
  releaseFirst();
  assert.equal(fixture.document.activeElement, fixture.opener);
  assert.equal(fixture.background.inert, false);
  assert.equal(first.root.getAttribute('tabindex'), null);
  assert.equal(second.root.getAttribute('tabindex'), null);
  assert.equal(fixture.listeners.get('keydown').size, 0);
  assert.equal(fixture.listeners.get('focusin').size, 0);
});

test('a page focus scope does not trap Tab or intercept Escape without a handler', () => {
  const fixture = scopeFixture();
  const dialog = fixture.makeDialog();
  dialog.root.setAttribute('tabindex', '0');
  const release = createFocusScope(dialog.root, { trap: false, isolate: false, restoreFocus: false });
  assert.equal(fixture.background.inert, false);
  assert.equal(fixture.key('Tab').prevented, false);
  assert.equal(fixture.key('Escape').prevented, false);
  release();
  assert.equal(dialog.root.getAttribute('tabindex'), '0');
  assert.equal(fixture.document.activeElement, dialog.first);
});

test('a removed menu opener restores focus to the configured connected fallback', () => {
  const fixture = scopeFixture();
  const fallback = fixture.makeDialog().first;
  const dialog = fixture.makeDialog();
  const release = createFocusScope(dialog.root, { fallbackFocus: fallback });
  fixture.opener.isConnected = false;
  release();
  assert.equal(fixture.document.activeElement, fallback);
  assert.equal(fixture.background.inert, false);
});

test('an opener blurred by page visibility uses its saved fallback instead of the body', () => {
  const fixture = scopeFixture();
  const dialog = fixture.makeDialog();
  fixture.document.activeElement = fixture.document.body;
  const release = createFocusScope(dialog.root, { fallbackFocus: fixture.opener });
  release();
  assert.equal(fixture.document.activeElement, fixture.opener);
});

test('focus restoration waits for the remaining background-isolation cleanup', async () => {
  const fixture = scopeFixture();
  const dialog = fixture.makeDialog();
  const releaseScope = createFocusScope(dialog.root);
  const releasePage = isolateElements([fixture.background]);
  releaseScope();
  assert.equal(fixture.background.inert, true);
  releasePage();
  await Promise.resolve();
  assert.equal(fixture.document.activeElement, fixture.opener);
});

test('a deferred restoration cannot steal focus from a newly opened dialog', async () => {
  const fixture = scopeFixture();
  const first = fixture.makeDialog();
  const releaseFirst = createFocusScope(first.root);
  const releasePage = isolateElements([fixture.background]);
  releaseFirst();
  const second = fixture.makeDialog();
  const releaseSecond = createFocusScope(second.root);
  releasePage();
  await Promise.resolve();
  assert.equal(fixture.document.activeElement, second.first);
  releaseSecond();
});
