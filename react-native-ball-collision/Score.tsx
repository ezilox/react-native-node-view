import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { GameStatus } from '.';
import { OBSTACLE_SPAWN_TIMEOUT } from './Obstacle';

interface IScore {
	gameStatus: GameStatus;
	score: number;
	setScore: (score: number) => void
}

const Score: React.FC<IScore> = ({ gameStatus, score, setScore }) => {
	
	const timeoutRef = useRef<NodeJS.Timeout>();

	const calculateScore = () => {
		return score === 0 ? 2 : score + 2 * (score / 10);
	};

	useEffect(() => {
		if (gameStatus === GameStatus.start) {
			timeoutRef.current = setTimeout(() => {
				const newScore = calculateScore();
				setScore(newScore);
			}, OBSTACLE_SPAWN_TIMEOUT);
		} else if (gameStatus === GameStatus.end) {
			timeoutRef.current && clearTimeout(timeoutRef.current);
			setScore(0);
		}
	}, [score, gameStatus]);
	return (
		<View style={{ paddingTop: 40, alignItems: 'center', justifyContent: 'center' }}>
			<Text style={{ fontSize: 18 }}>{score.toLocaleString('en-US', { maximumFractionDigits: 0 })}</Text>
			<Text style={{ color: 'lightgray', fontSize: 14 }}>Score</Text>
		</View>
	);
};

export default Score;
