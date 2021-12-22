import React, { useRef, useEffect, useState } from 'react';
import { View, Animated, LayoutRectangle, Easing } from 'react-native';
import { Path, Svg, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { svgPathProperties } from 'svg-path-properties';
import { PanGestureHandler, State, PanGestureHandlerEventPayload, GestureEvent } from 'react-native-gesture-handler';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircleSvg = Animated.createAnimatedComponent(Circle);

const normalizationInt = (val: number, max: number, min: number) => {
	return (val - min) / (max - min);
};

interface DrawGraphProps {
	points: Array<Point>;
	pathColor: string;
	pathStroke: number;
	startGradientColor: string;
	stopGradientColor: string;
	circleColor: string;
	circleRadius: number;
	enablePan: boolean;
}

interface Point {
	x: number;
	y: number;
}

interface NormalizedPoint {
	x: number | undefined;
	y: number | undefined;
}

const DrawGraph: React.FC<DrawGraphProps> = ({
	pathColor = '#3695BD',
	pathStroke = '2.5',
	startGradientColor = '#64D0FF',
	stopGradientColor = '#FFFFFF',
	circleColor = 'rgba(29, 137, 184, 1)',
	circleRadius = 6,
	enablePan = true,
	...props
}) => {
	const [pathLength, setPathLength] = useState(0);
	const [containerLayout, setContainerLayout] = useState<LayoutRectangle | null>(null);
	const [pathString, setPathString] = useState<string>();
	const [normalizedPoints, setNormalizedPoints] = useState<Array<NormalizedPoint>>();
	const [showCircleIndex, setShowCircleIndex] = useState<number>();

	const drawAnimValue = useRef(new Animated.Value(0)).current;
	const opacityAnimValue = useRef(new Animated.Value(0)).current;

	const getYPosition = (y: number, max: number, min: number) => {
		if (containerLayout) {
			return (1 - normalizationInt(y, max, min)) * containerLayout.height;
		}
	};

	const getXPosition = (x: number, max: number, min: number) => {
		if (containerLayout) {
			return normalizationInt(x, max, min) * containerLayout.width;
		}
	};

	useEffect(() => {
		if (props.points && containerLayout) {
			const xPoints = props.points.map(point => point.x);
			const yPoints = props.points.map(point => point.y);
			const maxX = Math.max(...xPoints);
			const minX = Math.min(...xPoints);
			const maxY = Math.max(...yPoints);
			const minY = Math.min(...yPoints);
			const normalizedPoints = props.points.map(point => {
				const { x, y } = point;
				return { x: getXPosition(x, maxX * 1, minX), y: getYPosition(y, maxY * 1.05, minY * 1.1) };
			});

			setNormalizedPoints(normalizedPoints);
		}
	}, [containerLayout]);

	useEffect(() => {
		if (containerLayout && normalizedPoints) {
			let tempPathString = '';
			let lastYPoint;
			normalizedPoints.forEach((point, index) => {
				const { x, y } = point;
				if (index === 0) {
					tempPathString = `M ${0} ${y}`;
				} else {
					if (index === props.points.length - 1) {
						lastYPoint = y;
					}
					tempPathString = tempPathString + `L ${x} ${y}`;
				}
			});
			tempPathString =
				tempPathString +
				`L ${containerLayout.width * 1.2} ${lastYPoint} L ${containerLayout.width * 1.2} ${
					containerLayout.height * 1.2
				} L ${-containerLayout.width * 0.2} ${containerLayout.height * 1.2}`;
			setPathString(tempPathString);
		}
	}, [containerLayout, normalizedPoints]);

	useEffect(() => {
		if (pathLength) {
			drawAnimValue.setValue(pathLength);
			Animated.timing(drawAnimValue, {
				useNativeDriver: true,
				toValue: 0,
				duration: 3000,
				easing: Easing.ease,
			}).start();
			Animated.timing(opacityAnimValue, {
				useNativeDriver: true,
				toValue: 1,
				duration: 2000,
				delay: 100,
				easing: Easing.ease,
			}).start();
		}
	}, [pathLength]);

	useEffect(() => {
		if (pathString) {
			const properties = new svgPathProperties(pathString);
			setPathLength(properties.getTotalLength());
		}
	}, [pathString]);

	const onPanHandler = (event: GestureEvent<PanGestureHandlerEventPayload>) => {
		if (State.ACTIVE === event.nativeEvent.state) {
			const closestIndex = findClosestCircle(event.nativeEvent.x);
			setShowCircleIndex(closestIndex);
		}
	};

	const pointsCircles = normalizedPoints?.map((point, index) => {
		if (point.x && point.y) {
			return (
				<AnimatedCircle
					key={`${point.x}-${point.y}`}
					x={point.x}
					y={point.y}
					show={showCircleIndex === index}
					r={circleRadius}
					circleColor={circleColor}
				/>
			);
		}
	});

	const findClosestCircle = (x: number) => {
		let distance = 99999999;
		let distanceIndex: undefined | number;
		if (x) {
			normalizedPoints?.forEach((point, index) => {
				const { x: pointX, y: pointY } = point;
				if (pointX) {
					const distanceFromPoint = Math.abs(x - pointX);
					if (distance > distanceFromPoint) {
						distance = distanceFromPoint;
						distanceIndex = index;
					}
				}
			});
		}
		return distanceIndex;
	};

	return (
		<PanGestureHandler enabled={enablePan} onGestureEvent={event => onPanHandler(event)}>
			<View style={{ flex: 1 }} onLayout={event => setContainerLayout(event.nativeEvent.layout)}>
				<Svg>
					<Defs>
						<LinearGradient id="grad" x1="0%" y1="100%" x2="0%" y2="40%">
							<Stop offset="0" stopColor={stopGradientColor} stopOpacity="1" />
							<Stop offset="1" stopColor={startGradientColor} stopOpacity="1" />
						</LinearGradient>
					</Defs>
					<AnimatedPath
						d={pathString}
						fill="url(#grad)"
						fillOpacity={opacityAnimValue}
						stroke={pathColor}
						strokeWidth={pathStroke}
						strokeDasharray={pathLength}
						strokeDashoffset={drawAnimValue}
					/>
					{pointsCircles}
				</Svg>
			</View>
		</PanGestureHandler>
	);
};

interface IAnimatedCircle {
	x: number;
	y: number;
	r: number;
	show: boolean;
	circleColor: string;
}

const AnimatedCircle: React.FC<IAnimatedCircle> = ({ ...props }) => {
	const radiusAnimValue = useRef(new Animated.Value(0)).current;
	useEffect(() => {
		if (props.show) {
			Animated.spring(radiusAnimValue, { useNativeDriver: true, bounciness: 10, toValue: props.r }).start();
		} else {
			Animated.spring(radiusAnimValue, { useNativeDriver: true, bounciness: 10, toValue: 0 }).start();
		}
	}, [props.show]);
	return <AnimatedCircleSvg cx={props.x} cy={props.y} r={radiusAnimValue} fill={props.circleColor} />;
};

export default DrawGraph;
