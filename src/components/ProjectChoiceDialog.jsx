import { useRef } from 'react';
import { useFocusScope } from '../hooks/useFocusScope';

export default function ProjectChoiceDialog({ id, label, title, description, closeLabel, choices, onChoose, onClose }) {
  const dialogRef = useRef(null);
  const titleId = `pp-choice-title-${id}`;
  useFocusScope(dialogRef, {
    initialFocus: 'root',
    onEscape: onClose,
  });

  return (
    <div ref={dialogRef} className="pp-password-overlay pp-choice-overlay" role="dialog" aria-modal="true" aria-labelledby={titleId} data-lenis-prevent>
      <div className="pp-password-card pp-choice-card">
        <p className="pp-password-label">{label}</p>
        <h2 className="pp-password-title" id={titleId}>{title}</h2>
        <p className="pp-choice-copy">{description}</p>
        <div className="pp-choice-buttons">
          {choices.map(choice => (
            <button
              key={choice.id}
              type="button"
              disabled={Boolean(choice.comingSoon)}
              onClick={() => onChoose(choice.id)}
            >
              <span className="pp-choice-number">{choice.number}</span>
              <span className="pp-choice-name">{choice.label}</span>
              {choice.comingSoon && <span className="pp-choice-status">Coming soon</span>}
            </button>
          ))}
        </div>
        <button type="button" className="pp-password-close pp-choice-cancel" aria-label={closeLabel} onClick={onClose}>×</button>
      </div>
    </div>
  );
}
