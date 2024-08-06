import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Helper function to get random integer between min and max
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const FlagGame = () => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [userGuess, setUserGuess] = useState('');
  const [score, setScore] = useState(0);
  const [hints, setHints] = useState([]);
  const [timer, setTimer] = useState(15);
  const [playerName, setPlayerName] = useState('');
  const [highScores, setHighScores] = useState([]);
  
  const timerRef = useRef(null);

  useEffect(() => {
    // Fetch country data on component mount
    axios.get('https://countriesnow.space/api/v0.1/countries/flag/images')
      .then(response => {
        setCountries(response.data.data);
        selectRandomCountry(response.data.data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    if (timer > 0 && selectedCountry) {
      timerRef.current = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      handleTimeout();
    }

    return () => clearInterval(timerRef.current);
  }, [timer, selectedCountry]);

  const selectRandomCountry = (countries) => {
    const randomIndex = Math.floor(Math.random() * countries.length);
    setSelectedCountry(countries[randomIndex]);
    setHints([]);
    setTimer(15); // Reset the timer
  };

  const handleGuess = () => {
    if (selectedCountry) {
      const trimmedGuess = userGuess.trim().toLowerCase();
      const correctAnswer = selectedCountry.name.toLowerCase();

      if (trimmedGuess === correctAnswer) {
        setScore(prevScore => Math.max(prevScore + timer, 0)); // Ensure score does not go below 0
      } else {
        setScore(prevScore => Math.max(prevScore - 1, 0)); // Ensure score does not go below 0
      }

      setUserGuess('');
      selectRandomCountry(countries);
    }
  };

  const handleTimeout = () => {
    // Automatically handle timeout
    setScore(prevScore => Math.max(prevScore - 5, 0)); // Deduct points on timeout, ensuring score does not go below 0
    setUserGuess('');
    selectRandomCountry(countries);
  };

  const provideHint = () => {
    if (!selectedCountry || hints.length >= selectedCountry.name.length) return;

    const name = selectedCountry.name.toLowerCase();
    const availableIndices = name.split('').map((letter, index) => ({
      letter,
      index,
    })).filter(({ index }) => !hints.includes(index));

    if (availableIndices.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableIndices.length);
      const { index } = availableIndices[randomIndex];
      setHints([...hints, index]);
      setTimer(prevTimer => Math.max(prevTimer - 2, 0)); // Reduce timer by 2 seconds
    }
  };

  const displayHint = () => {
    if (!selectedCountry) return '';
    return selectedCountry.name.split('').map((letter, index) => {
      return hints.includes(index) ? letter : '_';
    }).join(' ');
  };

  const handleNameChange = (e) => {
    setPlayerName(e.target.value);
  };

  const saveScore = () => {
    if (playerName) {
      const newScore = { name: playerName, score: score };
      const storedScores = JSON.parse(localStorage.getItem('highScores')) || [];
      storedScores.push(newScore);
      storedScores.sort((a, b) => b.score - a.score); // Sort by score descending
      localStorage.setItem('highScores', JSON.stringify(storedScores.slice(0, 10))); // Keep top 10 scores
      setHighScores(storedScores);
      setPlayerName('');
      setScore(0);
      selectRandomCountry(countries);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center', padding: '20px' }}>
      <h1>Adivina el nombre del pais:</h1>
      {selectedCountry && (
        <div>
          <img
            src={selectedCountry.flag}
            alt="Country flag"
            style={{ width: '200px', height: 'auto', border: '1px solid #ccc', borderRadius: '8px' }}
          />
        </div>
      )}
      <p style={{ fontSize: '20px', marginTop: '20px' }}>
      Adivina el nombre del pais: {displayHint()}
      </p>
      <input 
        type="text" 
        value={userGuess}
        onChange={(e) => setUserGuess(e.target.value)}
        placeholder="Enter country name" 
        style={{ padding: '10px', fontSize: '16px', margin: '10px 0' }}
      />
      <button onClick={handleGuess} style={buttonStyle}>Adivina</button>
      <button onClick={provideHint} style={buttonStyle}>Pista</button>
      <p>Puntaje: {score}</p>
      <p>Tiempo restante: {timer}s</p>
      <input 
        type="text"
        value={playerName}
        onChange={handleNameChange}
        placeholder="Enter your name"
        style={{ padding: '10px', fontSize: '16px', margin: '10px 0' }}
      />
      <button onClick={saveScore} style={buttonStyle}>Guardar resultado</button>
      <h2>Resultados mas altos:</h2>
      <ul style={{ listStyleType: 'none', padding: '0' }}>
        {highScores.map((score, index) => (
          <li key={index} style={{ margin: '5px 0', fontSize: '18px' }}>
            {score.name}: {score.score}
          </li>
        ))}
      </ul>
    </div>
  );
};

const buttonStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  margin: '10px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

export default FlagGame;
