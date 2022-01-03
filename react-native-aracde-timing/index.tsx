import React, { useEffect, useRef, useState } from 'react';
import { View, Dimensions, Modal, Animated, TouchableOpacity, Text, StyleSheet } from 'react-native';
import {
	TapGestureHandler,
	HandlerStateChangeEvent,
	TapGestureHandlerEventPayload,
	State,
} from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import Score from './Score';

const circleQuarter = 4;

const circleRadius = 140;
const circleDensityMultiplier = 4;
const circleDensity = circleQuarter * circleDensityMultiplier;
const circleSize = 25;
const circleContainerSize = 345;
const jackpotCircleSize = circleSize * 1.5;
const insideCircleSize = (circleContainerSize / 2) * 1.25;

interface Circle {
	x: number;
	y: number;
	key: string;
}

enum GameStatus {
	init = 'init',
	lose = 'lose',
	win = 'win',
}

const generateCircles = () => {
	return Array(circleDensity)
		.fill({ x: 0, y: 0 })
		.map((value, index) => {
			const x = circleRadius * Math.cos((Math.PI / (circleDensity / 2)) * index);
			const y = circleRadius * Math.sin((Math.PI / (circleDensity / 2)) * index);
			return {
				key: `${x}-${y}`,
				x: x,
				y: y,
			};
		});
};

const ArcadeGame = () => {
	const [circles, setCircles] = useState<Array<Circle>>([]);
	const [lightCircle, setLightCircle] = useState<Array<string | null>>([]);
	const [stop, setStop] = useState(false);
	const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.init);
	const [score, setScore] = useState(0);
	const timeoutRef = useRef<number>();

	const circleRotateAnim = useRef(new Animated.Value(0)).current;
	const circleRotateAnimInter = circleRotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });

	useEffect(() => {
		const tempCircles = generateCircles();
		setCircles(tempCircles);
	}, []);

	useEffect(() => {
		if (circles.length > 0 && !stop) {
			timeoutRef.current = window.setTimeout(
				() => {
					if (lightCircle.length === 0) {
						setLightCircle([circles[0].key]);
					} else {
						const currentCircleIndex = circles.findIndex(circle => lightCircle.includes(circle.key));
						if (currentCircleIndex + 1 === circles.length) {
							setLightCircle([circles[0].key]);
						} else if (currentCircleIndex !== -1) {
							setLightCircle([circles[currentCircleIndex + 1].key]);
						}
					}
				},
				score === 0 ? 200 : Math.max(200 - score * 2, 50)
			);
		}
	}, [circles, lightCircle]);

	useEffect(() => {
		if (stop === true) {
			clearTimeout(timeoutRef.current);
			const index = circles.findIndex(circle => lightCircle.includes(circle.key));
			if (index === circleDensityMultiplier * 2) {
				setGameStatus(GameStatus.win);
				setScore(score + 10);
			} else {
				setGameStatus(GameStatus.lose);
				setScore(0);
			}
		}
	}, [stop]);

	useEffect(() => {
		if (gameStatus === GameStatus.win) {
			const tempLightCircle = [...lightCircle];
			const jackpotIndex = circleDensity / 2;
			let nextIndex = jackpotIndex - (tempLightCircle.length - 1) / 2;
			if (nextIndex >= 0 && Number.isInteger(nextIndex)) {
				if (nextIndex !== 0) {
					tempLightCircle.push(circles[nextIndex].key);
					tempLightCircle.push(circles[circleDensity - nextIndex].key);
					setTimeout(() => setLightCircle(tempLightCircle), 150);
				} else {
					tempLightCircle.push(circles[0].key);
					setTimeout(() => setLightCircle(tempLightCircle), 150);
				}
			} else {
				Animated.timing(circleRotateAnim, { useNativeDriver: true, toValue: 1, duration: 250 }).start(() => {
					resetGame();
					Animated.timing(circleRotateAnim, { useNativeDriver: true, toValue: 0, duration: 250, delay: 20 }).start();
				});
			}
		}
	}, [gameStatus, lightCircle]);

	const resetGame = () => {
		setStop(false);
		setGameStatus(GameStatus.init);
		setLightCircle([]);
	};

	const renderCircles = circles.map((circle, index) => {
		const size = index === circleDensity / 2 ? jackpotCircleSize : circleSize;
		return (
			<Circle
				key={circle.key}
				isLightOn={lightCircle.includes(circle.key)}
				size={size}
				offsetX={circle.x + circleContainerSize / 2 - size / 2}
				offsetY={circle.y + circleContainerSize / 2 - size / 2}
			/>
		);
	});

	return (
		<Modal style={{ backgroundColor: '#d6d6d6' }}>
			<SafeAreaView
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'space-between',
					marginHorizontal: 8,
				}}>
				<View style={{ justifyContent: 'center', alignItems: 'center' }}>
					<Text>SCORE</Text>
					<Score score={score} />
				</View>
				<Animated.View style={{ transform: [{ rotateY: circleRotateAnimInter }] }}>
					<View
						style={{
							width: circleContainerSize,
							height: circleContainerSize,
							borderRadius: circleContainerSize / 2,
							backgroundColor: 'lightgray',
						}}>
						{renderCircles}
					</View>
					<View
						style={{
							width: insideCircleSize,
							height: insideCircleSize,
							borderRadius: insideCircleSize / 2,
							backgroundColor: 'white',
							position: 'absolute',
							top: circleContainerSize / 2 - insideCircleSize / 2,
							left: circleContainerSize / 2 - insideCircleSize / 2,
						}}
					/>
				</Animated.View>

				<StopButton gameStatus={gameStatus} setStop={setStop} resetGame={resetGame} />
				{/* <View style={{ marginTop: 20 }}>
					{gameStatus !== 'init' ? (
						<Text style={{ fontSize: 30, color: gameStatus === 'win' ? 'green' : 'red' }}>{gameStatus}</Text>
					) : (
						<Text style={{ fontSize: 30 }}> </Text>
					)}
				</View> */}
			</SafeAreaView>
		</Modal>
	);
};

interface CircleProps {
	isLightOn: boolean;
	size: number;
	offsetX: number;
	offsetY: number;
}

const Circle: React.FC<CircleProps> = ({ isLightOn, size, offsetX, offsetY }) => {
	const backgroundScaleAnim = useRef(new Animated.Value(0)).current;
	const backgroundScaleAnimInter = backgroundScaleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

	useEffect(() => {
		if (isLightOn) {
			Animated.timing(backgroundScaleAnim, { useNativeDriver: true, toValue: 1, duration: 100 }).start();
		} else {
			Animated.timing(backgroundScaleAnim, { useNativeDriver: true, toValue: 0, duration: 1000 }).start();
		}
	}, [isLightOn]);
	return (
		<View
			style={{
				borderWidth: 1,
				borderColor: '#007BAC',
				width: size,
				height: size,
				borderRadius: size / 2,
				position: 'absolute',
				bottom: offsetX,
				left: offsetY,
				backgroundColor: 'white',
			}}>
			<Animated.View
				style={{
					width: '100%',
					height: '100%',
					transform: [{ scale: backgroundScaleAnimInter }],
					backgroundColor: '#007BAC',
					borderRadius: size / 2,
				}}></Animated.View>
		</View>
	);
};

interface IStopButton {
	gameStatus: GameStatus;
	setStop: (isStopped: boolean) => void;
	resetGame: () => void;
}

const StopButton = ({ gameStatus, setStop, resetGame }: IStopButton) => {
	const buttonTranslateY = useRef(new Animated.Value(0)).current;
	const buttonTranslateYInter = buttonTranslateY.interpolate({ inputRange: [0, 1], outputRange: [0, 5] });
	const onTap = (event: HandlerStateChangeEvent<TapGestureHandlerEventPayload>) => {
		if (event.nativeEvent.state === State.ACTIVE && gameStatus !== GameStatus.win) {
			onPressAnim();
			gameStatus === 'init' ? setStop(true) : resetGame();
		}
	};
	const onPressAnim = () => {
		Animated.sequence([
			Animated.timing(buttonTranslateY, { toValue: 1, useNativeDriver: true, duration: 25 }),
			Animated.timing(buttonTranslateY, { toValue: 0, useNativeDriver: true, duration: 100, delay: 30 }),
		]).start();
	};
	return (
		<TapGestureHandler onHandlerStateChange={event => onTap(event)}>
			<View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
				<View style={{ width: 100, height: 100, alignItems: 'center', justifyContent: 'center' }}>
					<View style={[styles.stopButton, styles.stopButtonShadow]}>
						{/* <Text>{gameStatus === 'init' ? 'Press' : 'Reset'}</Text> */}
					</View>
					<Animated.View
						style={[
							styles.stopButton,
							{
								transform: [{ translateY: buttonTranslateYInter }],
							},
						]}>
						<Text>{gameStatus === GameStatus.init || gameStatus === GameStatus.win ? 'Press' : 'Reset'}</Text>
					</Animated.View>
				</View>
			</View>
		</TapGestureHandler>
	);
};

const styles = StyleSheet.create({
	stopButton: {
		width: 100,
		height: 100,
		padding: 16,
		backgroundColor: 'lightgray',
		borderRadius: 100 / 2,
		alignItems: 'center',
		justifyContent: 'center',
	},
	stopButtonShadow: {
		backgroundColor: 'rgba(128, 128, 128, 0.7)',
		position: 'absolute',
		top: 6,
		left: 1,
	},
});

export default ArcadeGame;
