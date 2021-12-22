import React, {useRef, useEffect, useState} from 'react';
import {View, Animated} from 'react-native';
import { Svg, Circle} from 'react-native-svg';
import {
	HandlerStateChangeEvent,
	State,
	TapGestureHandlerEventPayload,
	PanGestureHandler, GestureEvent, PanGestureHandlerEventPayload
} from 'react-native-gesture-handler';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Slice {
	id: number;
	color: string;
	size: number;
}

const slices = [
	{id: 1, color: '#292C6D', size: 100 / 3},
	{id: 3, color: '#EC255A', size: 100 / 3},
	{id: 2, color: '#eec4da', size: 100 / 3,},
	// {id: 4, color: 'cyan', size: 30},
	// {id: 5, color: 'white', size: 30},
];

const pointLocation = (x: number, y: number) => {
	const radius = Math.sqrt(Math.pow((x), 2) + Math.pow((y), 2));
	switch (true) {
		case (x < 0 && y > 0):
			return 1 + 1 - (y) / radius;
		case (x <= 0 && y <= 0):
			return 2 - ((y) / radius);
		case (x >= 0 && y <= 0):
			return 4 + (((y) / radius));
		default:
			return (y) / radius;
	}
}

const insideSlice = (panOffset: number, startOffset: number, endOffset: number) => {
	panOffset = panOffset < 0 ? -panOffset : panOffset;
	startOffset = startOffset < 0 ? startOffset : startOffset;
	endOffset = endOffset < 0 ? endOffset : endOffset;
	return panOffset > startOffset && panOffset < endOffset;
}

const DrawPieChart = () => {
	const radius = 50;
	const [offsetXTest, setOffsetXTest] = useState<number | null>(null)
	const [offsetYTest, setOffsetYTest] = useState<number | null>(null)


	const onPanRelease = (event: HandlerStateChangeEvent<TapGestureHandlerEventPayload>) => {

		if (event.nativeEvent.state === State.END) {
			setOffsetYTest(null)
			setOffsetXTest(null)
		}
	}

	const onPan = (event: GestureEvent<PanGestureHandlerEventPayload>) => {
		if (event.nativeEvent.state === State.ACTIVE) {
			setOffsetXTest(Number(event.nativeEvent.x.toFixed(0)));
			setOffsetYTest(Number(event.nativeEvent.y.toFixed(0)));
		}
	}

	return (
		<PanGestureHandler onGestureEvent={event => onPan(event)} onHandlerStateChange={event => onPanRelease(event)}>
			<View >
				<Svg height="300" width="300">
					{slices.map((slice, index) => <Slice key={slice.id} slice={slice} slices={slices} index={index} radius={radius}
																							 offsetXTest={offsetXTest} offsetYTest={offsetYTest}/>)}
				</Svg>
			</View>
		</PanGestureHandler>
	);
};

interface ISlice {
	slices: Array<Slice>
	slice: Slice;
	radius: number;
	index: number;
	offsetXTest: number | null
	offsetYTest: number | null
}

const Slice: React.FC<ISlice> = ({slice, slices, radius, index, offsetXTest, offsetYTest}) => {
	const [isTouched, setIsTouched] = useState(false);
	const twiceRadius = radius * 2;
	const offsetAnimatedValue = useRef(new Animated.Value(1)).current;
	const opacityAnimatedValue = useRef(new Animated.Value(0)).current;
	const offset = slices
		.slice(index + 1)
		.reduce((previousValue, currentValue) => previousValue + currentValue.size, 0);

	const x = twiceRadius * Math.cos(2 * Math.PI * ((offset + slice.size / 2) / 100));
	const y = twiceRadius * Math.sin(2 * Math.PI * ((offset + slice.size / 2) / 100));


	useEffect(() => {
		if (offsetXTest && offsetYTest) {
			const startX = Math.cos(2 * Math.PI * ((offset + slice.size) / 100));
			const startY = Math.sin(2 * Math.PI * ((100 - offset - slice.size) / 100));

			const endX = Math.cos(2 * Math.PI * ((offset) / 100));
			const endY = Math.sin(2 * Math.PI * ((100 - offset) / 100));

			const panLocation = pointLocation(offsetXTest - 150, 150 - offsetYTest);
			const startLocation = pointLocation(startX, startY);
			const endLocation = pointLocation(endX, endY);
			const isInside = insideSlice(panLocation, index === 0 ? 0 : startLocation, endLocation);
			setIsTouched(isInside)

		} else {
			setIsTouched(false)

		}
	}, [offsetXTest, offsetYTest])

	const offsetAnimatedValueInterX = offsetAnimatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [150, 150 + x * (0.1 - slice.size / 1500)],
	});
	const offsetAnimatedValueInterY = offsetAnimatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [150, 150 + y * (0.1 - slice.size / 1500)],
	});
	useEffect(() => {
		Animated.timing(opacityAnimatedValue, {
			useNativeDriver: true,
			duration: 600,
			toValue: 1
		}).start();
	}, [])
	useEffect(() => {
		if (isTouched) {
			Animated.timing(offsetAnimatedValue, {
				useNativeDriver: true,
				duration: 200,
				toValue: 1
			}).start();
		} else {
			Animated.timing(offsetAnimatedValue, {
				useNativeDriver: true,
				duration: 400,
				toValue: 0
			}).start();
		}

	}, [isTouched]);

	return (
		<AnimatedCircle
			opacity={opacityAnimatedValue}
			scale={1}
			key={slice.id}
			r={radius}
			cx={offsetAnimatedValueInterX}
			cy={offsetAnimatedValueInterY}
			stroke={slice.color}
			strokeWidth={twiceRadius}
			strokeDashoffset={(-offset * (Math.PI * twiceRadius)) / 100}
			strokeDasharray={`${(slice.size * (Math.PI * twiceRadius)) / 100} ${Math.PI * twiceRadius}`}
		/>
	);
}

export default DrawPieChart;
