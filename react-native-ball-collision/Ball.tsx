import React, { useImperativeHandle } from 'react';
import { ViewStyle, Image } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import LitLogo from './assets/Icon.png';

export const BALL_SIZE = 75;

interface IBall {
	size: number;
	absoluteX: SharedValue<number>;
	absoluteY: SharedValue<number>;
}

export interface IBallRef {
	moveBallTo: (x: number, y: number) => void;
}

export const Ball = React.forwardRef<IBallRef, IBall>(({ size, absoluteX, absoluteY }, ref) => {
	const onPan = Gesture.Pan().onUpdate(event => {
		absoluteX.value = event.absoluteX - size / 2;
		absoluteY.value = event.absoluteY - size / 2;
	});

	const animatedStyle = useAnimatedStyle<ViewStyle>(() => {
		return { top: absoluteY.value, left: absoluteX.value };
	});

	const moveBallTo = (x: number, y: number) => {
		absoluteX.value = withTiming(x - size / 2, { duration: 100 });
		absoluteY.value = withTiming(y - size / 2, { duration: 100 });
	};

	useImperativeHandle(ref, () => {
		return { moveBallTo: moveBallTo };
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
					overflow: 'hidden',
				}}>
				<Image style={{ width: '100%', height: '100%' }} source={LitLogo} />
			</Animated.View>
		</GestureDetector>
	);
});
