import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutRectangle, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

interface Props {
	borderRadius?: number;
	borderWidth?: number;
	borderColor?: string;
	enabled: boolean;
	speed?: number;
}

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const BorderSnake: React.FC<Props> = ({
	borderRadius = 5,
	borderWidth = 2,
	borderColor = 'red',
	enabled,
	speed = 1,
}) => {
	const [containerLayout, setContainerLayout] = useState<LayoutRectangle>();

	const width = containerLayout ? containerLayout.width - borderWidth : 0;
	const height = containerLayout ? containerLayout.height - borderWidth : 0;
	const pathLength = width * 2 + height * 2;
	const pathDashOffsetAnim = useRef(new Animated.Value(0)).current;
	const pathOpacityAnim = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		const duration = 1000 * 60 * (1 / speed);
		if (containerLayout) {
			const animation = Animated.loop(
				Animated.sequence([
					Animated.timing(pathDashOffsetAnim, {
						toValue: 0,
						duration: 10,
						useNativeDriver: true,
						easing: Easing.linear,
					}),
					Animated.timing(pathDashOffsetAnim, {
						toValue: pathLength * 60,
						duration: duration,
						useNativeDriver: true,
						easing: Easing.linear,
					}),
				])
			);
			if (enabled) {
				Animated.timing(pathOpacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
					pathDashOffsetAnim.setValue(0);
				animation.start();
			} else {
				animation.stop();
				Animated.timing(pathOpacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
			}
		}
	}, [enabled, containerLayout]);

	return (
		<View
			onLayout={event => setContainerLayout(event.nativeEvent.layout)}
			style={{ width: '100%', height: '100%', position: 'absolute' }}>
			<Svg>
				<AnimatedRect
					x={borderWidth / 2}
					y={borderWidth / 2}
					rx={borderRadius}
					width={width}
					height={height}
					fill="none"
					strokeWidth={borderWidth}
					strokeOpacity={pathOpacityAnim}
					stroke={borderColor}
					strokeDasharray={pathLength / 2}
					strokeDashoffset={pathDashOffsetAnim}
				/>
			</Svg>
		</View>
	);
};

export default BorderSnake;
