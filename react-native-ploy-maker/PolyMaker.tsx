import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Keyboard, View } from 'react-native';
import { Svg, Line as SVGLine, LineProps, Circle, Text } from 'react-native-svg';
import Animated, {
	runOnJS,
	useAnimatedGestureHandler,
	useSharedValue,
	useAnimatedProps,
} from 'react-native-reanimated';
import {
	GestureEventPayload,
	PanGestureHandler,
	TapGestureHandler,
	TapGestureHandlerEventPayload,
	TapGestureHandlerGestureEvent,
	TextInput,
} from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { getIntersectionOfPoints, getDistanceBetweenPoints, deepCopy } from './utils';
import MiniShapeList from './MiniShapeList';
import { Shape } from './Shape';
import { Line } from './Line';
import { stores } from './stores/storeIndex';
import { observer } from 'mobx-react-lite';
import { Angle } from './Angle';

export const storeContext = createContext<typeof stores>(stores);

const AnimatedLine = Animated.createAnimatedComponent(SVGLine);

const SNOW_SNAP_POINTS = false;
const SHOW_LINE_ID = false;

const SNAP_DISTANCE = 20;
const PARALLEL_SAFE_ZONE = 10;

const PolyMaker = observer(() => {
	const { shapeStore } = useContext(storeContext);
	const [lines, setLines] = useState<Array<Line>>([]);
	const [intersectionPoints, setIntersectionPoints] = useState<Array<Point>>([]);
	const [shapes, setShapes] = useState<Array<Shape>>([]);

	const tapRef = useRef();

	const startPointX = useSharedValue(0);
	const startPointY = useSharedValue(0);

	const panPointX = useSharedValue(0);
	const panPointY = useSharedValue(0);

	useEffect(() => {
		useEffectAsync();
	}, [intersectionPoints, lines]);

	const useEffectAsync = async () => {
		let shapes: Array<Shape> = [];

		for (let index = 0; index < intersectionPoints.length; index++) {
			const point = intersectionPoints[index];
			await findShapes(point, point, [], shapes);
		}

		setShapes(shapes);
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

	const findShapes = async (
		startPoint: Point,
		point: Point,
		shapeLines: Array<Line> = [],
		shapes: Array<Shape> = []
	) => {
		const linesToGo = Object.keys(point.associateLine).filter(lineId => !shapeLines.some(line => line.id === lineId));

		for (let i = 0; i < linesToGo.length; i++) {
			const lineId = linesToGo[i];

			const goToPoints = intersectionPoints.filter(
				goToPoint => goToPoint.associateLine[lineId] && goToPoint.id !== point.id
			);

			for (let j = 0; j < goToPoints.length; j++) {
				const goToPoint = goToPoints[j];
				const line = lines.find(line => line.id === lineId);
				if (line) {
					shapeLines.push(line);

					await findShapes(startPoint, goToPoint, shapeLines, shapes);
					shapeLines.pop();
				}
			}
		}

		if (shapeLines.length > 1 && point.id === startPoint.id) {
			const newShape = new Shape(shapeLines);
			const isShapeExists = shapes.some(shape => shape.id === newShape.id);
			!isShapeExists && shapes.push(new Shape(shapeLines));
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
		// const inLinePoints: Array<Point> = lines.map(line => getInLinePoints(line)).flat();

		return [...startEndPoints, ...intersectionPoints];
		// return [...startEndPoints, ...intersectionPoints, ...inLinePoints];
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
					newSegmentsLines.push(new Line(line.startPoint, newPoint, line.id));
					newSegmentsLines.push(new Line(line.endPoint, newPoint, line.id));
					newSegmentsLines.push(new Line(secondLine.startPoint, newPoint, secondLine.id));
					newSegmentsLines.push(new Line(secondLine.endPoint, newPoint, secondLine.id));
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
			const newLine = new Line(
				{ x: startPointX.value, y: startPointY.value, id: uuidv4(), associateLine: {} },
				{ x: panPointX.value, y: panPointY.value, id: uuidv4(), associateLine: {} }
			);
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

	const onTapActive = (event: Readonly<GestureEventPayload & TapGestureHandlerEventPayload>) => {
		if (!shapeStore.selectedAngleId && !shapeStore.selectedLineId) {
			const angle = shapeStore.selectedShape?.isCloseToAngle(event.x, event.y);
			if (angle) {
				shapeStore.selectedAngleId = angle.id;
				return;
			}
			const line = shapeStore.selectedShape?.isCloseToLine(event.x, event.y);
			if (line) {
				shapeStore.selectedLineId = line.id;
				return;
			}
		} else {
			Keyboard.dismiss();
			shapeStore.selectedAngleId = null;
			shapeStore.selectedLineId = null;
		}
	};

	const updateAngleValue = (value: number) => {
		if (shapeStore.selectedAngleId && shapeStore.selectedShape) {
			const angleIndex = shapeStore.selectedShape.angles.findIndex(angle => angle.id === shapeStore.selectedAngleId);
			if (angleIndex !== -1) {
				const deepCopyShape = deepCopy(shapeStore.selectedShape) as Shape;
				const deepCopyAngle = deepCopy(deepCopyShape.angles[angleIndex]) as Angle;
				deepCopyAngle.value = value;
				deepCopyShape.angles[angleIndex] = deepCopyAngle;
				shapeStore.selectedShape = deepCopyShape;
			}
		}
	};

	const updateLineValue = (value: number) => {
		if (shapeStore.selectedLineId && shapeStore.selectedShape) {
			const lineIndex = shapeStore.selectedShape.lines.findIndex(line => line.id === shapeStore.selectedLineId);
			if (lineIndex !== -1) {
				const deepCopyShape = deepCopy(shapeStore.selectedShape) as Shape;
				const deepCopyLine = deepCopy(deepCopyShape.lines[lineIndex]) as Line;
				deepCopyLine.value = value;
				deepCopyShape.lines[lineIndex] = deepCopyLine;
				shapeStore.selectedShape = deepCopyShape;
			}
		}
	};

	const onTap = useAnimatedGestureHandler<TapGestureHandlerGestureEvent>({
		onActive: event => {
			runOnJS(onTapActive)(event);
		},
	});

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
				stroke={
					shapeStore.selectedShape
						? shapeStore.selectedShape?.hasLine(line)
							? 'blue'
							: 'rgba(255,192,203, 0.4)'
						: 'pink'
				}
				strokeWidth={4}
				strokeLinecap="round"
			/>
			{SHOW_LINE_ID ? (
				<Text
					x={0 + (line.startPoint.x + line.endPoint.x) / 2}
					y={(line.startPoint.y + line.endPoint.y) / 2 + 15}
					fill="purple"
					fontSize="14">
					{line.id.slice(line.id.length - 2, line.id.length)}
				</Text>
			) : null}
		</React.Fragment>
	));

	const renderSnapPoints = SNOW_SNAP_POINTS
		? snapPoints.map(point => (
				<React.Fragment key={point.id}>
					<Text x={15 + point.x} y={5 + point.y} fill="purple" fontSize="8">
						{point.x.toFixed(0)}/{point.y.toFixed(0)}
					</Text>
					<Circle cx={point.x} cy={point.y} r="3" fill="pink" opacity={1} />
				</React.Fragment>
		  ))
		: false;

	const renderAnglesValues = shapeStore.selectedShape?.angles.map(angle => {
		return (
			<React.Fragment key={angle.id}>
				<Circle cx={angle.x} cy={angle.y} r="3" fill="black" opacity={1} />
				<Text fill="purple" fontSize="12" x={angle.x + 10} y={angle.y}>
					{angle.value}
				</Text>
			</React.Fragment>
		);
	});

	const renderLineValues = shapeStore.selectedShape?.lines.map(line => {
		return (
			<React.Fragment key={line.id}>
				{/* <Circle cx={angle.x} cy={angle.y} r="3" fill="black" opacity={1} /> */}
				<Text x={line.centerPoint.x} y={line.centerPoint.y} fill="purple" fontSize="14">
					{line.value}
				</Text>
			</React.Fragment>
		);
	});

	return (
		<PanGestureHandler waitFor={tapRef} onGestureEvent={onPan}>
			<Animated.View style={{ flex: 1 }}>
				<TapGestureHandler ref={tapRef} onGestureEvent={onTap}>
					<Animated.View style={{ flex: 1, backgroundColor: 'gray' }}>
						<View style={{ backgroundColor: 'lightgray', width: '100%', height: 100, position: 'absolute', bottom: 0 }}>
							<Button onPress={removeLine} title="Undo" />
						</View>
						<Svg>
							{renderLines}
							{renderSnapPoints}
							{renderAnglesValues}
							{renderLineValues}
							<AnimatedLine animatedProps={lineAnimatedProps} stroke="pink" strokeWidth={4} />
						</Svg>
						<MiniShapeList
							setShape={(shape: Shape) => {
								shapeStore.selectedShape = shape;
							}}
							shapes={shapes}
						/>
						{shapeStore.selectedAngle ? (
							<TextInput
								keyboardType="number-pad"
								value={String(shapeStore.selectedAngle.value ?? '0')}
								onChangeText={value => updateAngleValue(parseInt(value))}
								style={{
									position: 'absolute',
									top: shapeStore.selectedAngle.y,
									left: shapeStore.selectedAngle.x,
									backgroundColor: 'red',
									width: 20,
									height: 10,
								}}
							/>
						) : null}
						{shapeStore.selectedLine ? (
							<TextInput
								keyboardType="number-pad"
								value={String(shapeStore.selectedLine.value ?? '0')}
								onChangeText={value => updateLineValue(parseInt(value))}
								style={{
									position: 'absolute',
									top: shapeStore.selectedLine.centerPoint.y,
									left: shapeStore.selectedLine.centerPoint.x,
									backgroundColor: 'red',
									width: 20,
									height: 10,
								}}
							/>
						) : null}
					</Animated.View>
				</TapGestureHandler>
			</Animated.View>
		</PanGestureHandler>
	);
});

export default PolyMaker;
