import { useState, useEffect } from 'react';
import { Header, Segment, Icon, Message, Popup } from 'semantic-ui-react';

import GameGrid from './components/GameGrid';
import Keyboard from './components/Keyboard';
import AboutModal from './components/AboutModal';
import SolutionModal from './components/SolutionModal';
import StatsModal from './components/StatsModal';
import SettingsModal from './components/SettingsModal';

import {
  isAccessible,
  isNight,
  isWeekend,
  routesWithNoService,
  isValidGuess,
  isWinningGuess,
  updateGuessStatuses,
  flattenedTodaysTrip,
  todaysTrip,
  todaysSolution,
  getSolution,
  getPracticeTrip,
  todayGameIndex,
  NIGHT_GAMES,
} from './utils/answerValidations';

import {
  loadGameStateFromLocalStorage,
  saveGameStateToLocalStorage,
  isNewToGame
} from './utils/localStorage';

import { addStatsForCompletedGame, loadStats } from './utils/stats';

import { loadSettings } from './utils/settings';

import stations from './data/stations.json';

import './App.scss';

const ATTEMPTS = 6;
const ALERT_TIME_MS = 2000;

const App = () => {
  const [currentGuess, setCurrentGuess] = useState([]);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isGameLost, setIsGameLost] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotEnoughRoutes, setIsNotEnoughRoutes] = useState(false);
  const [isGuessInvalid, setIsGuessInvalid] = useState(false);
  const [absentRoutes, setAbsentRoutes] = useState([]);
  const [presentRoutes, setPresentRoutes] = useState([]);
  const [similarRoutes, setSimilarRoutes] = useState([]);
  const [similarRoutesIndexes, setSimilarRoutesIndexes] = useState({});
  const [correctRoutes, setCorrectRoutes] = useState([]);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [practiceTrip, setPracticeTrip] = useState(null);
  const [guesses, setGuesses] = useState(() => {
    const loaded = loadGameStateFromLocalStorage();
    if (loaded?.answer !== flattenedTodaysTrip()) {
      if (isNewToGame() && window.location === window.parent.location) {
        setIsAboutOpen(true);
      }
      return [];
    }
    const gameWasWon = loaded.guesses.map((g) => g.join('-')).includes(flattenedTodaysTrip())
    if (gameWasWon) {
      setIsGameWon(true);
      setIsSolutionsOpen(true);
    }
    if (loaded.guesses.length === 6 && !gameWasWon) {
      setIsGameLost(true)
      setIsSolutionsOpen(true);
    }
    updateGuessStatuses(loaded.guesses, setCorrectRoutes, setSimilarRoutes, setPresentRoutes, setAbsentRoutes, setSimilarRoutesIndexes);
    return loaded.guesses;
  });
  const [stats, setStats] = useState(() => loadStats());
  const [settings, setSettings] = useState(() => loadSettings());

  const currentTrip = isPracticeMode && practiceTrip ? practiceTrip : todaysTrip();
  const currentSolution = isPracticeMode && practiceTrip ? getSolution(practiceTrip) : todaysSolution();

  useEffect(() => {
    if (!isPracticeMode) {
      saveGameStateToLocalStorage({ guesses, answer: flattenedTodaysTrip() });
    }
  }, [guesses, isPracticeMode])

  const resetGameStatus = () => {
    setGuesses([]);
    setCurrentGuess([]);
    setIsGameWon(false);
    setIsGameLost(false);
    setIsSolutionsOpen(false);
    setAbsentRoutes([]);
    setPresentRoutes([]);
    setSimilarRoutes([]);
    setSimilarRoutesIndexes({});
    setCorrectRoutes([]);
  }

  const handleEnterPracticeMode = () => {
    const trip = getPracticeTrip();
    setPracticeTrip(trip);
    setIsPracticeMode(true);
    resetGameStatus();
  }

  const handleExitPracticeMode = () => {
    setIsPracticeMode(false);
    setPracticeTrip(null);
    resetGameStatus();
    // Restore daily game state from localStorage
    const loaded = loadGameStateFromLocalStorage();
    if (loaded?.answer === flattenedTodaysTrip()) {
      const gameWasWon = loaded.guesses.map((g) => g.join('-')).includes(flattenedTodaysTrip());
      setGuesses(loaded.guesses);
      if (gameWasWon) {
        setIsGameWon(true);
        setIsSolutionsOpen(true);
      } else if (loaded.guesses.length === 6) {
        setIsGameLost(true);
        setIsSolutionsOpen(true);
      }
      updateGuessStatuses(loaded.guesses, setCorrectRoutes, setSimilarRoutes, setPresentRoutes, setAbsentRoutes, setSimilarRoutesIndexes);
    }
  }

  const handleNewPracticeGame = () => {
    const trip = getPracticeTrip();
    setPracticeTrip(trip);
    resetGameStatus();
  }

  const onChar = (routeId) => {
    if (!isStatsOpen && !isGameWon && currentGuess.length < 3 && guesses.length < ATTEMPTS) {
      if (!routesWithNoService().includes(routeId)) {
        setCurrentGuess([...currentGuess, routeId]);
      }
    }
  }

  const onDelete = () => {
    if (currentGuess.length > 0) {
      setCurrentGuess(currentGuess.slice(0, currentGuess.length - 1));
    }
  }

  const onEnter = () => {
    const guessCount = guesses.length;
    if (isGameWon || isGameLost || guessCount === 6) {
      return;
    }

    if (currentGuess.length !== 3) {
      setIsNotEnoughRoutes(true);
      setTimeout(() => {
        setIsNotEnoughRoutes(false)
      }, ALERT_TIME_MS);
      return;
    }

    if (!isValidGuess(currentGuess)) {
      setIsGuessInvalid(true);
      setTimeout(() => {
        setIsGuessInvalid(false)
      }, ALERT_TIME_MS);
      return;
    }

    const winningGuess = isWinningGuess(currentGuess, currentTrip);
    const newGuesses = [...guesses, currentGuess];

    updateGuessStatuses(
      [currentGuess],
      setCorrectRoutes,
      setSimilarRoutes,
      setPresentRoutes,
      setAbsentRoutes,
      setSimilarRoutesIndexes,
      correctRoutes,
      similarRoutes,
      presentRoutes,
      absentRoutes,
      similarRoutesIndexes,
      currentTrip,
      currentSolution,
    );

    setGuesses(newGuesses);
    setCurrentGuess([]);

    if (winningGuess) {
      if (!isPracticeMode) {
        const updatedStats = addStatsForCompletedGame(stats, guessCount);
        setStats(updatedStats);
      }
      setIsGameWon(true);
      setIsSolutionsOpen(true);
      return;
    }

    if (newGuesses.length === 6) {
      if (!isPracticeMode) {
        const updatedStats = addStatsForCompletedGame(stats, guessCount + 1);
        setStats(updatedStats);
      }
      setIsGameLost(true);
      setIsSolutionsOpen(true);
    }
  }

  const onSolutionsClose = () => {
    setIsSolutionsOpen(false);
  }

  const onStatsClose = () => {
    setIsStatsOpen(false);
  }

  const onAboutClose = () => {
    setIsAboutOpen(false);
  }

  const onSettingsClose = () => {
    setIsSettingsOpen(false);
  }

  const handleStatsOpen = () => {
    if (isPracticeMode) return;
    if (isGameWon || isGameLost) {
      setIsSolutionsOpen(true);
    } else {
      setIsStatsOpen(true);
    }
  }

  const handleSettingsOpen = () => {
    setIsSettingsOpen(true);
  }

  const handleAboutOpen = () => {
    setIsAboutOpen(true);
  }

  const isDarkMode = (NIGHT_GAMES.includes(todayGameIndex())) || (todayGameIndex() > Math.max(...NIGHT_GAMES) && settings.display.darkMode);

  return (
    <div className={"outer-app-wrapper " + (isDarkMode ? 'dark' : '')}>
      <Segment basic className='app-wrapper' inverted={isDarkMode}>
        <Segment clearing basic className='header-wrapper' inverted={isDarkMode}>
          <Header floated='left'>
            {isNight && "Late Night "}
            {(!isNight && isWeekend) && "Weekend "}Subwaydle
            {isAccessible && " ♿️"}
            {isPracticeMode && " — Practice"}
            {
               isNight &&
               <Popup
               position='bottom center'
                 trigger={
                   <sup>[?]</sup>
                 }
               >
               <Popup.Content>
                 <p>Subwaydle now available in Dark Mode!</p>
                 <p>Try solving this weekend's Subwaydle with late night routing patterns.</p>
               </Popup.Content>
               </Popup>
             }
          </Header>
          <Icon className='float-right' inverted={isDarkMode} name='cog' size='large' link onClick={handleSettingsOpen} />
          { !isPracticeMode &&
            <Icon className='float-right' inverted={isDarkMode} name='chart bar' size='large' link onClick={handleStatsOpen} />
          }
          <Icon className='float-right' inverted={isDarkMode} name='question circle outline' size='large' link onClick={handleAboutOpen} />
          <Icon
            className='float-right'
            inverted={isDarkMode}
            name={isPracticeMode ? 'calendar' : 'play circle'}
            size='large'
            link
            onClick={isPracticeMode ? handleExitPracticeMode : handleEnterPracticeMode}
            title={isPracticeMode ? 'Back to Daily Game' : 'Practice Mode'}
          />
        </Segment>
        { !isAccessible &&
          <Header as='h5' textAlign='center' className='hint'>Travel from {stations[currentSolution.origin].name} to {stations[currentSolution.destination].name} using 2 transfers.</Header>
        }
        { isAccessible &&
          <Header as='h5' textAlign='center' className='hint'>Travel from {stations[currentSolution.origin].name} ♿️ to {stations[currentSolution.destination].name} ♿️ using 2 acceessible transfers.</Header>
        }
        <Segment basic className='game-grid-wrapper'>
          {
            isNotEnoughRoutes &&
            <Message negative floating attached='top'>
              <Message.Header>Not enough trains for the trip</Message.Header>
            </Message>
          }
          {
            isGuessInvalid &&
            <Message negative>
              <Message.Header>Not a valid trip</Message.Header>
            </Message>
          }
          <GameGrid
            isDarkMode={isDarkMode}
            currentGuess={currentGuess}
            guesses={guesses}
            attempts={ATTEMPTS}
            inPlay={!isGameWon && !isGameLost && guesses.length < 6}
            trip={currentTrip}
            solution={currentSolution}
          />
        </Segment>
        <Segment basic>
          <Keyboard
            noService={routesWithNoService()}
            isDarkMode={isDarkMode}
            onChar={onChar}
            onDelete={onDelete}
            onEnter={onEnter}
            correctRoutes={correctRoutes}
            similarRoutes={similarRoutes}
            presentRoutes={presentRoutes}
            absentRoutes={absentRoutes}
          />
        </Segment>
        <AboutModal open={isAboutOpen} isDarkMode={isDarkMode} handleClose={onAboutClose} />
        <SolutionModal
          open={isSolutionsOpen}
          isDarkMode={isDarkMode}
          isGameWon={isGameWon}
          handleModalClose={onSolutionsClose}
          stats={stats}
          guesses={guesses}
          trip={currentTrip}
          solution={currentSolution}
          isPracticeMode={isPracticeMode}
          onNewPracticeGame={handleNewPracticeGame}
        />
        <StatsModal open={isStatsOpen} isDarkMode={isDarkMode} stats={stats} handleClose={onStatsClose} />
        <SettingsModal open={isSettingsOpen} isDarkMode={isDarkMode} handleClose={onSettingsClose} onSettingsChange={setSettings} />
      </Segment>
    </div>
  );
}

export default App;
