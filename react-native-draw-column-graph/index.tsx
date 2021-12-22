import React, { useRef, useEffect, useState } from 'react';
import { View, Animated, LayoutRectangle } from 'react-native';
import { Svg, Rect, Text } from 'react-native-svg';
import {
	HandlerStateChangeEvent,
	State,
	TapGestureHandlerEventPayload,
	PanGestureHandler,
	GestureEvent,
	PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedText = Animated.createAnimatedComponent(Text);
const bottomTextOffset = 14;

const columns = [
	{ id: 1, value: 4, label: '18' },
	{ id: 2, value: 20, label: '29' },
	{ id: 3, value: 3, label: '10' },
	{ id: 4, value: 14, label: '22' },
	{ id: 5, value: 40, label: '2' },
	{ id: 6, value: 1, label: '2' },
	// { id: 7, value: 4, label: '2' },
	// { id: 8, value: 4, label: '2' },
	// { id: 9, value: 4, label: '2' },
	// { id: 10, value: 4, label: '2' },
];

const DrawColumnGraph = () => {
	const columnHorizontalMargin = 4;
	const columMaxWidth = 35;

	let columnWidth: number;
	let columnWidthWithMargin: number = 0;

	const [panOffsetX, setPanOffsetX] = useState<number | null>(null);
	const [containerLayout, setContainerLayout] = useState<LayoutRectangle>();
	const [highestValue, setHighestValue] = useState<number>();

	useEffect(() => {
		const values = columns.map(column => column.value);
		const highestValue = Math.max(...values);
		setHighestValue(highestValue);
	}, []);

	const onPanRelease = (event: HandlerStateChangeEvent<TapGestureHandlerEventPayload>) => {
		if (event.nativeEvent.state === State.END) {
			setPanOffsetX(null);
		}
	};

	const onPan = (event: GestureEvent<PanGestureHandlerEventPayload>) => {
		if (event.nativeEvent.state === State.ACTIVE) {
			setPanOffsetX(Number(event.nativeEvent.x.toFixed(0)));
		}
	};
	if (containerLayout?.width) {
		columnWidth = containerLayout?.width / columns.length;
		columnWidthWithMargin = columnWidth - columnHorizontalMargin * 2;
		columnWidthWithMargin = columnWidthWithMargin > columMaxWidth ? columMaxWidth : columnWidthWithMargin;
	}

	return (
		<PanGestureHandler onGestureEvent={event => onPan(event)} onHandlerStateChange={event => onPanRelease(event)}>
			<View onLayout={event => setContainerLayout(event.nativeEvent.layout)}>
				{containerLayout && highestValue && columnWidthWithMargin ? (
					<Svg height="100%" width="100%">
						{columns.map((column, index) => {
							const spacesOffset =
								(containerLayout?.width - columns.length * columnWidthWithMargin) / (columns.length + 1);
							const columnHeight = ((containerLayout?.height - 15 - bottomTextOffset) * column.value) / highestValue;

							return (
								<Column
									key={column.id}
									width={columnWidthWithMargin}
									height={columnHeight < 0 ? 0 : columnHeight}
									xOffset={spacesOffset * (index + 1) + columnWidthWithMargin * index}
									yOffset={containerLayout.height - columnHeight}
									panOffsetX={panOffsetX}
									index={index}
									value={column.value}
									label={column.label}
								/>
							);
						})}
					</Svg>
				) : null}
			</View>
		</PanGestureHandler>
	);
};

interface IColumn {
	height: number;
	panOffsetX: number | null;
	width: number;
	xOffset: number;
	yOffset: number;
	index: number;
	hoverColor?: string;
	idleColor?: string;
	value: number;
	label: string;
}

const Column: React.FC<IColumn> = ({ panOffsetX, width, xOffset, yOffset, height, index, value, label }) => {
	const [isTouched, setIsTouched] = useState(false);
	const heightAnim = useRef(new Animated.Value(0)).current;
	const opacityTextValueAnim = useRef(new Animated.Value(0)).current;
	const opacityTextLabelAnim = useRef(new Animated.Value(0)).current;
	// const sizeTextAnimInter = sizeTextAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 12] });
	// const heightOffset = height - 15 < 0 ? 5 : 0;
	// const textPadding = heightOffset === 5 ? 8 : 0;
	// const heightAfterOffset = height - 15 < 0 ? heightOffset : height - 15;
	const heightAnimInter = heightAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [height + yOffset, yOffset - bottomTextOffset],
	});

	useEffect(() => {
		if (panOffsetX && panOffsetX > xOffset && panOffsetX < xOffset + width) {
			setIsTouched(true);
		} else {
			setIsTouched(false);
		}
	}, [panOffsetX]);

	useEffect(() => {
		if (isTouched) {
			Animated.timing(opacityTextValueAnim, { useNativeDriver: true, toValue: 1, duration: 150 }).start();
		} else {
			Animated.timing(opacityTextValueAnim, { useNativeDriver: true, toValue: 0, duration: 300 }).start();
		}
	}, [isTouched]);

	useEffect(() => {
		setTimeout(() => {
			Animated.spring(heightAnim, { useNativeDriver: true, toValue: 1, bounciness: 17 }).start();
			Animated.timing(opacityTextLabelAnim, { useNativeDriver: true, toValue: 1, duration: 200 }).start();
		}, index * 100);
	}, []);

	return (
		<Svg>
			<AnimatedRect x={xOffset} y={heightAnimInter} width={width} height={height} rx={2} fill={'red'} />
			<AnimatedText
				fill="blue"
				opacity={opacityTextValueAnim}
				fontSize={12}
				x={xOffset + width / 2 - 1}
				y={yOffset - 4 - bottomTextOffset}
				textAnchor="middle">
				{value}
			</AnimatedText>
			<AnimatedText
				opacity={opacityTextLabelAnim}
				fill="blue"
				fontSize={12}
				x={xOffset + width / 2 - 1}
				y={height + yOffset}
				textAnchor="middle">
				{label}
			</AnimatedText>
		</Svg>
	);
};

export default DrawColumnGraph;
