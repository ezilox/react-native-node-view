import React, { useEffect, useMemo, useState } from 'react';
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
import { getIntersectionOfPoints, getDistanceBetweenPoints, getInLinePoints } from './utils';
import MiniShapeList from './MiniShapeList';
import { Shape } from './Shape';

const AnimatedLine = Animated.createAnimatedComponent(SVGLine);

const SNOW_SNAP_POINTS = true;

const SNAP_DISTANCE = 20;
const PARALLEL_SAFE_ZONE = 10;

const PolyMaker = () => {
	const [lines, setLines] = useState<Array<Line>>([]);
	const [intersectionPoints, setIntersectionPoints] = useState<Array<Point>>([]);
	const [shapes, setShapes] = useState<Array<Shape>>([]);

	const startPointX = useSharedValue(0);
	const startPointY = useSharedValue(0);

	const panPointX = useSharedValue(0);
	const panPointY = useSharedValue(0);

	useEffect(() => {
		useEffectAsync();
	}, [intersectionPoints, lines]);

	const useEffectAsync = async () => {
		let f: Array<Shape> = [];

		for (let index = 0; index < intersectionPoints.length; index++) {
			const point = intersectionPoints[index];
			await findShapes(point, point, [], f);
		}

		setShapes(f);
	};

	const sleep = async (timeout = 0) => {
		if (timeout) {
			await new Promise(resolve =>
				setTimeout(() => {
					resolve('');
				}, timeout)
			);
		}
	};

	const findShapes = async (startPoint: Point, point: Point, shapeLines: Array<Line> = [], f: Array<Shape> = []) => {
		await sleep();
		const linesToGo = Object.keys(point.associateLine).filter(lineId => !shapeLines.some(line => line.id === lineId));

		for (let i = 0; i < linesToGo.length; i++) {
			await sleep();
			const lineId = linesToGo[i];

			const goToPoints = intersectionPoints.filter(
				goToPoint => goToPoint.associateLine[lineId] && goToPoint.id !== point.id
			);

			for (let j = 0; j < goToPoints.length; j++) {
				await sleep();
				const goToPoint = goToPoints[j];
				const line = lines.find(line => line.id === lineId);
				if (line) {
					shapeLines.push(line);

					await findShapes(startPoint, goToPoint, shapeLines, f);
					shapeLines.pop();
				}
			}
		}

		await sleep();

		if (shapeLines.length > 1 && point.x === startPoint.x && point.y === startPoint.y) {
			f.push(new Shape(shapeLines));
		}
	};

	const startEndPoints: Array<Point> = lines
		.map(line => [
			{
				x: line.startPoint.x,
				y: line.startPoint.y,
				id: uuidv4(),
				associateLine: { [line.id]: true },
			},
			{ x: line.endPoint.x, y: line.endPoint.y, id: uuidv4(), associateLine: { [line.id]: true } },
		])
		.flat();

	const snapPoints = useMemo(() => {
		const inLinePoints: Array<Point> = lines.map(line => getInLinePoints(line)).flat();

		return [...startEndPoints, ...intersectionPoints];
		return [...startEndPoints, ...intersectionPoints, ...inLinePoints];
	}, [lines, intersectionPoints]);

	const removeParentLines = (lines: Array<Line>, intersectionPoints: Array<Point>) => {
		const tempIntersectionPoints = [...intersectionPoints];

		const parentsIds = lines
			.map(line => ({ parentId: line.parentId, childId: line.id }))
			.filter(id => typeof id.parentId === 'string');
		const parentLines = lines.filter(line => parentsIds.some(id => id.parentId === line.id));
		const linesWithoutParent = lines.filter(line => !parentsIds.some(id => id.parentId === line.id));

		tempIntersectionPoints.map(point => {
			parentLines.forEach(parentLine => {
				if (
					(parentLine.startPoint.x === point.x && parentLine.startPoint.y === point.y) ||
					(parentLine.endPoint.x === point.x && parentLine.endPoint.y === point.y)
				) {
					delete point.associateLine[parentLine.id];
					const childLine = lines.find(
						line => line.parentId === parentLine.id && line.startPoint.x === point.x && line.startPoint.y === point.y
					);
					if (childLine) {
						if (childLine.startPoint.x && childLine.startPoint.x) point.associateLine[childLine.id] = true;
					}
				}
			});
		});
		const lineIds = [...new Set(linesWithoutParent.map(line => line.id))];

		const linesWithoutDuplication = lineIds
			.map(id => lines.find(line => line.id === id))
			.filter(line => line) as Array<Line>;
		setIntersectionPoints(tempIntersectionPoints);

		return linesWithoutDuplication;
	};

	const findIntersectionsWithLine = (line: Line) => {
		let newLines: Array<Line> = [];

		const tempIntersectionPoints = [...intersectionPoints];
		const tempLines = [...lines];
		const firstPointX = line.startPoint.x;
		const firstPointY = line.startPoint.y;
		const secondPointX = line.endPoint.x;
		const secondPointY = line.endPoint.y;

		const points: Array<Point> = [];
		if (lines.length === 0) {
			newLines.push(line);
		}
		lines.forEach(secondLine => {
			let newSegmentsLines: Array<Line> = [];
			const point = getIntersectionOfPoints(
				firstPointX,
				firstPointY,
				secondPointX,
				secondPointY,
				secondLine.startPoint.x,
				secondLine.startPoint.y,
				secondLine.endPoint.x,
				secondLine.endPoint.y
			);
			if (point) {
				const newPoint = {
					id: uuidv4(),
					x: point.x,
					y: point.y,
					associateLine: { [secondLine.id]: true, [line.id]: true },
				};

				if (
					(point.x === firstPointX && point.y === firstPointY) ||
					(point.x === secondPointX && point.y === secondPointY)
				) {
					newLines.push(line);
				} else {
					newSegmentsLines.push({
						id: uuidv4(),
						startPoint: line.startPoint,
						endPoint: newPoint,
						parentId: line.id,
					});
					newSegmentsLines.push({
						id: uuidv4(),
						startPoint: line.endPoint,
						endPoint: newPoint,
						parentId: line.id,
					});
					newSegmentsLines.push({
						id: uuidv4(),
						startPoint: secondLine.startPoint,
						endPoint: newPoint,
						parentId: secondLine.id,
					});
					newSegmentsLines.push({
						id: uuidv4(),
						startPoint: secondLine.endPoint,
						endPoint: newPoint,
						parentId: secondLine.id,
					});
					if (newSegmentsLines.length > 0) {
						newPoint.associateLine = {};
						newSegmentsLines.map(newLine => (newPoint.associateLine[newLine.id] = true));
						newLines.push(...newSegmentsLines);
					}
				}
				points.push(newPoint);
			}
		});

		points.forEach(newPoint => {
			const samePointIndex = tempIntersectionPoints.findIndex(
				point => point.x === newPoint.x && point.y === newPoint.y
			);
			if (samePointIndex === -1) {
				tempIntersectionPoints.push(newPoint);
			} else {
				const associateLine = {
					...tempIntersectionPoints[samePointIndex].associateLine,
					...newPoint.associateLine,
				};
				tempIntersectionPoints[samePointIndex].associateLine = { ...associateLine };
			}
		});

		setIntersectionPoints(tempIntersectionPoints);
		return removeParentLines([...tempLines, ...newLines], tempIntersectionPoints);
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
			const newLineId = uuidv4();
			const newLine: Line = {
				id: newLineId,
				startPoint: { x: startPointX.value, y: startPointY.value, id: uuidv4(), associateLine: {} },
				endPoint: { x: panPointX.value, y: panPointY.value, id: uuidv4(), associateLine: {} },
			};

			addNewLine(newLine);
		}
		startPointX.value = 0;
	};

	const addNewLine = (line: Line) => {
		const newSegmentsLines = findIntersectionsWithLine(line);
		setLines(newSegmentsLines);
	};

	const removeLine = () => {
		if (lines.length === 0) {
			return;
		}
		const tempLines = [...lines];
		const latLine = tempLines[tempLines.length - 1];
		const tempIntersectionPoints = [...intersectionPoints];
		const intersectionPointsToRemove = tempIntersectionPoints.filter(point => point.associateLine[latLine.id]);
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
				x1={line.startPoint.x}
				y1={line.startPoint.y}
				x2={line.endPoint.x}
				y2={line.endPoint.y}
				stroke={'pink'}
				strokeWidth={4}
				strokeLinecap="round"
			/>
			<Text
				x={0 + (line.startPoint.x + line.endPoint.x) / 2}
				y={(line.startPoint.y + line.endPoint.y) / 2 + 15}
				fill="purple"
				fontSize="14">
				{line.id.slice(line.id.length - 2, line.id.length)}
			</Text>
		</React.Fragment>
	));

	return (
		<PanGestureHandler enabled={true} onGestureEvent={onPan}>
			<Animated.View style={{ flex: 1, backgroundColor: 'gray' }}>
				<View style={{ backgroundColor: 'lightgray', width: '100%', height: 100, position: 'absolute', bottom: 0 }}>
					<Button onPress={removeLine} title="Undo" />
				</View>

				<Svg>
					{renderLines}
					{SNOW_SNAP_POINTS
						? snapPoints.map(point => (
								<React.Fragment key={point.id}>
									<Text x={15 + point.x} y={5 + point.y} fill="purple" fontSize="8">
										{point.x.toFixed(0)}/{point.y.toFixed(0)}
									</Text>
									<Circle cx={point.x} cy={point.y} r="3" fill="pink" opacity={1} />
								</React.Fragment>
						  ))
						: false}
					<AnimatedLine animatedProps={lineAnimatedProps} stroke="pink" strokeWidth={4} />
				</Svg>
				<MiniShapeList shapes={shapes} />
			</Animated.View>
		</PanGestureHandler>
	);
};

export default PolyMaker;
