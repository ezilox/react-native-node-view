import React, { useState, useRef } from 'react';
import { View, Text, LayoutRectangle, Animated } from 'react-native';
import {
	PanGestureHandler,
	PanGestureHandlerEventPayload,
	GestureEvent,
	TapGestureHandler,
	TapGestureHandlerEventPayload,
	State,
	HandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import Svg, { Rect } from 'react-native-svg';
import Shape from './Shape';

interface IMap {
	onLayout: (layout: LayoutRectangle) => void;
	shapes: Array<IShape>;
	updateShapes: (newShapes: Array<IShape>) => void;
}

export interface IShape {
	rect: Array<string>;
	position: position;
	layout: LayoutRectangle;
}

interface position {
	x: number;
	y: number;
}

const Map: React.FC<IMap> = ({ onLayout, shapes = [], updateShapes }) => {
	const shapeX = useRef(new Animated.Value(0)).current;
	const shapeY = useRef(new Animated.Value(0)).current;

	const [mapLayout, setMapLayout] = useState<LayoutRectangle | null>(null);

	const mapLayoutHandler = (layout: LayoutRectangle) => {
		setMapLayout(layout);
		onLayout(layout);
	};

	const [selectedShape, setSelectedShape] = useState<number | null>(null);

	const allowShapeTranslateY =
		selectedShape !== null && mapLayout
			? [-shapes[selectedShape].position.y, 0, mapLayout.height - shapes[selectedShape].position.y]
			: [0, 1];

	const shapeYInter = shapeY.interpolate({
		inputRange: allowShapeTranslateY,
		outputRange: allowShapeTranslateY,
		extrapolate: 'clamp',
	});

	const onPanShape = Animated.event([{ nativeEvent: { translationX: shapeX, translationY: shapeY } }], {
		useNativeDriver: true,
	});

	const onPanRelease = (event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
		if (event.nativeEvent.state === State.END) {
			if (selectedShape !== null && mapLayout) {
				const tempShapes = [...shapes];

				tempShapes[selectedShape].position = {
					x: shapes[selectedShape].position.x + event.nativeEvent.translationX,
					y:
						event.nativeEvent.translationY > 0
							? Math.min(shapes[selectedShape].position.y + event.nativeEvent.translationY, mapLayout.height)
							: Math.max(shapes[selectedShape].position.y + event.nativeEvent.translationY, 50),
				};
				updateShapes(tempShapes);
			}
			shapeX.setValue(0);
			shapeY.setValue(0);
		}
	};

	const onShapeTap = (event: HandlerStateChangeEvent<TapGestureHandlerEventPayload>, index: number) => {
		if (event.nativeEvent.state === State.BEGAN) {
			setSelectedShape(index);
		}
	};
	return (
		<View style={{ height: 300, width: 400 }}>
			<View
				onLayout={event => mapLayoutHandler(event.nativeEvent.layout)}
				style={{
					width: 400,
					height: 300,
					backgroundColor: 'lightgray',
					// margin: 8,
					position: 'absolute',
					// flexDirection: 'row',
					// flexWrap: 'wrap',
					// alignItems: 'flex-start',
					// justifyContent: 'flex-start',
				}}>
				{shapes.map((shape, index) => (
					<View
						key={index.toString() + shape.toString()}
						style={{
							position: 'absolute',
							top: shape.position.y - 50,
							left: shape.position.x,
						}}>
						<PanGestureHandler onHandlerStateChange={onPanRelease} onGestureEvent={onPanShape}>
							<Animated.View>
								<TapGestureHandler onHandlerStateChange={event => onShapeTap(event, index)}>
									<Animated.View
										style={{
											transform: [
												{
													translateY: selectedShape === index ? shapeYInter : 0,
												},
												{
													translateX: selectedShape === index ? shapeX : 0,
												},
											],
										}}>
										<Shape shapeMargin={false} pressedRect={shape.rect} />
									</Animated.View>
								</TapGestureHandler>
							</Animated.View>
						</PanGestureHandler>
					</View>
				))}
			</View>
		</View>
	);
};

export default Map;
