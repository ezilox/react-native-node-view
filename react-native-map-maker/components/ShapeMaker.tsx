import React, { useRef, useState, useEffect, MutableRefObject } from 'react';
import {
	View,
	StyleSheet,
	Button,
	FlatList,
	ListRenderItem,
	Animated,
	NativeScrollEvent,
	NativeSyntheticEvent,
	Pressable,
	LayoutRectangle,
	TextStyle,
	GestureResponderEvent,
} from 'react-native';
import Svg, { Line, LineProps, Rect, RectProps, Text } from 'react-native-svg';
import {
	PanGestureHandler,
	PanGestureHandlerEventPayload,
	GestureEvent,
	TapGestureHandler,
	TapGestureHandlerEventPayload,
	State,
	HandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import Shape from './Shape';

export interface Props {
	mode: 'edit' | 'display';
	onSaveShape?: (rects: Array<string>) => void;
	selectedRects?: Array<string>;
}

const Grid: React.FC<Props> = ({ mode, onSaveShape, selectedRects }) => {
	const WIDTH = 300;
	const HEIGHT = 300;
	const rectSize = 30;
	const isEdit = mode === 'edit';
	const [pressedRect, setPressedRect] = useState<Array<string>>(isEdit ? [] : selectedRects ? selectedRects : []);
	const lastRectAdded = useRef({ value: '' }).current;

	const tapHandler = (event: HandlerStateChangeEvent<TapGestureHandlerEventPayload>) => {
		if (event.nativeEvent.state === State.ACTIVE) {
			const tempPressedRectSet = new Set([...pressedRect]);
			const tempPressedRect = [...tempPressedRectSet];
			const x = Math.floor(event.nativeEvent.x / rectSize);
			const y = Math.floor(event.nativeEvent.y / rectSize);
			const rectYX = `${y}${x}`;

			if (tempPressedRect.includes(rectYX)) {
				// return;
				const index = tempPressedRect.findIndex(rect => rect === rectYX);
				tempPressedRect.splice(index, 1);
			} else {
				tempPressedRect.push(rectYX);
			}
			setPressedRect(tempPressedRect);
		}
	};

	const panHandler = (event: GestureEvent<PanGestureHandlerEventPayload>) => {
		const tempPressedRectSet = new Set([...pressedRect]);
		const tempPressedRect = [...tempPressedRectSet];
		const x = Math.floor(event.nativeEvent.x / rectSize);
		const y = Math.floor(event.nativeEvent.y / rectSize);
		const rectYX = `${y}${x}`;

		if (lastRectAdded.value === rectYX || x > 9 || x < 0 || y > 9 || y < 0) {
			return;
		}
		if (tempPressedRect.includes(rectYX)) {
			return;
		} else {
			tempPressedRect.push(rectYX);
		}
		setPressedRect(tempPressedRect);
		lastRectAdded.value = rectYX;
	};

	const grid = [...Array(HEIGHT / rectSize).keys()].map((data, gridIndex) => {
		const isLastGrid = gridIndex === [...Array(HEIGHT / rectSize).keys()].length - 1;
		return (
			<Svg key={gridIndex} width="100%" height={rectSize} style={{ backgroundColor: 'lightgray' }}>
				{[...Array(WIDTH / rectSize).keys()].map((data, index) => {
					const key = `${gridIndex}${index}`;
					const isLast = index === [...Array(WIDTH / rectSize).keys()].length - 1;
					return (
						<PressableRect
							key={key}
							rectKey={key}
							isPressed={pressedRect.includes(key)}
							index={index}
							rectSize={rectSize}
							isLast={isLast}
							isLastGrid={isLastGrid}
						/>
					);
				})}
			</Svg>
		);
	});

	return (
		<View style={{ backgroundColor: 'lightgray', width: WIDTH, height: HEIGHT, alignSelf: 'center' }}>
			{grid ? (
				<PanGestureHandler enabled={isEdit} onGestureEvent={panHandler}>
					<TapGestureHandler enabled={isEdit} onHandlerStateChange={tapHandler}>
						<View>{grid}</View>
					</TapGestureHandler>
				</PanGestureHandler>
			) : (
				<View />
			)}
			<Button title="Save Shape" onPress={() => onSaveShape && onSaveShape(pressedRect)} />
		</View>
	);
};

interface IPressableRect {
	index: number;
	rectSize: number;
	isLastGrid: boolean;
	isLast: boolean;
	isPressed: boolean;
	rectKey: string;
}

const PressableRect: React.FC<IPressableRect> = ({ index, rectSize, isLastGrid, isLast, isPressed, rectKey }) => {
	return (
		<Svg>
			<Rect
				x={rectSize * index}
				y={0}
				fill={isPressed ? 'gray' : undefined}
				width={rectSize}
				height={rectSize}
				strokeWidth={isLastGrid && isLast ? 0 : 1}
				strokeDasharray={
					isLastGrid
						? [0, rectSize, rectSize, rectSize]
						: isLast
						? [0, rectSize * 2, rectSize, rectSize * 2]
						: [0, rectSize, rectSize]
				}
				stroke="gray"
			/>
			{/* <Text stroke="red" fontWeight="100" fontSize="14" x={rectSize * index} y="15" textAnchor="start">
				{`${rectKey}`}
			</Text> */}
		</Svg>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
});

export default Grid;
