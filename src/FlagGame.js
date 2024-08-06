import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FlagGame = () => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [userGuess, setUserGuess] = useState('');
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Fetch country data on component mount
    axios.get('https://countriesnow.space/api/v0.1/countries/flag/images')
      .then(response => {
        setCountries(response.data.data);
        selectRandomCountry(response.data.data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const selectRandomCountry = (countries) => {
    // Select a random country from the list
    const randomIndex = Math.floor(Math.random() * countries.length);
    setSelectedCountry(countries[randomIndex]);
  };

  const handleGuess = () => {
    if (userGuess === selectedCountry.name) {
      setScore(prevScore => prevScore + 10);
    } else {
      setScore(prevScore => prevScore - 1);
    }
    setUserGuess('');
    selectRandomCountry(countries);
  };

  return (
    <div>
      <h1>Guess the Country</h1>
      {selectedCountry && (
        <div>
          <img src={selectedCountry.flag} alt={`Flag of ${selectedCountry.name}`} />
          <p>Country Name: <strong>{selectedCountry.name}</strong></p>
        </div>
      )}
      <input 
        type="text" 
        value={userGuess}
        onChange={(e) => setUserGuess(e.target.value)}
        placeholder="Enter country name" 
      />
      <button onClick={handleGuess}>Submit Guess</button>
      <p>Score: {score}</p>
    </div>
  );
};

export default FlagGame;
