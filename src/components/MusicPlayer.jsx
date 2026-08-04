import React, { useEffect, useMemo, useRef, useState } from 'react';

import devilInANewDress from '../assets/devilinanewdress.mp3';
import mbdtfCover from '../assets/mbdtf_cover.jpg';
import highsAndLows from '../assets/highsandlows.mp3';
import bullyCover from '../assets/bully_cover.jpg';
import theStorm from '../assets/thestorm.mp3';
import chakras from '../assets/chakras.mp3';
import newBody from '../assets/newbody.mp3';
import yandhiCover from '../assets/yandhi_cover.jpg';
import canUBe from '../assets/canube.mp3';
import volturesCover from '../assets/voltures_cover.jpg';
import ElasticSlider from './ElasticSlider';

import './MusicPlayer.css';

const tracks = [
  {
    title: 'Chakras',
    artist: 'Kanye West',
    album: 'Yandhi',
    artwork: yandhiCover,
    source: chakras
  },
  {
    title: 'Devil in a New Dress',
    artist: 'Kanye West',
    album: 'My Beautiful Dark Twisted Fantasy',
    artwork: mbdtfCover,
    source: devilInANewDress
  },
  {
    title: 'Highs and Lows',
    artist: 'Kanye West',
    album: 'Bully',
    artwork: bullyCover,
    source: highsAndLows
  },
  {
    title: 'The Storm',
    artist: 'Kanye West',
    album: 'Yandhi',
    artwork: yandhiCover,
    source: theStorm
  },
  {
    title: 'New Body',
    artist: 'Kanye West',
    album: 'Yandhi',
    artwork: yandhiCover,
    source: newBody
  },
  {
    title: 'Can U Be',
    artist: 'Kanye West',
    album: 'Vultures',
    artwork: volturesCover,
    source: canUBe
  }
];

const IPOD_FINISHES = [
  {
    id: 'silver',
    label: 'Silver',
    swatch: 'linear-gradient(145deg, #ffffff, #b8bbc1)',
    light: '#f8f8f9',
    mid: '#d7d8dc',
    bright: '#f6f6f7',
    dark: '#c4c6ca',
    edge: 'rgba(255, 255, 255, 0.88)',
    brand: '#8e9095',
  },
  {
    id: 'graphite',
    label: 'Graphite',
    swatch: 'linear-gradient(145deg, #6a6c73, #15161a)',
    light: '#606269',
    mid: '#292b30',
    bright: '#474950',
    dark: '#131419',
    edge: 'rgba(255, 255, 255, 0.22)',
    brand: '#b6b8bd',
  },
  {
    id: 'ocean',
    label: 'Ocean blue',
    swatch: 'linear-gradient(145deg, #a9c4dc, #315773)',
    light: '#9db9d1',
    mid: '#557c99',
    bright: '#779bb5',
    dark: '#2f5069',
    edge: 'rgba(220, 240, 255, 0.62)',
    brand: '#d4e5ef',
  },
  {
    id: 'cherry',
    label: 'Cherry red',
    swatch: 'linear-gradient(145deg, #f39a9e, #8e2433)',
    light: '#e98c91',
    mid: '#b84350',
    bright: '#d26770',
    dark: '#772331',
    edge: 'rgba(255, 222, 222, 0.56)',
    brand: '#ffe0df',
  },
  {
    id: 'sage',
    label: 'Sage green',
    swatch: 'linear-gradient(145deg, #ced9ba, #617653)',
    light: '#c3d0ac',
    mid: '#879b77',
    bright: '#a9b995',
    dark: '#586a4e',
    edge: 'rgba(242, 255, 227, 0.58)',
    brand: '#edf4df',
  },
  {
    id: 'lilac',
    label: 'Soft lilac',
    swatch: 'linear-gradient(145deg, #dac9e7, #73558b)',
    light: '#d4c1e1',
    mid: '#9c7db3',
    bright: '#bea5cf',
    dark: '#6d527f',
    edge: 'rgba(250, 234, 255, 0.6)',
    brand: '#f2e7f7',
  },
];

const BACKGROUND_SCENES = [
  {
    id: 'midnight',
    label: 'Midnight',
    preview: '#0d0e14',
  },
  {
    id: 'slate',
    label: 'Slate',
    preview: '#29333d',
  },
  {
    id: 'wine',
    label: 'Deep wine',
    preview: '#3c252d',
  },
  {
    id: 'moss',
    label: 'Forest moss',
    preview: '#29372f',
  },
  {
    id: 'clay',
    label: 'Muted clay',
    preview: '#493630',
  },
  {
    id: 'plum',
    label: 'Soft plum',
    preview: '#33293d',
  },
];

const formatTime = (value) => {
  if (!Number.isFinite(value) || value < 0) return '0:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const MusicPlayer = () => {
  const audioRef = useRef(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.18);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [screenVersion, setScreenVersion] = useState(0);
  const [notice, setNotice] = useState('');
  const [finishId, setFinishId] = useState('silver');
  const [backgroundId, setBackgroundId] = useState('midnight');
  const volumeTimeoutRef = useRef(null);

  const track = tracks[trackIndex];
  const selectedFinish = IPOD_FINISHES.find((finish) => finish.id === finishId) || IPOD_FINISHES[0];
  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  const remaining = Math.max(duration - currentTime, 0);

  const playlistLabel = useMemo(
    () => `${trackIndex + 1} of ${tracks.length}`,
    [trackIndex]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (tracks.length === 1) {
        audio.currentTime = 0;
        setCurrentTime(0);
        setIsPlaying(false);
        return;
      }
      selectTrack(1, true);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    if (audio.readyState >= 1) {
      handleLoadedMetadata();
      handleTimeUpdate();
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [trackIndex]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(''), 1400);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  useEffect(() => () => {
    window.clearTimeout(volumeTimeoutRef.current);
  }, []);

  const revealVolume = () => {
    setShowVolume(true);
    window.clearTimeout(volumeTimeoutRef.current);
    volumeTimeoutRef.current = window.setTimeout(() => setShowVolume(false), 1600);
  };

  const changeVolume = (amount) => {
    setIsMuted(false);
    setVolume((currentVolume) => {
      const nextVolume = Math.min(Math.max(currentVolume + amount, 0), 1);
      return nextVolume;
    });
    revealVolume();
  };

  const toggleMute = () => {
    setIsMuted((muted) => !muted);
    revealVolume();
  };

  const handleWheelVolume = (event) => {
    event.preventDefault();
    changeVolume(event.deltaY < 0 ? 0.01 : -0.01);
  };

  const handleVolumeChange = (nextPercentage) => {
    const nextVolume = Math.min(Math.max(Number(nextPercentage) / 100, 0), 1);
    setVolume(nextVolume);
    if (nextVolume > 0) setIsMuted(false);
    revealVolume();
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setNotice('Press play again');
      }
    } else {
      audio.pause();
    }
  };

  const selectTrack = (direction, keepPlaying = isPlaying) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (tracks.length === 1) {
      audio.currentTime = 0;
      setCurrentTime(0);
      setScreenVersion((version) => version + 1);
      setNotice(direction > 0 ? 'Next track' : 'Previous track');
      if (keepPlaying) audio.play().catch(() => setIsPlaying(false));
      return;
    }

    let nextIndex;
    if (isShuffle) {
      do {
        nextIndex = Math.floor(Math.random() * tracks.length);
      } while (nextIndex === trackIndex && tracks.length > 1);
    } else {
      nextIndex = (trackIndex + direction + tracks.length) % tracks.length;
    }

    setTrackIndex(nextIndex);
    setCurrentTime(0);
    setDuration(0);
    setScreenVersion((version) => version + 1);

    window.requestAnimationFrame(() => {
      const nextAudio = audioRef.current;
      if (keepPlaying && nextAudio) nextAudio.play().catch(() => setIsPlaying(false));
    });
  };

  const toggleShuffle = () => {
    setIsShuffle((value) => {
      setNotice(`Shuffle ${value ? 'Off' : 'On'}`);
      return !value;
    });
  };

  const seek = (event) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  };

  return (
    <main className="music-player-page" data-background={backgroundId} aria-label="iPod music player">
      <section
        className="ipod-classic"
        data-finish={finishId}
        style={{
          '--ipod-light': selectedFinish.light,
          '--ipod-mid': selectedFinish.mid,
          '--ipod-bright': selectedFinish.bright,
          '--ipod-dark': selectedFinish.dark,
          '--ipod-edge': selectedFinish.edge,
          '--ipod-brand': selectedFinish.brand,
        }}
        aria-label="Interactive iPod Classic"
      >
        <div className="ipod-classic__top-edge" aria-hidden="true" />

        <div className="ipod-screen">
          <div className="ipod-screen__lcd">
            <header className="ipod-screen__status">
              <span className="ipod-screen__play-state" aria-label={isPlaying ? 'Playing' : 'Paused'}>
                {isPlaying ? '▶' : 'Ⅱ'}
              </span>
              <strong>iPod</strong>
              <span className="ipod-screen__battery" aria-label="Battery full"><i /></span>
            </header>

            <div className="ipod-screen__titlebar">
              <span>Now Playing</span>
              <span>{playlistLabel}</span>
            </div>

            <div className="ipod-screen__track" key={screenVersion}>
              <div className={`ipod-screen__artwork${isPlaying ? ' is-playing' : ''}`}>
                <img src={track.artwork} alt={`${track.album} cover`} />
                <span className="ipod-screen__artwork-shine" aria-hidden="true" />
              </div>

              <div className="ipod-screen__metadata">
                <strong>{track.title}</strong>
                <span>{track.artist}</span>
                <span>{track.album}</span>
                <div className={`ipod-screen__equalizer${isPlaying ? ' is-playing' : ''}`} aria-hidden="true">
                  <i /><i /><i /><i />
                </div>
              </div>
            </div>

            <footer className="ipod-screen__progress">
              <button type="button" className="ipod-screen__progress-track" onClick={seek} aria-label="Seek in song">
                <span style={{ width: `${progress}%` }} />
              </button>
              <div>
                <time>{formatTime(currentTime)}</time>
                <time>-{formatTime(remaining)}</time>
              </div>
            </footer>

            {showVolume && (
              <div className="ipod-screen__volume" role="status">
                <div>
                  <span className={`ipod-screen__speaker${isMuted ? ' is-muted' : ''}`} aria-hidden="true"><i /></span>
                  <strong>{isMuted ? 'Muted' : 'Volume'}</strong>
                  <span>{isMuted ? 0 : Math.round(volume * 100)}%</span>
                </div>
                <span className="ipod-screen__volume-track" aria-hidden="true">
                  <i style={{ width: `${isMuted ? 0 : volume * 100}%` }} />
                </span>
              </div>
            )}

            {notice && <div className="ipod-screen__notice" role="status">{notice}</div>}
          </div>
        </div>

        <div className="ipod-classic__brand" aria-hidden="true">iPod</div>

        <div className="click-wheel" aria-label="iPod controls" onWheel={handleWheelVolume} title="Scroll to adjust volume">
          <button type="button" className="click-wheel__control click-wheel__control--menu" onClick={toggleShuffle}>
            MENU
          </button>
          <button type="button" className="click-wheel__control click-wheel__control--previous" onClick={() => selectTrack(-1)} aria-label="Previous track">
            <span aria-hidden="true">▮◀◀</span>
          </button>
          <button type="button" className="click-wheel__control click-wheel__control--next" onClick={() => selectTrack(1)} aria-label="Next track">
            <span aria-hidden="true">▶▶▮</span>
          </button>
          <button type="button" className="click-wheel__control click-wheel__control--play" onClick={togglePlayback} aria-label={isPlaying ? 'Pause' : 'Play'}>
            <span aria-hidden="true">▶ Ⅱ</span>
          </button>
          <button type="button" className="click-wheel__center" onClick={togglePlayback} aria-label={isPlaying ? 'Pause song' : 'Play song'} />
        </div>

        <div className="ipod-classic__shuffle-state" aria-live="polite">
          Shuffle {isShuffle ? 'On' : 'Off'}
        </div>

        <div className="ipod-volume-slider" role="group" aria-label="Volume controls">
          <ElasticSlider
            value={Math.round(volume * 100)}
            defaultValue={18}
            startingValue={0}
            maxValue={100}
            isStepped
            stepSize={1}
            onChange={handleVolumeChange}
            ariaLabel="Volume"
            leftIcon={(
              <button
                type="button"
                className={`ipod-volume-slider__mute${isMuted ? ' is-muted' : ''}`}
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                <span aria-hidden="true" />
              </button>
            )}
          />
        </div>
      </section>

      <aside className="music-customizer" aria-label="Customize the music player">
        <div className="music-customizer__group" role="group" aria-label="iPod finish">
          <div className="music-customizer__options">
            {IPOD_FINISHES.map((finish) => (
              <button
                type="button"
                className={`music-customizer__swatch${finish.id === finishId ? ' is-active' : ''}`}
                style={{ '--swatch-preview': finish.swatch }}
                onClick={() => setFinishId(finish.id)}
                aria-label={`${finish.label} iPod`}
                aria-pressed={finish.id === finishId}
                title={finish.label}
                key={finish.id}
              />
            ))}
          </div>
        </div>

        <div className="music-customizer__group" role="group" aria-label="Background color">
          <div className="music-customizer__options">
            {BACKGROUND_SCENES.map((scene) => (
              <button
                type="button"
                className={`music-customizer__swatch music-customizer__swatch--scene${scene.id === backgroundId ? ' is-active' : ''}`}
                style={{ '--swatch-preview': scene.preview }}
                onClick={() => setBackgroundId(scene.id)}
                aria-label={`${scene.label} background`}
                aria-pressed={scene.id === backgroundId}
                title={scene.label}
                key={scene.id}
              />
            ))}
          </div>
        </div>
      </aside>

      <audio ref={audioRef} src={track.source} preload="metadata" />
    </main>
  );
};

export default MusicPlayer;
