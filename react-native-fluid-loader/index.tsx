import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View, Animated, Button, LayoutRectangle, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const pathPositionsCount = 10;

const FluidLoader = ({ percent = 0.3, colors = ['red'] }) => {
	const pathValue = useRef(new Animated.Value(0)).current;
	const [containerLayout, setContainerLayout] = useState<LayoutRectangle>();
	const [pathCount, setPathCount] = useState(0);

	useEffect(() => {
		startAnimation();
	}, []);

	const generatePath = () => {
		if (!containerLayout) {
			return '';
		}
		const percentWidth = containerLayout?.width ? percent * containerLayout?.width : 0;
		const containerHeight = containerLayout?.height ? containerLayout?.height : 0;
		const midY = containerLayout?.height ? containerLayout?.height / 2 : 0;

		const pathClose = ` l0 20 l-${containerLayout.width} 0 l0 -${containerHeight + 30}`;

		const inputRanges = Array(pathPositionsCount)
			.fill(null)
			.map((value, index) => index);

		const outputRanges = Array(pathPositionsCount - 2)
			.fill(null)
			.map((value, index) => {
				const max = 0.1;
				const min = 0;
				const offset1 = Math.min(Math.max(Math.random(), min), max);
				const offset2 = Math.min(Math.max(Math.random(), min), max);

				const isIndexEven = index % 2 === 0;

				const x1Curve = percentWidth + percentWidth * offset1;
				const y1Curve = midY * offset1;
				const x2Curve = percentWidth - percentWidth * offset2;
				const y2Curve = midY - midY * offset2;

				// console.log(index, 'isIndexEven', isIndexEven);

				const x1CurveFinal = isIndexEven ? x1Curve : x2Curve;

				const x2CurveFinal = isIndexEven ? x2Curve : x1Curve;

				return (
					`M${percentWidth} 0 C ${x1CurveFinal} ${y1Curve} ${x2CurveFinal} ${y2Curve} ${percentWidth} ${containerHeight}` +
					pathClose
				);
			});

		// console.log('inputRanges', inputRanges);
		// console.log('outputRanges', outputRanges);

		return pathValue.interpolate({
			inputRange: inputRanges,
			outputRange: [
				`M${percentWidth} 0 C ${percentWidth} ${midY} ${percentWidth} ${midY} ${percentWidth} ${containerHeight}` +
					pathClose,
				...outputRanges,
				`M${percentWidth} 0 C ${percentWidth} ${midY} ${percentWidth} ${midY} ${percentWidth} ${containerHeight}` +
					pathClose,
			],
		});
	};

	const startAnimation = (value = 0) => {
		const onEndAnimation = () => (value === pathPositionsCount - 1 ? startAnimation(0) : startAnimation(value + 1));
		Animated.timing(pathValue, {
			useNativeDriver: true,
			duration: 2500,
			toValue: value,

			easing: Easing.inOut(Easing.ease),
		}).start(onEndAnimation);
	};

	const waves = colors.map((color, index) => {
		const pathValueInter = generatePath();

		return <AnimatedPath key={index} d={pathValueInter} fill={color} stroke={color} />;
	});

	return (
		<>
			<View
				onLayout={event => setContainerLayout(event.nativeEvent.layout)}
				style={{ width: '100%', height: '100%', backgroundColor: 'gray' }}>
				<Text style={{ position: 'absolute' }}>{pathCount}</Text>
				<Svg>{waves}</Svg>
			</View>
			{/* <Button title="Start" onPress={startAnimation} /> */}
		</>
	);
};

export default FluidLoader;
