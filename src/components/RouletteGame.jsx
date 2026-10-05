import { useEffect, useMemo, useRef, useState } from 'react';
import { ROULETTE_NUMBERS as NUMBERS, getRouletteColor as getColor, getRouletteRotation, randomIndex, resolveRouletteBet } from '../utils/extraGames';
import './RouletteGame.css';

const BET_AMOUNTS = [10, 25, 50, 100];

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
  const spinningRef = useRef(false);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    spinningRef.current = false;
  }, []);

  const segments = useMemo(() => NUMBERS.map((number, index) => {
    const start = (index / NUMBERS.length) * 360;
    const end = ((index + 1) / NUMBERS.length) * 360;
    const color = number === 0 ? '#2f9365' : getColor(number) === 'red' ? '#b73542' : '#171920';
    return `${color} ${start}deg ${end}deg`;
  }).join(', '), []);

  const handleSpin = () => {
    if (spinningRef.current || balance < betAmount) return;
    spinningRef.current = true;
    const resultIndex = randomIndex(NUMBERS.length);
    const winningNumber = NUMBERS[resultIndex];
    const bet = { mode: betMode, number: selectedNumber, amount: betAmount };

    setSpinning(true);
    setResult(null);
    setBalance((value) => value - betAmount);
    // Cumulative rotations animate every spin and do not unwind after a result.
    setBallAngle((value) => value - 1800);
    setWheelRotation(getRouletteRotation(wheelRotation, resultIndex));

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      const settled = resolveRouletteBet(winningNumber, bet);
      setBalance((value) => value + settled.payout);
      setResult(settled);
      setSpinning(false);
      spinningRef.current = false;
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
                <button type="button" className={`roulette-color-choice roulette-color-choice--${choice}${betMode === choice ? ' is-selected' : ''}`} disabled={spinning} aria-pressed={betMode === choice} onClick={() => setBetMode(choice)} key={choice}>{choice}</button>
              ))}
              <button type="button" className={`roulette-number-choice${betMode === 'number' ? ' is-selected' : ''}`} disabled={spinning} aria-pressed={betMode === 'number'} onClick={() => setBetMode('number')}>number</button>
            </div>
            {betMode === 'number' && (
              <div className="roulette-number-grid" aria-label="Choose a number">
                {NUMBERS.slice().sort((a, b) => a - b).map((number) => (
                  <button type="button" className={`${getColor(number)}${selectedNumber === number ? ' is-selected' : ''}`} disabled={spinning} aria-pressed={selectedNumber === number} onClick={() => { setSelectedNumber(number); setBetMode('number'); }} key={number}>{number}</button>
                ))}
              </div>
            )}
          </div>
          <div className="game-control-group">
            <span className="game-control-label">Stake</span>
            <div className="game-choice-row game-choice-row--amounts">
              {BET_AMOUNTS.map((amount) => <button type="button" className={betAmount === amount ? 'is-selected' : ''} disabled={spinning} aria-pressed={betAmount === amount} onClick={() => setBetAmount(amount)} key={amount}>{amount}</button>)}
            </div>
          </div>
          <button type="button" className="game-primary-button" onClick={handleSpin} disabled={spinning || balance < betAmount}>{spinning ? 'Spinning…' : 'Spin the wheel'}</button>
          <p className={`game-result${result ? (result.won ? ' is-win' : ' is-loss') : ''}`} aria-live="polite">
            {result ? <>It landed on <strong>{result.number}</strong>. {result.won ? `You won ${result.payout} credits.` : 'Better luck next spin.'}</> : 'Number / green pays 35:1 · red / black pays 1:1'}
          </p>
          <p className="game-disclaimer">For fun only — no real-money betting.</p>
        </div>
      </section>
    </main>
  );
};

export default RouletteGame;
