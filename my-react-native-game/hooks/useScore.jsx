import { useCallback, useEffect, useState } from 'react';

export const useScore = (level) => {
    const [tries, setTries] = useState(0);
    const [currentLevelScore, setCurrentLevelScore] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [levelScores, setLevelScores] = useState([]);
    const [rating, setRating] = useState('S++');

    const calculateScore = useCallback((trs) => {
        const baseScore = 100;
        const penalty = trs * 10;
        return Math.max(baseScore - penalty, 0);
    }, []);

    const calculateRating = (trs) => {
        if (trs === 0 || trs === 1) return 'S++';
        if (trs === 2) return 'S+';
        if (trs === 3) return 'S';
        if (trs <= 5) return 'A';
        if (trs <= 7) return 'B';
        if (trs <= 10) return 'C';
        if (trs <= 15) return 'D';
        return 'F';
    };

    const incrementTries = useCallback(() => {
        setTries((prev) => prev + 1);
    }, []);

    const resetTries = useCallback(() => {
        setTries(0);
    }, []);

    const completeLevel = useCallback(() => {
        const newScore = calculateScore(tries);

        setTotalScore((prevTotal) => prevTotal + newScore);
        setLevelScores((prevScores) => [...prevScores, newScore]);

        resetTries();
        setCurrentLevelScore(0);
    }, [tries, calculateScore, resetTries]);

    const resetScores = useCallback(() => {
        console.log('RESET');
        setTries(0);
        setCurrentLevelScore(0);
        setTotalScore(0);
        setLevelScores([]);
        setRating('S++');
    }, []);

    useEffect(() => {
        const newScore = calculateScore(tries);
        const newRating = calculateRating(tries);
        setCurrentLevelScore(newScore);
        setRating(newRating);
    }, [level, tries, calculateScore]);

    return {
        completeLevel,
        currentLevelScore,
        incrementTries,
        levelScores,
        rating,
        resetScores,
        resetTries,
        totalScore,
        tries
    };
};

export default useScore;
