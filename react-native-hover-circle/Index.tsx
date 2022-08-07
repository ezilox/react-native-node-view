import React, { useState } from 'react';
import { LayoutRectangle, View, ViewStyle } from 'react-native';
import {
	Gesture,
	GestureDetector,
	GestureUpdateEvent,
	PanGestureChangeEventPayload,
	PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, {
	cancelAnimation,
	useAnimatedReaction,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';

const SIZE = 100;
const GRAVITATION = 9.8;
const SPEED_FRACTION = 0.01;

const Index: React.FC = () => {
	const [layout, setLayout] = useState<LayoutRectangle>();

	const isPanActive = useSharedValue(false);

	const velocityX = useSharedValue(0);
	const velocityY = useSharedValue(0);

	const circleX = useSharedValue(150);
	const circleY = useSharedValue(150);

	const circleScale = useSharedValue(1);

	const onPan = Gesture.Pan()
		.onChange(event => {
			isPanActive.value = true;

			const hitLeftWall = circleX.value + event.changeX < 0;
			const hitRightWall = circleX.value + event.changeX + SIZE > (layout?.width ?? 0);
			const hitTopWall = circleY.value + event.changeY < 0;
			const hitBottomWall = circleY.value + event.changeY + SIZE > (layout?.height ?? 0);

			const hitWallX = hitLeftWall || hitRightWall;
			const hitWallY = hitTopWall || hitBottomWall;

			if (!hitWallX) {
				circleX.value += event.changeX;
			}
			if (!hitWallY) {
				circleY.value += event.changeY;
			}
		})
		.onEnd(event => {
			isPanActive.value = false;

			velocityX.value = event.velocityX * SPEED_FRACTION;
			velocityX.value = withTiming(0, { duration: 1000 });

			velocityY.value = event.velocityY * SPEED_FRACTION;
			velocityY.value = withTiming(0, { duration: 1000 });
		});

	const onTap = Gesture.Tap().onStart(() => {
		if (circleScale.value === 12) {
			circleScale.value = withTiming(1, { duration: 800 });
		} else {
			circleScale.value = withTiming(12, { duration: 500 });
		}
		console.log('start');
	});

	const getDurationByVelocity = (velocity: number) => {
		'worklet';
		const endX = (-1 * Math.pow(velocity, 2)) / (2 * GRAVITATION);
		const duration = Math.abs((2 * endX) / velocity);
		return duration;
	};

	const hitHallX = () => {
		'worklet';
		cancelAnimation(velocityX);

		velocityX.value = -0.5 * velocityX.value;
		const durationX = getDurationByVelocity(velocityX.value);
		velocityX.value = withTiming(0, { duration: durationX * 1000 });
	};

	const hitHallY = () => {
		'worklet';
		cancelAnimation(velocityY);

		velocityY.value = -0.5 * velocityY.value;
		const durationY = getDurationByVelocity(velocityY.value);
		velocityY.value = withTiming(0, { duration: durationY * 1000 });
	};

	useAnimatedReaction(
		() => {
			return velocityX.value;
		},
		velocity => {
			if (isPanActive.value) return;

			if (circleX.value + velocity < 0) {
				hitHallX();
				return;
			}

			if (circleX.value + SIZE + velocity > (layout?.width ?? 0)) {
				hitHallX();
				return;
			}

			circleX.value = circleX.value + velocity;
		},
		[circleX.value, velocityX.value, isPanActive.value, layout]
	);

	useAnimatedReaction(
		() => {
			return velocityY.value;
		},
		velocity => {
			if (isPanActive.value) return;

			if (circleY.value + velocity < 0) {
				hitHallY();
				return;
			}

			if (circleY.value + SIZE + velocity > (layout?.height ?? 0)) {
				hitHallY();
				return;
			}

			circleY.value = circleY.value + velocity;
		},
		[circleY.value, velocityY.value, isPanActive.value, layout]
	);

	const animatedStyle = useAnimatedStyle<ViewStyle>(() => {
		return { top: circleY.value, left: circleX.value, transform: [{ scale: circleScale.value }] };
	});

	return (
		<View style={{ flex: 1 }} onLayout={event => setLayout(event.nativeEvent.layout)}>
			<GestureDetector gesture={Gesture.Exclusive(onPan, onTap)}>
				<Animated.View
					style={[
						{
							position: 'absolute',
							width: SIZE,
							height: SIZE,
							borderRadius: SIZE / 2,
							backgroundColor: 'black',
						},
						animatedStyle,
					]}
				/>
			</GestureDetector>
		</View>
	);
};

export default Index;
