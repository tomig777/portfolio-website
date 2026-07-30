import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'motion/react';

import './RotatingText.css';

const joinClasses = (...classes) => classes.filter(Boolean).join(' ');

const splitIntoCharacters = (text) => {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (segment) => segment.segment);
  }

  return Array.from(text);
};

const RotatingText = forwardRef((props, ref) => {
  const {
    texts,
    transition = { type: 'spring', damping: 25, stiffness: 300 },
    initial = { y: '100%', opacity: 0 },
    animate = { y: 0, opacity: 1 },
    exit = { y: '-120%', opacity: 0 },
    animatePresenceMode = 'wait',
    animatePresenceInitial = false,
    rotationInterval = 2000,
    staggerDuration = 0,
    staggerFrom = 'first',
    loop = true,
    auto = true,
    splitBy = 'characters',
    onNext,
    mainClassName,
    splitLevelClassName,
    elementLevelClassName,
    ...rest
  } = props;

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const elements = useMemo(() => {
    const currentText = texts[currentTextIndex] || '';
    if (splitBy === 'characters') {
      return currentText.split(' ').map((word, index, words) => ({
        characters: splitIntoCharacters(word),
        needsSpace: index !== words.length - 1
      }));
    }
    if (splitBy === 'words') {
      return currentText.split(' ').map((word, index, words) => ({
        characters: [word],
        needsSpace: index !== words.length - 1
      }));
    }
    if (splitBy === 'lines') {
      return currentText.split('\n').map((line, index, lines) => ({
        characters: [line],
        needsSpace: index !== lines.length - 1
      }));
    }

    return currentText.split(splitBy).map((part, index, parts) => ({
      characters: [part],
      needsSpace: index !== parts.length - 1
    }));
  }, [texts, currentTextIndex, splitBy]);

  const getStaggerDelay = useCallback((index, totalChars) => {
    if (staggerFrom === 'first') return index * staggerDuration;
    if (staggerFrom === 'last') return (totalChars - 1 - index) * staggerDuration;
    if (staggerFrom === 'center') return Math.abs(Math.floor(totalChars / 2) - index) * staggerDuration;
    if (staggerFrom === 'random') return Math.abs(Math.floor(Math.random() * totalChars) - index) * staggerDuration;
    return Math.abs(staggerFrom - index) * staggerDuration;
  }, [staggerFrom, staggerDuration]);

  const handleIndexChange = useCallback((newIndex) => {
    setCurrentTextIndex(newIndex);
    onNext?.(newIndex);
  }, [onNext]);

  const next = useCallback(() => {
    const nextIndex = currentTextIndex === texts.length - 1
      ? (loop ? 0 : currentTextIndex)
      : currentTextIndex + 1;
    if (nextIndex !== currentTextIndex) handleIndexChange(nextIndex);
  }, [currentTextIndex, texts.length, loop, handleIndexChange]);

  const previous = useCallback(() => {
    const previousIndex = currentTextIndex === 0
      ? (loop ? texts.length - 1 : currentTextIndex)
      : currentTextIndex - 1;
    if (previousIndex !== currentTextIndex) handleIndexChange(previousIndex);
  }, [currentTextIndex, texts.length, loop, handleIndexChange]);

  const jumpTo = useCallback((index) => {
    const validIndex = Math.max(0, Math.min(index, texts.length - 1));
    if (validIndex !== currentTextIndex) handleIndexChange(validIndex);
  }, [texts.length, currentTextIndex, handleIndexChange]);

  const reset = useCallback(() => {
    if (currentTextIndex !== 0) handleIndexChange(0);
  }, [currentTextIndex, handleIndexChange]);

  useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [next, previous, jumpTo, reset]);

  useEffect(() => {
    if (!auto) return undefined;
    const intervalId = window.setInterval(next, rotationInterval);
    return () => window.clearInterval(intervalId);
  }, [next, rotationInterval, auto]);

  const totalCharacters = elements.reduce((sum, word) => sum + word.characters.length, 0);

  return (
    <Motion.span className={joinClasses('text-rotate', mainClassName)} {...rest} layout transition={transition}>
      <span className="text-rotate-sr-only">{texts[currentTextIndex]}</span>
      <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
        <Motion.span
          key={currentTextIndex}
          className={joinClasses(splitBy === 'lines' ? 'text-rotate-lines' : 'text-rotate')}
          layout
          aria-hidden="true"
        >
          {elements.map((word, wordIndex, words) => {
            const previousCharacters = words
              .slice(0, wordIndex)
              .reduce((sum, previousWord) => sum + previousWord.characters.length, 0);

            return (
              <span key={`${wordIndex}-${word.characters.join('')}`} className={joinClasses('text-rotate-word', splitLevelClassName)}>
                {word.characters.map((character, characterIndex) => (
                  <Motion.span
                    key={`${character}-${characterIndex}`}
                    initial={initial}
                    animate={animate}
                    exit={exit}
                    transition={{
                      ...transition,
                      delay: getStaggerDelay(previousCharacters + characterIndex, totalCharacters)
                    }}
                    className={joinClasses('text-rotate-element', elementLevelClassName)}
                  >
                    {character}
                  </Motion.span>
                ))}
                {word.needsSpace && <span className="text-rotate-space"> </span>}
              </span>
            );
          })}
        </Motion.span>
      </AnimatePresence>
    </Motion.span>
  );
});

RotatingText.displayName = 'RotatingText';

export default RotatingText;
