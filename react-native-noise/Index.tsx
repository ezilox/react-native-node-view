import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutRectangle, View, Text, ViewStyle, Animated, Easing } from 'react-native';
import { createNoise3D } from 'simplex-noise';
import { Canvas, Rect, FractalNoise, Skia, Shader, Fill, vec } from '@shopify/react-native-skia';

const noiseDistance = 0.05;
const rectSize = 1;
const WIDTH = 100;
const HEIGHT = 100;

const noise3D = createNoise3D();

const Index: React.FC = () => {
	const time = useRef(new Animated.Value(0)).current;
	const [timeline, setTimeline] = useState(0);

	useEffect(() => {
		// time.removeAllListeners();
		// time.addListener(event => {
		// 	setTimeline(event.value);
		// });
	}, []);

	useEffect(() => {
		setTimeout(() => {
			Animated.timing(time, { toValue: 100, useNativeDriver: true, duration: 10000 }).start();
		}, 2000);
	});

	const widthRectCount = Math.floor(WIDTH / rectSize);
	const heightRectCount = Math.floor(HEIGHT / rectSize);

	const rects = Array(heightRectCount)
		.fill(null)
		.map((v, yIndex) => {
			return Array(widthRectCount)
				.fill(null)
				.map((v, xIndex) => {
					return <RectNoise key={`${yIndex}-${xIndex}`} x={xIndex * rectSize} y={yIndex * rectSize} time={time} />;
				});
		});

	return (
		<Canvas style={{ flex: 1 }}>
			{/* <Fill color="white" /> */}
			<Rect x={0} y={0} width={256} height={256}>
				<FractalNoise  freqX={0.05} tileHeight={100} tileWidth={100} freqY={0.05} octaves={1} />
			</Rect>
		</Canvas>
	);
};

interface IRectNoise {
	x: number;
	y: number;
	time: Animated.Value;
}

const RectNoise: React.FC<IRectNoise> = ({ x, y, time }) => {
	const opacity = useRef(
		new Animated.Value(noise3D(x * rectSize * noiseDistance, y * rectSize * noiseDistance, 0))
	).current;

	useEffect(() => {
		time.addListener(event => {
			opacity.setValue(noise3D(x * rectSize * noiseDistance, y * rectSize * noiseDistance, event.value));
		});
	});

	return (
		<Animated.View
			style={[
				{
					backgroundColor: 'black',
					position: 'absolute',
					width: rectSize,
					height: rectSize,
					left: x,
					top: y,
					opacity: opacity,
				},
			]}></Animated.View>
	);
};

export default Index;
