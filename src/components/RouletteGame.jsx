import { useEffect, useMemo, useRef, useState } from 'react';
import './RouletteGame.css';

const NUMBERS = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const BET_AMOUNTS = [10, 25, 50, 100];

const getColor = (number) => number === 0 ? 'green' : RED_NUMBERS.has(number) ? 'red' : 'black';

const randomIndex = (length) => {
  if (globalThis.crypto?.getRandomValues) {
    const value = new Uint32Array(1);
    globalThis.crypto.getRandomValues(value);
    return value[0] % length;
  }
  return Math.floor(Math.random() * length);
};

const RouletteGame = () => {
  const [balance, setBalance] = useState(1000);
  const [betMode, setBetMode] = useState('red');
  const [selectedNumber, setSelectedNumber] = useState(17);
  const [betAmount, setBetAmount] = useState(25);
  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [ballAngle, setBallAngle] = useState(0);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => () => timerRef.current && window.clearTimeout(timerRef.current), []);

  const segments = useMemo(() => NUMBERS.map((number, index) => {
    const start = (index / NUMBERS.length) * 360;
    const end = ((index + 1) / NUMBERS.length) * 360;
    const color = number === 0 ? '#2f9365' : RED_NUMBERS.has(number) ? '#b73542' : '#171920';
    return `${color} ${start}deg ${end}deg`;
  }).join(', '), []);

  const handleSpin = () => {
    if (spinning || balance < betAmount) return;
    const resultIndex = randomIndex(NUMBERS.length);
    const winningNumber = NUMBERS[resultIndex];
    const sector = 360 / NUMBERS.length;
    const center = resultIndex * sector + sector / 2;
    const extraRotation = (360 - ((wheelRotation + 1440 + center) % 360)) % 360;

    setSpinning(true);
    setResult(null);
    setBalance((value) => value - betAmount);
    setBallAngle(0);
    setWheelRotation((value) => value + 1440 + extraRotation);

    timerRef.current = window.setTimeout(() => {
      const color = getColor(winningNumber);
      const won = betMode === 'number' ? winningNumber === selectedNumber : color === betMode;
      const payout = won ? betAmount * (betMode === 'number' ? 36 : 2) : 0;
      setBalance((value) => value + payout);
      setResult({ number: winningNumber, color, won, payout });
      setSpinning(false);
    }, 4200);
  };

  return (
    <main className="roulette-game" aria-label="Roulette game">
      <header className="game-heading">
        <p className="game-kicker">EXTRA / 01</p>
        <h1>Roulette</h1>
        <p>Choose a bet, spin the wheel, and see where the ball lands.</p>
      </header>

      <section className="roulette-layout">
        <div className="roulette-stage">
          <div className="roulette-pointer" aria-hidden="true" />
          <div className={`roulette-wheel${spinning ? ' is-spinning' : ''}`} style={{ background: `conic-gradient(${segments})`, transform: `rotate(${wheelRotation}deg)` }}>
            <div className="roulette-wheel__rim" aria-hidden="true" />
            {NUMBERS.map((number, index) => (
              <span className={`roulette-number roulette-number--${getColor(number)}`} style={{ '--number-angle': `${index * (360 / NUMBERS.length) + (180 / NUMBERS.length)}deg` }} key={number}>{number}</span>
            ))}
            <span className="roulette-wheel__hub" aria-hidden="true" />
          </div>
          <span className={`roulette-ball${spinning ? ' is-spinning' : ''}`} style={{ '--ball-angle': `${ballAngle}deg` }} aria-hidden="true" />
        </div>

        <div className="roulette-controls">
          <div className="game-balance"><span>Virtual credits</span><strong>{balance.toLocaleString()}</strong><button type="button" className="game-reset-button" disabled={spinning} onClick={() => { setBalance(1000); setResult(null); }}>Reset</button></div>
          <div className="game-control-group">
            <span className="game-control-label">Bet on</span>
            <div className="game-choice-row">
              {['red', 'black', 'green'].map((choice) => (
                <button type="button" className={`roulette-color-choice roulette-color-choice--${choice}${betMode === choice ? ' is-selected' : ''}`} onClick={() => setBetMode(choice)} key={choice}>{choice}</button>
              ))}
              <button type="button" className={`roulette-number-choice${betMode === 'number' ? ' is-selected' : ''}`} onClick={() => setBetMode('number')}>number</button>
            </div>
            {betMode === 'number' && (
              <div className="roulette-number-grid" aria-label="Choose a number">
                {NUMBERS.slice().sort((a, b) => a - b).map((number) => (
                  <button type="button" className={`${getColor(number)}${selectedNumber === number ? ' is-selected' : ''}`} onClick={() => { setSelectedNumber(number); setBetMode('number'); }} key={number}>{number}</button>
                ))}
              </div>
            )}
          </div>
          <div className="game-control-group">
            <span className="game-control-label">Stake</span>
            <div className="game-choice-row game-choice-row--amounts">
              {BET_AMOUNTS.map((amount) => <button type="button" className={betAmount === amount ? 'is-selected' : ''} onClick={() => setBetAmount(amount)} key={amount}>{amount}</button>)}
            </div>
          </div>
          <button type="button" className="game-primary-button" onClick={handleSpin} disabled={spinning || balance < betAmount}>{spinning ? 'Spinning…' : 'Spin the wheel'}</button>
          <p className={`game-result${result ? (result.won ? ' is-win' : ' is-loss') : ''}`} aria-live="polite">
            {result ? <>It landed on <strong>{result.number}</strong>. {result.won ? `You won ${result.payout} credits.` : 'Better luck next spin.'}</> : 'Number bets pay 35:1 · colour bets pay 1:1'}
          </p>
          <p className="game-disclaimer">For fun only — no real-money betting.</p>
        </div>
      </section>
    </main>
  );
};

export default RouletteGame;
