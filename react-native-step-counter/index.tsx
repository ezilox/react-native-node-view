import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, LayoutRectangle, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
	stepsCount: number;
	currentStep: number;
	circleFillColor: string;
	circleEmptyColor: string;
	pathColor: string;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const StepCounter: React.FC<Props> = ({ stepsCount, currentStep, circleFillColor, circleEmptyColor, pathColor }) => {
	const [containerLayout, setContainerLayout] = useState<LayoutRectangle>();
	const pathAnim = useRef(new Animated.Value(0)).current;

	const circleRadius = containerLayout ? containerLayout?.height * 0.15 : 0;
	const circleDiameter = circleRadius * 2;
	const middleHeight = containerLayout ? containerLayout.height / 2 : 0;

	const offset = useMemo(() => {
		if (!containerLayout) return 0;
		const width = containerLayout.width;
		const itemsWidth = stepsCount * circleDiameter;
		const freeSpace = width - itemsWidth;

		return freeSpace / (stepsCount + 1);
	}, [containerLayout, stepsCount]);

	const startPoint = offset;
	const endPoint = offset * stepsCount + circleDiameter * (stepsCount - 1);
	const pathLength = endPoint - startPoint;
	const pathLengthSlices = pathLength / (stepsCount - 1);

	useEffect(() => {
		Animated.timing(pathAnim, {
			toValue: pathLength - pathLengthSlices * (currentStep - 1),
			duration: 300,
			useNativeDriver: true,
		}).start();
	}, [currentStep, stepsCount]);

	const circles = Array(stepsCount)
		.fill(null)
		.map((step, index) => {
			return (
				<StepCircle
					key={index}
					circleDiameter={circleDiameter}
					currentStep={currentStep}
					index={index}
					middleHeight={middleHeight}
					offset={offset}
					circleEmptyColor={circleEmptyColor}
					circleFillColor={circleFillColor}
				/>
			);
		});

	return (
		<View onLayout={event => setContainerLayout(event.nativeEvent.layout)}>
			{containerLayout ? (
				<Svg style={{ backgroundColor: 'red' }}>
					<>
						<AnimatedPath
							fill="none"
							stroke={pathColor}
							strokeWidth={3}
							strokeDasharray={pathLength}
							strokeDashoffset={pathAnim}
							d={`M${startPoint + circleRadius} ${middleHeight} L${endPoint + circleRadius} ${middleHeight}`}
						/>
						<Path
							fill="none"
							stroke={pathColor}
							strokeWidth={1}
							d={`M${startPoint + circleRadius} ${middleHeight} L${endPoint + circleRadius} ${middleHeight}`}
						/>
					</>
					{circles}
				</Svg>
			) : null}
		</View>
	);
};

interface IStepCircle {
	offset: number;
	index: number;
	circleDiameter: number;
	currentStep: number;
	middleHeight: number;
	circleFillColor: string;
	circleEmptyColor: string;
}

const StepCircle: React.FC<IStepCircle> = ({
	offset,
	index,
	circleDiameter,
	currentStep,
	middleHeight,
	circleFillColor = 'red',
	circleEmptyColor = 'blue',
}) => {
	const fillAnim = useRef(new Animated.Value(0)).current;
	const fillAnimInter = fillAnim.interpolate({ inputRange: [0, 1], outputRange: [circleEmptyColor, circleFillColor] });
	const xOffset = offset * (index + 1) + circleDiameter * index;
	const circleRadius = circleDiameter / 2;

	useEffect(() => {
		const toValue = currentStep > index ? 1 : 0;
		Animated.timing(fillAnim, { useNativeDriver: false, toValue: toValue, duration: 300 }).start();
	}, [currentStep]);

	return (
		<AnimatedCircle
			cx={xOffset + circleRadius}
			cy={middleHeight}
			r={circleRadius}
			fill={fillAnimInter}
			strokeWidth={2}
		/>
	);
};

export default StepCounter;
