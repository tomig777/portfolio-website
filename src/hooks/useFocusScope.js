import { useEffect, useRef } from 'react';
import { createFocusScope } from '../utils/focusScope';

export function useFocusScope(rootRef, { active = true, scopeKey, initialFocus, fallbackFocus, onEscape, trap = true, isolate = true, restoreFocus = true } = {}) {
  const escapeRef = useRef(onEscape);
  const handlesEscape = Boolean(onEscape);
  useEffect(() => { escapeRef.current = onEscape; }, [onEscape]);
  useEffect(() => {
    if (!active || !rootRef.current) return undefined;
    return createFocusScope(rootRef.current, {
      initialFocus, fallbackFocus, trap, isolate, restoreFocus,
      onEscape: handlesEscape ? event => escapeRef.current?.(event) : undefined,
    });
  }, [rootRef, active, scopeKey, initialFocus, fallbackFocus, trap, isolate, restoreFocus, handlesEscape]);
}
