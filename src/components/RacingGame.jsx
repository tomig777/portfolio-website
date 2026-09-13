import { useEffect, useRef, useState } from 'react';
import './RouletteGame.css'; // shared mini-game controls and typography
import './RacingGame.css';

const CARS = [
  { name: 'Comet', color: '#ef6262' },
  { name: 'Volt', color: '#f3bd5e' },
  { name: 'Nova', color: '#6dc6f0' },
  { name: 'Orbit', color: '#9b86e8' },
  { name: 'Pulse', color: '#70d3a0' }
];
const BET_AMOUNTS = [10, 25, 50, 100];

const random = (min, max) => min + Math.random() * (max - min);

const RacingGame = () => {
  const [balance, setBalance] = useState(1000);
  const [selectedCar, setSelectedCar] = useState(0);
  const [betAmount, setBetAmount] = useState(25);
  const [positions, setPositions] = useState(() => CARS.map(() => 0));
  const [racing, setRacing] = useState(false);
  const [winner, setWinner] = useState(null);
  const frameRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const startRace = () => {
    if (racing || balance < betAmount) return;
    const winningIndex = Math.floor(Math.random() * CARS.length);
    const targetPositions = CARS.map((_, index) => index === winningIndex ? random(91, 96) : random(78, 89));
    targetPositions[winningIndex] = Math.max(...targetPositions) + .5;
    setBalance((value) => value - betAmount);
    setWinner(null);
    setPositions(CARS.map(() => 0));
    setRacing(true);
    frameRef.current = requestAnimationFrame(() => setPositions(targetPositions));
    timerRef.current = window.setTimeout(() => {
      const won = selectedCar === winningIndex;
      const payout = won ? betAmount * 5 : 0;
      setBalance((value) => value + payout);
      setWinner({ index: winningIndex, won, payout });
      setRacing(false);
    }, 4550);
  };

  return (
    <main className="racing-game" aria-label="Virtual racing game">
      <header className="game-heading">
        <p className="game-kicker">EXTRA / 02</p>
        <h1>One lap</h1>
        <p>Pick a driver, watch the field launch, and see who reaches the flag first.</p>
      </header>

      <section className="racing-layout">
        <div className="race-track" aria-label="Five car racing track">
          <div className="race-finish" aria-hidden="true" />
          {CARS.map((car, index) => (
            <div className="race-lane" key={car.name}>
              <span className="race-lane-number">0{index + 1}</span>
              <div className="race-lane-line" />
              <div className="racing-car" style={{ '--car-color': car.color, '--car-progress': `${positions[index]}%` }}>
                <span className="racing-car__body" />
                <span className="racing-car__window" />
                <span className="racing-car__name">{car.name}</span>
              </div>
            </div>
          ))}
          <div className="race-finish-label">FINISH</div>
        </div>

        <div className="racing-controls">
          <div className="game-balance"><span>Virtual credits</span><strong>{balance.toLocaleString()}</strong><button type="button" className="game-reset-button" disabled={racing} onClick={() => { setBalance(1000); setWinner(null); }}>Reset</button></div>
          <div className="game-control-group"><span className="game-control-label">Choose a car</span><div className="race-car-choices">{CARS.map((car, index) => <button type="button" className={selectedCar === index ? 'is-selected' : ''} onClick={() => setSelectedCar(index)} key={car.name}><i style={{ background: car.color }} />{car.name}</button>)}</div></div>
          <div className="game-control-group"><span className="game-control-label">Stake</span><div className="game-choice-row game-choice-row--amounts">{BET_AMOUNTS.map((amount) => <button type="button" className={betAmount === amount ? 'is-selected' : ''} onClick={() => setBetAmount(amount)} key={amount}>{amount}</button>)}</div></div>
          <button type="button" className="game-primary-button" onClick={startRace} disabled={racing || balance < betAmount}>{racing ? 'Race in progress…' : 'Start the race'}</button>
          <p className={`game-result${winner ? (winner.won ? ' is-win' : ' is-loss') : ''}`} aria-live="polite">{winner ? <>{CARS[winner.index].name} takes the flag. {winner.won ? `You won ${winner.payout} credits.` : 'Your car was pipped at the post.'}</> : 'Winner pays 4:1 · every race is random'}</p>
          <p className="game-disclaimer">For fun only — no real-money betting.</p>
        </div>
      </section>
    </main>
  );
};

export default RacingGame;
