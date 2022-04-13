import React, { useState } from 'react';
import { Button, View } from 'react-native';
import { Svg, Line, LineProps } from 'react-native-svg';
import Animated, {
	runOnJS,
	useAnimatedGestureHandler,
	useSharedValue,
	useAnimatedProps,
} from 'react-native-reanimated';
import { PanGestureHandler, TapGestureHandler } from 'react-native-gesture-handler';

interface Point {
	x: number;
	y: number;
}

interface Line {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const PolyMaker = () => {
	const [lines, setLines] = useState<Array<Line>>([{ x1: 100, y1: 200, x2: 200, y2: 300 }]);
	// const [startPoint, setStartPoint] = useState<Point>();

	const startPointX = useSharedValue(0);
	const startPointY = useSharedValue(0);

	const panPointX = useSharedValue(0);
	const panPointY = useSharedValue(0);

	const addNewLine = (line: Line) => {
		const tempLines = [...lines];
		tempLines.push(line);
		setLines(tempLines);
	};

	const removeLine = () => {
		const tempLines = [...lines];
		console.log(tempLines.length);

		if (tempLines.length === 1) {
			panPointX.value = 0;
			panPointY.value = 0;
			startPointX.value = 0;
			startPointY.value = 0;
		}
		tempLines.pop();
		setLines(tempLines);
	};

	const onPan = useAnimatedGestureHandler({
		onStart: event => {
			console.log('pan');

			panPointX.value = event.absoluteX;
			panPointY.value = event.absoluteY;
			startPointX.value = event.absoluteX;
			startPointY.value = event.absoluteY;
		},
		onActive: event => {
			panPointX.value = event.absoluteX;
			panPointY.value = event.absoluteY;
		},
		onEnd: () => {
			if (startPointX.value && startPointY.value && panPointX.value && panPointY.value) {
				const newLine: Line = {
					x1: startPointX.value,
					y1: startPointY.value,
					x2: panPointX.value,
					y2: panPointY.value,
				};

				runOnJS(addNewLine)(newLine);
			}
		},
	});

	// const onTap = useAnimatedGestureHandler({
	// 	onStart: event => {
	// 		console.log('here tap');

	// 		// panPointX.value = event.absoluteX;
	// 		// panPointY.value = event.absoluteY;
	// 		// startPointX.value = event.absoluteX;
	// 		// startPointY.value = event.absoluteY;
	// 	},
	// 	onActive: () => {
	// 		console.log('here tap');
	// 	},
	// });

	const lineAnimatedProps = useAnimatedProps<LineProps>(() => {
		if (panPointX.value === 0 || panPointY.value === 0 || startPointX.value === 0 || startPointY.value === 0) {
			return { x1: 0, y1: 0, x2: 0, y2: 0 };
		}

		return { x1: startPointX.value, y1: startPointY.value, x2: panPointX.value, y2: panPointY.value };
	}, [panPointX.value, panPointY.value, startPointX.value, startPointY.value]);

	const renderLines = lines.map((line, index) => (
		<React.Fragment key={`${line.x1}${line.y1}${line.x2}${line.y2}`}>
			<Svg style={{ backgroundColor: 'transparent' }}>
				<Line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="red" strokeWidth={4} />
			</Svg>

			<Animated.View
				style={{
					opacity: 0.5,
					height: 20,
					width: 20,
					position: 'absolute',
					top: line.y1 - 10,
					left: line.x1 - 10,
					backgroundColor: 'blue',
				}}
			/>
			<TapGestureHandler onHandlerStateChange={() => console.log('here')}>
				<Animated.View
					style={{
						opacity: 0.5,
						height: 50,
						width: 50,
						position: 'absolute',
						top: line.y2 - 10,
						left: line.x2 - 10,
						backgroundColor: 'blue',
						zIndex: 99,
					}}
				/>
			</TapGestureHandler>
		</React.Fragment>
	));
	console.log(lines.length);

	return (
		<PanGestureHandler enabled={true} onGestureEvent={onPan}>
			<Animated.View style={{ flex: 1, backgroundColor: 'gray' }}>
				<View style={{ backgroundColor: 'lightgray', width: '100%', height: 100, position: 'absolute', bottom: 0 }}>
					<Button onPress={removeLine} title="Undo" />
				</View>
				{/* <AnimatedSvg focusable={false} disabled={true}> */}
				{renderLines}
				<Svg>
					<AnimatedLine animatedProps={lineAnimatedProps} stroke="red" strokeWidth={4} />
				</Svg>
				{/* </AnimatedSvg> */}
			</Animated.View>
		</PanGestureHandler>
	);
};

export default PolyMaker;
