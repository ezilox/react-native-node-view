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
import Shape from './components/Shape';
import Map, { IShape } from './components/Map';
import ShapeMaker from './components/ShapeMaker';

const SHAPE_MOVE_SENSITIVE = 25;

export interface Props {}

const MapMaker: React.FC<Props> = ({}) => {
	const [savedShapes, saveShape] = useState<Array<Array<string>>>([]);
	const [shapeLayout, setShapeLayout] = useState<Array<LayoutRectangle>>([]);
	const [mapLayout, setMapLayout] = useState<LayoutRectangle | null>(null);
	const [selectedShape, setSelectedShape] = useState<number | null>(null);
	const [showMap, setShowMap] = useState(false);
	const [mapShapes, setMapShapes] = useState<Array<IShape>>([]);
	const [isShapeOnMap, setIsShapeOnMap] = useState(false);
	const placeShapeTimeout = useRef<any>({ value: false }).current;
	const currentShapePosition = useRef({ value: { x: 0, y: 0 } }).current;
	const shapeContainer = useRef({ value: { x: 0, y: 0 } }).current;
	const appendShape = (rects: Array<string>) => {
		const tempData = [...savedShapes];
		tempData.push(rects);
		saveShape(tempData);
	};
	const WIDTH = 300;
	const HEIGHT = 300;

	useEffect(() => {
		if (isShapeOnMap) {
			placeShapeTimeout.value = setTimeout(
				() =>
					selectedShape !== null &&
					appendShapeToMap({
						rect: savedShapes[selectedShape],
						layout: shapeLayout[selectedShape],
						position: currentShapePosition.value,
					}),
				100
			);
		} else {
			placeShapeTimeout.value && clearTimeout(placeShapeTimeout.value);
		}
	}, [isShapeOnMap]);

	const appendShapeToMap = (shape: IShape) => {
		const tempData = [...mapShapes];
		tempData.push(shape);
		setMapShapes(tempData);
	};

	const appendLayoutToShapeLayout = (layout: LayoutRectangle) => {
		const tempData = [...shapeLayout];
		tempData.push(layout);
		setShapeLayout(tempData);
	};

	const handleMapLayout = (event: LayoutRectangle) => {
		setMapLayout(event);
	};

	const shapeX = useRef(new Animated.Value(0)).current;
	const shapeY = useRef(new Animated.Value(0)).current;

	const check = (event: GestureEvent<PanGestureHandlerEventPayload>) => {
		if (
			mapLayout &&
			event.nativeEvent.absoluteX > mapLayout.x &&
			event.nativeEvent.absoluteX < mapLayout.x + mapLayout.width &&
			event.nativeEvent.absoluteY > mapLayout.y &&
			event.nativeEvent.absoluteY < mapLayout.y + mapLayout.height &&
			event.nativeEvent.velocityX < SHAPE_MOVE_SENSITIVE &&
			event.nativeEvent.velocityY < SHAPE_MOVE_SENSITIVE
		) {
			currentShapePosition.value = {
				x: event.nativeEvent.absoluteX - event.nativeEvent.x,
				y: event.nativeEvent.absoluteY - event.nativeEvent.y,
			};
			!isShapeOnMap && setIsShapeOnMap(true);
		} else {
			isShapeOnMap && setIsShapeOnMap(false);
		}
	};

	const onPanShape = Animated.event([{ nativeEvent: { translationX: shapeX, translationY: shapeY } }], {
		useNativeDriver: true,
		listener: check,
	});

	const onReleaseShape = () => {
		Animated.parallel([
			Animated.spring(shapeX, { toValue: 0, bounciness: 10, useNativeDriver: true }),
			Animated.spring(shapeY, { toValue: 0, bounciness: 10, useNativeDriver: true }),
		]).start();
	};

	const onPanHandlerStateChange = (event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
		if (event.nativeEvent.state === State.END) {
			onReleaseShape();
		}
	};

	const onShapeTap = (event: HandlerStateChangeEvent<TapGestureHandlerEventPayload>, index: number) => {
		if (event.nativeEvent.state === State.BEGAN) {
			setSelectedShape(index);
		}
	};

	return (
		<Animated.View
			style={{
				flex: 1,
				marginTop: 50,
			}}>
			{showMap ? (
				<Map updateShapes={setMapShapes} shapes={mapShapes} onLayout={handleMapLayout} />
			) : (
				<ShapeMaker mode="edit" onSaveShape={rects => appendShape(rects)} />
			)}
			<View
				onLayout={event => (shapeContainer.value = { x: event.nativeEvent.layout.x, y: event.nativeEvent.layout.y })}
				style={{
					flexDirection: 'row',
					marginTop: 50,
					flexWrap: 'wrap',
					alignItems: 'center',
					backgroundColor: 'lightyellow',
				}}>
				{savedShapes.map((shape, index) => (
					<PanGestureHandler key={index} onGestureEvent={onPanShape} onHandlerStateChange={onPanHandlerStateChange}>
						<Animated.View
							style={{
								transform: [
									{ translateX: selectedShape === index ? shapeX : 0 },
									{ translateY: selectedShape === index ? shapeY : 0 },
								],
							}}>
							<TapGestureHandler onHandlerStateChange={event => onShapeTap(event, index)}>
								<Animated.View onLayout={event => appendLayoutToShapeLayout(event.nativeEvent.layout)}>
									<Shape shapeMargin={false} pressedRect={shape} />
								</Animated.View>
							</TapGestureHandler>
						</Animated.View>
					</PanGestureHandler>
				))}
			</View>
			<View style={{ position: 'absolute', bottom: 40 }}>
				<Button title="show map" onPress={() => setShowMap(!showMap)} />
			</View>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
});

export default MapMaker;
