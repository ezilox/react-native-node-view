import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Dimensions, Alert, ImageBackground, StatusBar } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Score from './Score';
import { Ball, BALL_SIZE, IBallRef } from './Ball';
import { OBSTACLE_SIZE, ObstacleMemo } from './Obstacle';
import Background from './assets/background-space.jpg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

export enum GameStatus {
	'start' = 1,
	'end' = 2,
}

const Index: React.FC = () => {
	const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.start);
	const [hadCollision, setHadCollision] = useState(false);
	const [score, setScore] = useState(0);
	const ballRef = useRef<IBallRef>(null);

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

	const moveBallTo = (x: number, y: number) => {
		ballRef.current?.moveBallTo && ballRef.current?.moveBallTo(x, y);
	};

	const onTap = Gesture.Tap()
		.runOnJS(true)
		.onStart(event => {
			// console.log('event', event);

			moveBallTo(event.absoluteX, event.absoluteY);
		});

	return (
		<GestureDetector gesture={onTap}>
			<ImageBackground source={Background} style={{ flex: 1 }}>
				<Score setScore={setScore} score={score} gameStatus={gameStatus} />
				<Ball ref={ballRef} size={BALL_SIZE} absoluteX={ballAbsoluteX} absoluteY={ballAbsoluteY} />
				{obstacles}
				<StatusBar barStyle={'light-content'} />
			</ImageBackground>
		</GestureDetector>
	);
};

export default Index;
