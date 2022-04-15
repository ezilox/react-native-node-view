import React, { useMemo, useState } from 'react';
import { Button, View } from 'react-native';
import { Svg, Line as SVGLine, LineProps, Circle, Text } from 'react-native-svg';
import Animated, {
	runOnJS,
	useAnimatedGestureHandler,
	useSharedValue,
	useAnimatedProps,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { getIntersectionOfPoints, getDistanceBetweenPoints } from './utils';

interface Point {
	id: string;
	x: number;
	y: number;
	associateLine: Array<string>;
}

interface Line {
	id: string;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

const AnimatedLine = Animated.createAnimatedComponent(SVGLine);

const SNOW_SNAP_POINTS = true;
const DIVISION_COUNT = 2;
const SNAP_DISTANCE = 20;
const PARALLEL_SAFE_ZONE = 15;

const PolyMaker = () => {
	const [lines, setLines] = useState<Array<Line>>([]);
	const [intersectionPoints, setIntersectionPoints] = useState<Array<Point>>([]);

	const startPointX = useSharedValue(0);
	const startPointY = useSharedValue(0);

	const panPointX = useSharedValue(0);
	const panPointY = useSharedValue(0);

	const getInLinePoints = (line: Line, divisionCount = DIVISION_COUNT) => {
		const points: Array<Point> = Array(divisionCount - 1)
			.fill(null)
			.map((value, index) => {
				const xDiff = line.x2 - line.x1;
				const yDiff = line.y2 - line.y1;

				return {
					x: line.x1 + ((index + 1) / divisionCount) * xDiff,
					y: line.y1 + ((index + 1) / divisionCount) * yDiff,
					associateLine: [line.id],
					id: uuidv4(),
				};
			});

		return points;
	};

	const startEndPoints: Array<Point> = lines
		.map(line => [
			{ x: line.x1, y: line.y1, id: uuidv4(), associateLine: [line.id] },
			{ x: line.x2, y: line.y2, id: uuidv4(), associateLine: [line.id] },
		])
		.flat();

	const snapPoints = useMemo(() => {
		const inLinePoints: Array<Point> = lines.map(line => getInLinePoints(line)).flat();

		return [...startEndPoints, ...intersectionPoints, ...inLinePoints];
	}, [lines, intersectionPoints]);

	const findIntersectionsWithLine = (line: Line) => {
		const firstPointX = line.x1;
		const firstPointY = line.y1;
		const secondPointX = line.x2;
		const secondPointY = line.y2;

		const points: Array<Point> = [];
		lines.forEach(secondLine => {
			const point = getIntersectionOfPoints(
				firstPointX,
				firstPointY,
				secondPointX,
				secondPointY,
				secondLine.x1,
				secondLine.y1,
				secondLine.x2,
				secondLine.y2
			);
			if (point) {
				points.push({ id: uuidv4(), x: point.x, y: point.y, associateLine: [secondLine.id, line.id] });
			}
		});
		const tempIntersectionPoints = [...intersectionPoints];
		setIntersectionPoints(tempIntersectionPoints.concat(points));
	};

	const removeIntersectionPoints = (points: Array<Point>) => {
		const tempIntersectionPoints = [...intersectionPoints];
		points.forEach(pointToRemove => {
			const index = tempIntersectionPoints.findIndex(point => point.id === pointToRemove.id);
			if (index !== -1) {
				tempIntersectionPoints.splice(index, 1);
			}
		});
		setIntersectionPoints(tempIntersectionPoints);
	};

	const isPointClose = (x: number, y: number, distance = SNAP_DISTANCE) => {
		const parallelPoints = getParallelLinePoints(x, y);
		return [...snapPoints, ...parallelPoints].find(
			point => getDistanceBetweenPoints(x, y, point.x, point.y) < distance
		);
	};

	const getParallelLinePoints = (x: number, y: number) => {
		const parallelPoints: Array<Point> = startEndPoints
			.map(point => [
				{
					x: point.x,
					y: y,
					associateLine: point.associateLine,
					id: uuidv4(),
				},
				{
					x: x,
					y: point.y,
					associateLine: point.associateLine,
					id: uuidv4(),
				},
			])
			.flat();
		return parallelPoints;
	};

	const onStartPan = (x: number, y: number) => {
		const closePoint = isPointClose(x, y);

		panPointX.value = closePoint ? closePoint.x : x;
		panPointY.value = closePoint ? closePoint.y : y;
		startPointX.value = closePoint ? closePoint.x : x;
		startPointY.value = closePoint ? closePoint.y : y;
	};

	const onActivePan = (x: number, y: number) => {
		if (Math.abs(x - startPointX.value) < PARALLEL_SAFE_ZONE) {
			x = startPointX.value;
		}

		if (Math.abs(y - startPointY.value) < PARALLEL_SAFE_ZONE) {
			y = startPointY.value;
		}

		const closePoint = isPointClose(x, y);

		panPointX.value = closePoint ? closePoint.x : x;
		panPointY.value = closePoint ? closePoint.y : y;
	};

	const onEndPan = () => {
		if (startPointX.value && startPointY.value && panPointX.value && panPointY.value) {
			const newLine: Line = {
				id: uuidv4(),
				x1: startPointX.value,
				y1: startPointY.value,
				x2: panPointX.value,
				y2: panPointY.value,
			};

			addNewLine(newLine);
		}
	};

	const addNewLine = (line: Line) => {
		findIntersectionsWithLine(line);
		const tempLines = [...lines];
		tempLines.push(line);
		setLines(tempLines);
	};

	const removeLine = () => {
		if (lines.length === 0) {
			return;
		}
		const tempLines = [...lines];
		const latLine = tempLines[tempLines.length - 1];
		const tempIntersectionPoints = [...intersectionPoints];
		const intersectionPointsToRemove = tempIntersectionPoints.filter(point => point.associateLine.includes(latLine.id));
		removeIntersectionPoints(intersectionPointsToRemove);

		tempLines.pop();
		setLines(tempLines);
	};

	const onPan = useAnimatedGestureHandler({
		onStart: event => {
			runOnJS(onStartPan)(event.absoluteX, event.absoluteY);
		},
		onActive: event => {
			runOnJS(onActivePan)(event.absoluteX, event.absoluteY);
		},
		onEnd: () => {
			runOnJS(onEndPan)();
		},
	});

	const lineAnimatedProps = useAnimatedProps<LineProps>(() => {
		if (panPointX.value === 0 || panPointY.value === 0 || startPointX.value === 0 || startPointY.value === 0) {
			return { x1: 0, y1: 0, x2: 0, y2: 0 };
		}

		return { x1: startPointX.value, y1: startPointY.value, x2: panPointX.value, y2: panPointY.value };
	}, [panPointX.value, panPointY.value, startPointX.value, startPointY.value]);

	const renderLines = lines.map((line, index) => (
		<React.Fragment key={line.id}>
			<SVGLine
				x1={line.x1}
				y1={line.y1}
				x2={line.x2}
				y2={line.y2}
				stroke="pink"
				strokeWidth={4}
				strokeLinecap="round"
			/>
		</React.Fragment>
	));

	return (
		<PanGestureHandler enabled={true} onGestureEvent={onPan}>
			<Animated.View style={{ flex: 1, backgroundColor: 'gray' }}>
				<View style={{ backgroundColor: 'lightgray', width: '100%', height: 100, position: 'absolute', bottom: 0 }}>
					<Button onPress={removeLine} title="Undo" />
				</View>

				<Svg>
					{SNOW_SNAP_POINTS
						? snapPoints.map(point => (
								<React.Fragment key={point.id}>
									<Text x={15 + point.x} y={5 + point.y} fill="purple" fontSize="8" >
										{point.x.toFixed(0)}/{point.y.toFixed(0)}
									</Text>
									<Circle cx={point.x} cy={point.y} r="3" fill="pink" opacity={1} />
								</React.Fragment>
						  ))
						: false}
					{renderLines}
					<AnimatedLine animatedProps={lineAnimatedProps} stroke="pink" strokeWidth={4} />
				</Svg>
			</Animated.View>
		</PanGestureHandler>
	);
};

export default PolyMaker;
