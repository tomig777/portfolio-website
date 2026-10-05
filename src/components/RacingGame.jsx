import { useEffect, useRef, useState } from 'react';
import { createRacePositions, getRaceTravelDistance, randomIndex } from '../utils/extraGames';
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
const RACE_DURATION_MS = 4450;

const RacingGame = () => {
  const [balance, setBalance] = useState(1000);
  const [selectedCar, setSelectedCar] = useState(0);
  const [betAmount, setBetAmount] = useState(25);
  const [positions, setPositions] = useState(() => CARS.map(() => 0));
  const [racing, setRacing] = useState(false);
  const [winner, setWinner] = useState(null);
  const [travelDistance, setTravelDistance] = useState(0);
  const [raceVersion, setRaceVersion] = useState(0);
  const trackRef = useRef(null);
  const finishRef = useRef(null);
  const firstCarRef = useRef(null);
  const raceInProgressRef = useRef(false);
  const frameRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const measure = () => {
      const car = firstCarRef.current;
      const finish = finishRef.current;
      if (!car || !finish || !car.offsetParent) return;
      const startLeft = car.offsetParent.getBoundingClientRect().left + Number.parseFloat(getComputedStyle(car).left);
      setTravelDistance(getRaceTravelDistance(finish.getBoundingClientRect().left, startLeft, car.offsetWidth));
    };
    measure();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    if (observer && track) observer.observe(track);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    raceInProgressRef.current = false;
  }, []);

  const startRace = () => {
    if (raceInProgressRef.current || balance < betAmount) return;
    raceInProgressRef.current = true;
    const winningIndex = randomIndex(CARS.length);
    const targetPositions = createRacePositions(winningIndex, CARS.length);
    const bet = { car: selectedCar, amount: betAmount };
    setBalance((value) => value - betAmount);
    setWinner(null);
    setPositions(CARS.map(() => 0));
    setRaceVersion((value) => value + 1);
    setRacing(true);
    // Paint the new cars at the start before setting their transform targets.
    // This also makes second and subsequent races animate from the start line.
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        setPositions(targetPositions);
        timerRef.current = window.setTimeout(() => {
          timerRef.current = null;
          const won = bet.car === winningIndex;
          const payout = won ? bet.amount * 5 : 0;
          setBalance((value) => value + payout);
          setWinner({ index: winningIndex, won, payout });
          setRacing(false);
          raceInProgressRef.current = false;
        }, RACE_DURATION_MS);
      });
    });
  };

  return (
    <main className="racing-game" aria-label="Virtual racing game">
      <header className="game-heading">
        <p className="game-kicker">EXTRA / 02</p>
        <h1>One lap</h1>
        <p>Pick a driver, watch the field launch, and see who reaches the flag first.</p>
      </header>

      <section className="racing-layout">
        <div ref={trackRef} className="race-track" data-racing={racing} aria-label="Five car racing track" style={{ '--car-travel': `${travelDistance}px`, '--race-duration': `${RACE_DURATION_MS}ms` }}>
          <div ref={finishRef} className="race-finish" aria-hidden="true" />
          {CARS.map((car, index) => (
            <div className="race-lane" key={car.name}>
              <span className="race-lane-number">0{index + 1}</span>
              <div className="race-lane-line" />
              <div ref={index === 0 ? firstCarRef : null} key={`${car.name}-${raceVersion}`} className="racing-car" style={{ '--car-color': car.color, '--car-progress': positions[index] }}>
                <span className="racing-car__body" />
                <span className="racing-car__window" />
                <span className="racing-car__name">{car.name}</span>
              </div>
            </div>
          ))}
          <div className="race-finish-label">FINISH</div>
        </div>

        <div className="racing-controls">
          <div className="game-balance"><span>Virtual credits</span><strong>{balance.toLocaleString()}</strong><button type="button" className="game-reset-button" disabled={racing} onClick={() => { setBalance(1000); setWinner(null); setPositions(CARS.map(() => 0)); setRaceVersion(value => value + 1); }}>Reset</button></div>
          <div className="game-control-group"><span className="game-control-label">Choose a car</span><div className="race-car-choices">{CARS.map((car, index) => <button type="button" className={selectedCar === index ? 'is-selected' : ''} disabled={racing} aria-pressed={selectedCar === index} onClick={() => setSelectedCar(index)} key={car.name}><i style={{ background: car.color }} />{car.name}</button>)}</div></div>
          <div className="game-control-group"><span className="game-control-label">Stake</span><div className="game-choice-row game-choice-row--amounts">{BET_AMOUNTS.map((amount) => <button type="button" className={betAmount === amount ? 'is-selected' : ''} disabled={racing} aria-pressed={betAmount === amount} onClick={() => setBetAmount(amount)} key={amount}>{amount}</button>)}</div></div>
          <button type="button" className="game-primary-button" onClick={startRace} disabled={racing || balance < betAmount}>{racing ? 'Race in progress…' : 'Start the race'}</button>
          <p className={`game-result${winner ? (winner.won ? ' is-win' : ' is-loss') : ''}`} aria-live="polite">{winner ? <>{CARS[winner.index].name} takes the flag. {winner.won ? `You won ${winner.payout} credits.` : 'Your car was pipped at the post.'}</> : 'Winner pays 4:1 · every race is random'}</p>
          <p className="game-disclaimer">For fun only — no real-money betting.</p>
        </div>
      </section>
    </main>
  );
};

export default RacingGame;
