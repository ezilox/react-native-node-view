import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Dimensions, Alert } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Score from './Score';
import { Ball, BALL_SIZE } from './Ball';
import { OBSTACLE_SIZE, ObstacleMemo } from './Obstacle';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

export enum GameStatus {
	'start' = 1,
	'end' = 2,
}

const Index: React.FC = () => {
	const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.start);
	const [hadCollision, setHadCollision] = useState(false);
	const [score, setScore] = useState(0);

	const ballAbsoluteX = useSharedValue(SCREEN_WIDTH / 2 - BALL_SIZE / 2);
	const ballAbsoluteY = useSharedValue(SCREEN_HEIGHT / 2 - BALL_SIZE / 2);

	useEffect(() => {
		if (gameStatus === GameStatus.end) {
			Alert.alert('HIT!', `Your score is ${score.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, [
				{ text: 'Play Again?', onPress: resetGame },
			]);
		}
	}, [gameStatus]);

	const resetGame = () => {
		setHadCollision(false);
		setGameStatus(GameStatus.start);
	};

	const onHit = useCallback(() => {
		if (!hadCollision) {
			setGameStatus(GameStatus.end);
			setHadCollision(true);
		}
	}, [hadCollision]);

	const obstacles = useMemo(() => {
		return Array(99)
			.fill(null)
			.map((v, index) => (
				<ObstacleMemo
					key={index}
					index={index}
					onHit={onHit}
					speed={0.5}
					size={OBSTACLE_SIZE}
					ballAbsoluteX={ballAbsoluteX}
					ballAbsoluteY={ballAbsoluteY}
					gameStatus={gameStatus}
				/>
			));
	}, [gameStatus]);

	return (
		<View style={{ flex: 1 }}>
			<Score setScore={setScore} score={score} gameStatus={gameStatus} />
			<Ball size={BALL_SIZE} absoluteX={ballAbsoluteX} absoluteY={ballAbsoluteY} />
			{obstacles}
		</View>
	);
};

export default Index;
