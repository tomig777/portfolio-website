import React, { useCallback, useEffect, useRef, useState } from 'react';
import './BubblePasswordGate.css';
import { useFocusScope } from '../hooks/useFocusScope';

const BubblePasswordGate = ({
  accessibleTitle = 'Enter password',
  brand = 'Protected access',
  cancelLabel = 'Cancel',
  footerNote = 'Protected content',
  idleMessage = 'Type the four-digit access code',
  successMessage = 'Access granted',
  variant = 'default',
  onCancel,
  onSubmit,
  onSuccess,
}) => {
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const timerRef = useRef(null);
  const [password, setPassword] = useState('');
  const [phase, setPhase] = useState('opening');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setPhase('ready');
      // The focus scope owns entry focus. A delayed focus call would steal it
      // from Cancel if the user tabs there during the opening animation.
    }, 520);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const closeGate = useCallback(() => {
    if (phase === 'checking' || phase === 'approved') return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase('closing');
    timerRef.current = setTimeout(() => onCancel?.(), 260);
  }, [onCancel, phase]);

  const verifyPassword = useCallback(async (value) => {
    setPhase('checking');
    setErrorMessage('');

    try {
      await onSubmit(value);
      setPhase('approved');
      timerRef.current = setTimeout(() => onSuccess?.(), 780);
    } catch (error) {
      setPhase('error');
      setErrorMessage(error?.message || 'That code does not match.');
      timerRef.current = setTimeout(() => {
        setPassword('');
        setPhase('ready');
      }, 720);
    }
  }, [onSubmit, onSuccess]);

  const handlePasswordChange = (event) => {
    if (!['opening', 'ready'].includes(phase)) return;
    const value = event.target.value.replace(/\D/g, '').slice(0, 4);
    setPassword(value);
    setErrorMessage('');

    if (value.length === 4) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => verifyPassword(value), 180);
    }
  };

  useFocusScope(dialogRef, { initialFocus: '.bubble-password__input', onEscape: closeGate });

  return (
    <div
      ref={dialogRef}
      className={`bubble-password bubble-password--${phase} bubble-password--${variant}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bubble-password-title"
      data-lenis-prevent
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeGate();
      }}
    >
      <div className="bubble-password__layout">
      <p className="bubble-password__brand">{brand}</p>

      <form
        className="bubble-password__form"
        onSubmit={(event) => event.preventDefault()}
        onClick={() => inputRef.current?.focus()}
      >
        <h2 id="bubble-password-title">{accessibleTitle}</h2>
        <input
          ref={inputRef}
          className="bubble-password__input"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          value={password}
          onChange={handlePasswordChange}
          aria-label={accessibleTitle}
          aria-invalid={phase === 'error'}
          readOnly={!['opening', 'ready'].includes(phase)}
        />
        <div className="bubble-password__sequence" aria-hidden="true">
          {[0, 1, 2, 3].map((index) => (
            <span
              className={[
                'bubble-password__orb',
                password[index] ? 'is-filled' : '',
                Math.min(password.length, 3) === index && !['checking', 'approved'].includes(phase) ? 'is-active' : '',
              ].filter(Boolean).join(' ')}
              style={{ '--orb-index': index }}
              key={index}
            >
              {password[index] ? '•' : ''}
            </span>
          ))}
        </div>
        <p className="bubble-password__message" aria-live="polite">
          {phase === 'checking' && 'Checking code…'}
          {phase === 'approved' && successMessage}
          {phase === 'error' && errorMessage}
          {!['checking', 'approved', 'error'].includes(phase) && idleMessage}
        </p>
      </form>

      <button type="button" className="bubble-password__cancel" onClick={closeGate}>
        {cancelLabel}
      </button>
      <p className="bubble-password__note">{footerNote}</p>
      </div>
    </div>
  );
};

export default BubblePasswordGate;
