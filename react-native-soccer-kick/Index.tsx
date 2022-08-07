import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Dimensions, ViewStyle, LayoutRectangle, Image, Alert } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
	cancelAnimation,
	Easing,
	interpolate,
	runOnJS,
	useAnimatedReaction,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SoccerImage from './soccer-ball.png';
import BackgroundField from './green-grass-textures.jpg';
import * as Haptics from 'expo-haptics';

const SIZE = 100;
const WALL_PADDING = SIZE * 0.1;

const Index: React.FC = () => {
	const { top, bottom } = useSafeAreaInsets();
	const [layout, setLayout] = useState<LayoutRectangle>();
	const [score, setScore] = useState(0);

	const absoluteX = useSharedValue(150);
	const absoluteY = useSharedValue(150);

	const velocityX = useSharedValue(0);
	const velocityY = useSharedValue(0);

	const ballRotation = useSharedValue(0);

	const hitX = useSharedValue(false);
	const hitY = useSharedValue(false);

	const gravitation = useSharedValue(20);
	const hitForce = useSharedValue(15);

	const freeFall = () => {
		'worklet';
		const startY = absoluteY.value;
		const endY = layout?.height ?? 0;

		const deltaY = Math.abs(endY - 2 * startY);
		const endVelocity = Math.sqrt(2 * gravitation.value * deltaY);
		const duration = Math.sqrt(deltaY / (0.5 * gravitation.value));
		velocityY.value = withTiming(endVelocity, { duration: duration * 1000, easing: Easing.linear });
	};

	useEffect(() => {
		startGame();
	}, []);

	const resetGame = () => {
		cancelAnimation(velocityX);
		cancelAnimation(velocityY);
		cancelAnimation(gravitation);
		setScore(0);

		gravitation.value = 20;

		absoluteX.value = 150;
		absoluteY.value = 150;

		velocityX.value = 0;
		velocityY.value = 0;

		hitX.value = false;
		hitY.value = false;

		startGame();
	};

	const endGameAlert = () => {
		Alert.alert(`Nice, your score is ${score}`, '', [{ text: 'play again?', onPress: resetGame }]);
	};

	const startGame = () => {
		freeFall();
		gravitation.value = withTiming(100, { duration: 40000 });
	};

	const hitHaptic = () => {
		Haptics.selectionAsync()
	};

	const hitBallY = () => {
		'worklet';
		velocityY.value = -hitForce.value;
		const duration = Math.sqrt(2 / (0.5 * gravitation.value)) * 1000;
		velocityY.value = withTiming(0, { duration: duration, easing: Easing.linear }, () => freeFall());
	};

	const hitBallX = () => {
		'worklet';
		const randomHit = Math.random() * 9 * (Math.random() > 0.5 ? 1 : -1);
		ballRotation.value = withTiming(randomHit, { duration: 1500, easing: Easing.linear });
		velocityX.value = randomHit;
		velocityX.value = withTiming(velocityX.value * 0.3, { duration: 1500, easing: Easing.linear });
		runOnJS(setScore)(score + 1);
		runOnJS(hitHaptic)()
	};

	const hitHallX = (side: 'left' | 'right') => {
		'worklet';
		cancelAnimation(velocityX);
		hitX.value = true;

		const velocity = side === 'right' ? -1 * Math.abs(velocityX.value) : Math.abs(velocityX.value);
		velocityX.value = velocity / 2;
		velocityX.value = withTiming(velocityX.value * 0.3, { duration: 1500, easing: Easing.linear });
	};

	const onTap = Gesture.Tap().onBegin(() => {
		cancelAnimation(velocityY);
		cancelAnimation(velocityX);
		hitX.value = false;
		hitY.value = false;
		hitBallY();
		hitBallX();
	});

	useAnimatedReaction(
		() => {
			return velocityY.value;
		},
		(currentVelocity, startVelocity) => {
			if (absoluteY.value <= 0 && !hitY.value) {
				hitY.value = true;
				cancelAnimation(velocityY);
				velocityY.value = -velocityY.value / 2;
				freeFall();
			}
			if (absoluteY.value > 2000) {
				cancelAnimation(velocityY);
				runOnJS(endGameAlert)();
			}

			absoluteY.value = absoluteY.value + (currentVelocity + (startVelocity ?? 0)) / 2;
		},
		[velocityY.value, absoluteY.value]
	);

	useAnimatedReaction(
		() => {
			return velocityX.value;
		},
		(currentVelocity, startVelocity) => {
			// left side x
			if (absoluteX.value - WALL_PADDING <= 0 && !hitX.value) {
				hitHallX('left');
			}

			// right side x
			if (layout && absoluteX.value + SIZE + WALL_PADDING > (layout?.width ?? 0) && !hitX.value) {
				hitHallX('right');
			}

			absoluteX.value = absoluteX.value + (currentVelocity + (startVelocity ?? 0)) / 2;
		},
		[velocityX.value, absoluteX.value, layout]
	);

	const animatedStyle = useAnimatedStyle<ViewStyle>(() => {
		const degInterpolate = interpolate(ballRotation.value, [0, 2], [0, 180]);
		return { left: absoluteX.value, top: absoluteY.value, transform: [{ rotate: `${degInterpolate}deg` }] };
	}, [layout]);

	return (
		<View
			style={{ flex: 1, marginTop: top, marginBottom: bottom, borderWidth: 2 }}
			onLayout={event => setLayout(event.nativeEvent.layout)}>
			<Image style={{ width: '100%', height: '100%', opacity: 0.7, position: 'absolute' }} source={BackgroundField} />
			<Text style={{ fontSize: 20, color: 'white', textAlign: 'center' }}>SCORE</Text>
			<Text style={{ fontSize: 20, color: 'white', textAlign: 'center' }}>{score}</Text>

			<GestureDetector gesture={onTap}>
				<Animated.View
					style={[
						{
							width: SIZE,
							height: SIZE,
							borderRadius: SIZE / 2,
							backgroundColor: 'black',
							position: 'absolute',
						},
						animatedStyle,
					]}>
					<Image style={{ width: '100%', height: '100%' }} source={SoccerImage} />
				</Animated.View>
			</GestureDetector>
		</View>
	);
};

export default Index;
