import React, { useEffect, useRef, useState } from 'react';
import { View, Dimensions, Modal, Animated, TouchableOpacity, Text, StyleSheet } from 'react-native';
import {
	TapGestureHandler,
	HandlerStateChangeEvent,
	TapGestureHandlerEventPayload,
	State,
} from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: ScreenWidth, height: ScreenHeight } = Dimensions.get('screen');

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
	const timeoutRef = useRef<number>();

	useEffect(() => {
		const tempCircles = generateCircles();
		setCircles(tempCircles);
	}, []);

	useEffect(() => {
		if (circles.length > 0 && !stop) {
			timeoutRef.current = window.setTimeout(() => {
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
			}, 200);
		}
	}, [circles, lightCircle]);

	useEffect(() => {
		if (stop === true) {
			clearTimeout(timeoutRef.current);
			const index = circles.findIndex(circle => lightCircle.includes(circle.key));
			if (index === circleDensityMultiplier * 2) {
				setGameStatus(GameStatus.win);
			} else {
				setGameStatus(GameStatus.lose);
			}
		}
	}, [stop]);

  // needs to put here useEffect
	const lightCircleAnimation = () => {
		const jackpotIndex = circleDensity / 2;
		const tempLightCircle = [...lightCircle];
		Array(jackpotIndex - 1)
			.fill(null)
			.map((value, index) => {
				const offset = index + 1;
				const firstIndex = jackpotIndex - offset;
				const secondIndex = jackpotIndex + offset;

				console.log('tempLightCircle', tempLightCircle);

				setTimeout(() => {
					tempLightCircle.push(circles[firstIndex].key, circles[secondIndex].key);
					setLightCircle(tempLightCircle);
				}, 200 * offset);

				console.log('setting index', jackpotIndex - offset, 'and', jackpotIndex + offset);
			});
		console.log(circleDensity);
	};
	console.log();

	const resetGame = () => {
		lightCircleAnimation();
		// setStop(false);
		// setLightCircle([]);
		// setGameStatus(GameStatus.init);
	};

	const renderCircles = circles.map((circle, index) => {
		const size = index === circleDensity / 2 ? jackpotCircleSize : circleSize;
		return (
			<View
				key={circle.key}
				style={{
					backgroundColor: lightCircle.includes(circle.key) ? '#007BAC' : 'white',
					borderWidth: 1,
					borderColor: '#007BAC',
					width: size,
					height: size,
					borderRadius: size / 2,
					position: 'absolute',
					bottom: circle.x + circleContainerSize / 2 - size / 2,
					left: circle.y + circleContainerSize / 2 - size / 2,
				}}
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
				<View></View>
				<View>
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
				</View>

				<StopButton gameStatus={gameStatus} setStop={setStop} resetGame={resetGame} />
				<View style={{ marginTop: 20 }}>
					{gameStatus !== 'init' ? (
						<Text style={{ fontSize: 30, color: gameStatus === 'win' ? 'green' : 'red' }}>{gameStatus}</Text>
					) : (
						<Text style={{ fontSize: 30 }}> </Text>
					)}
				</View>
			</SafeAreaView>
		</Modal>
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
		if (event.nativeEvent.state === State.ACTIVE) {
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
						<Text>{gameStatus === 'init' ? 'Press' : 'Reset'}</Text>
					</View>
					<Animated.View
						style={[
							styles.stopButton,
							{
								transform: [{ translateY: buttonTranslateYInter }],
							},
						]}>
						<Text>{gameStatus === 'init' ? 'Press' : 'Reset'}</Text>
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
