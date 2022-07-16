import React from 'react';
import { ViewStyle } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export const BALL_SIZE = 75;


interface IBall {
	size: number;
	absoluteX: SharedValue<number>;
	absoluteY: SharedValue<number>;
}

export const Ball: React.FC<IBall> = ({ size, absoluteX, absoluteY }) => {
	const onPan = Gesture.Pan().onUpdate(event => {
		absoluteX.value = event.absoluteX - size / 2;
		absoluteY.value = event.absoluteY - size / 2;
	});

	const animatedStyle = useAnimatedStyle<ViewStyle>(() => {
		return { top: absoluteY.value, left: absoluteX.value };
	});

	return (
		<GestureDetector gesture={onPan}>
			<Animated.View
				animatedProps={animatedStyle}
				style={{
					backgroundColor: 'blue',
					width: size,
					height: size,
					borderRadius: size / 2,
					position: 'absolute',
				}}
			/>
		</GestureDetector>
	);
};
