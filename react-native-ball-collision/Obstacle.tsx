import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, ViewStyle, Image } from 'react-native';
import Animated, {
	cancelAnimation,
	Easing,
	runOnJS,
	SharedValue,
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
	withRepeat,
	withSequence,
	withSpring,
	withTiming,
} from 'react-native-reanimated';
import { GameStatus } from '.';
import { BALL_SIZE } from './Ball';
import { getDistanceBetweenPoints, getRandomValueBetweenRange } from './utils';
import ObstacleImage from './assets/mine.png';

export const OBSTACLE_SIZE = 30;
export const OBSTACLE_SPAWN_TIMEOUT = 3000;

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

interface IObstacle {
	size: number;
	ballAbsoluteX: SharedValue<number>;
	ballAbsoluteY: SharedValue<number>;
	speed: number;
	onHit: () => void;
	index: number;
	gameStatus: GameStatus;
}

const getObstacleRandomX = () => {
	const startX = getRandomValueBetweenRange(0, SCREEN_WIDTH - OBSTACLE_SIZE);
	const endX = getRandomValueBetweenRange(0, SCREEN_WIDTH - OBSTACLE_SIZE);

	return { startX, endX };
};

const getObstacleRandomY = () => {
	const startY = getRandomValueBetweenRange(0, SCREEN_HEIGHT - OBSTACLE_SIZE);
	const endY = getRandomValueBetweenRange(0, SCREEN_HEIGHT - OBSTACLE_SIZE);

	return { startY, endY };
};

export const Obstacle: React.FC<IObstacle> = ({
	size,
	ballAbsoluteX,
	ballAbsoluteY,
	speed,
	onHit,
	index,
	gameStatus,
}) => {
	const [isSpawned, setIsSpawned] = useState(false);
	const [isCollidable, setIsCollidable] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout>();
	const timeoutCollidableRef = useRef<NodeJS.Timeout>();
	const { startX, endX } = useMemo(() => getObstacleRandomX(), [gameStatus]);
	const { startY, endY } = useMemo(() => getObstacleRandomY(), [gameStatus]);

	const obstacleDuration = 1000 / speed - index * 50;

	const obstacleAbsoluteX = useSharedValue(startX);
	const obstacleAbsoluteY = useSharedValue(startY);

	const spawnAnimValue = useSharedValue(0);

	const spawnAnimation = () => {
		spawnAnimValue.value = withTiming(1, {duration: OBSTACLE_SPAWN_TIMEOUT, easing: Easing.bounce});
	};

	const startSpawnCountdown = () => {
		timeoutRef.current = setTimeout(() => {
			setIsSpawned(true);
		}, index * OBSTACLE_SPAWN_TIMEOUT);

		timeoutCollidableRef.current = setTimeout(() => {
			setIsCollidable(true);
		}, index * OBSTACLE_SPAWN_TIMEOUT + OBSTACLE_SPAWN_TIMEOUT);
	};

	useEffect(() => {
		if (gameStatus === GameStatus.start) {
			startSpawnCountdown();
		} else if (gameStatus === GameStatus.end) {
			stopAnimation();
			timeoutRef.current && clearTimeout(timeoutRef.current);
			timeoutCollidableRef.current && clearTimeout(timeoutCollidableRef.current);
			setIsSpawned(false);
			setIsCollidable(false);
		}
	}, [gameStatus]);

	useEffect(() => {
		if (isSpawned) {
			horizontalAnimation();
			verticalAnimation();
			spawnAnimation();
		}
	}, [isSpawned]);

	const stopAnimation = () => {
		'worklet';
		cancelAnimation(obstacleAbsoluteX);
		cancelAnimation(obstacleAbsoluteY);
		cancelAnimation(spawnAnimValue);

		spawnAnimValue.value = 0;
	};

	const horizontalAnimation = () => {
		'worklet';
		obstacleAbsoluteX.value = startX;
		obstacleAbsoluteX.value = withRepeat(
			withSequence(
				withTiming(ballAbsoluteX.value, { duration: obstacleDuration }),
				withTiming(startX, { duration: obstacleDuration })
			),
			100
		);
	};

	const verticalAnimation = () => {
		'worklet';
		obstacleAbsoluteY.value = startY;
		obstacleAbsoluteY.value = withRepeat(
			withSequence(
				withTiming(ballAbsoluteY.value, { duration: obstacleDuration }),
				withTiming(startY, { duration: obstacleDuration })
			),
			100
		);
	};

	useDerivedValue(() => {
		if (!isSpawned || gameStatus === GameStatus.end || !isCollidable) {
			return;
		}
		const ballPositionX = parseInt((ballAbsoluteX.value + BALL_SIZE / 2).toFixed(0));
		const ballPositionY = parseInt((ballAbsoluteY.value + BALL_SIZE / 2).toFixed(0));
		const obstaclePositionX = parseInt((obstacleAbsoluteX.value + OBSTACLE_SIZE / 2).toFixed(0));
		const obstaclePositionY = parseInt((obstacleAbsoluteY.value + OBSTACLE_SIZE / 2).toFixed(0));
		const distance = getDistanceBetweenPoints(ballPositionX, ballPositionY, obstaclePositionX, obstaclePositionY);

		if (distance < BALL_SIZE / 2 + OBSTACLE_SIZE / 2) {
			runOnJS(onHit)();
		}
	}, [ballAbsoluteX.value, obstacleAbsoluteX.value, isSpawned]);

	const animatedStyle = useAnimatedStyle<ViewStyle>(() => {
		return {
			left: obstacleAbsoluteX.value,
			top: obstacleAbsoluteY.value,
			opacity: spawnAnimValue.value,
			transform: [{ scale: spawnAnimValue.value }],
		};
	}, [obstacleAbsoluteX, obstacleAbsoluteY, spawnAnimValue]);

	return isSpawned ? (
		<Animated.View
			style={{ width: size, height: size, borderRadius: size / 2, position: 'absolute' }}
			animatedProps={animatedStyle}>
			<Image style={{ width: '100%', height: '100%' }} source={ObstacleImage} />
		</Animated.View>
	) : null;
};

export const ObstacleMemo = React.memo(Obstacle);
