import React, { useMemo, useState } from 'react';
import { View, Text, LayoutRectangle, ScrollView, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
	interpolate,
	useAnimatedGestureHandler,
	useAnimatedStyle,
	useSharedValue,
} from 'react-native-reanimated';
import { GestureDetector, Gesture, PanGestureHandler } from 'react-native-gesture-handler';

const circleSize = 50;
const circleSizeMiddleMultiplier = 1.5;

const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;
const invlerp = (x: number, y: number, a: number) => clamp((a - x) / (y - x));
const clamp = (a: number, min = 0, max = 1) => Math.min(max, Math.max(min, a));
const range = (x1: number, y1: number, x2: number, y2: number, a: number) => lerp(x2, y2, invlerp(x1, y1, a));

interface ICircle {
	size: number;
	index: number;
	widthMargin: number;
	heightMargin: number;
}

const Circle: React.FC<ICircle> = ({ size, index, widthMargin, heightMargin }) => {
	const circleSize = index === 94 ? size * 2 : size;
	return (
		<View
			style={{
				width: circleSize,
				height: circleSize,
				backgroundColor: 'gray',
				borderRadius: circleSize / 2,
				alignItems: 'center',
				justifyContent: 'center',
				marginHorizontal: widthMargin,
				marginVertical: heightMargin,
			}}>
			<Text>{index}</Text>
		</View>
	);
};

const WatchScroll = () => {
	const { top, bottom } = useSafeAreaInsets();
	const [layout, setLayout] = useState<LayoutRectangle>();
	const circleX = useSharedValue(50);
	const circleY = useSharedValue(50);

	const scaleCircleByDistanceFromMiddle = (index: number, count: number) => {
		const middleIndex = count / 2;
		const indexInter = interpolate(index, [0, middleIndex, count], [0.5, circleSizeMiddleMultiplier, 0.5]);
		return circleSize * indexInter;
	};

	const [circleCount, circleWidthMargin, circleHeightMargin] = useMemo<
		[number | null, number | null, number | null]
	>(() => {
		if (layout) {
			const height = layout.height - top - bottom;
			const width = layout.width;
			// Width
			const circleWidthCountFloat = width / circleSize;
			const circleWidthCountInt = Math.floor(circleWidthCountFloat);
			const widthMargin = (circleWidthCountFloat - circleWidthCountInt) * circleSize;
			const widthMarginForEachCircle = widthMargin / circleWidthCountInt / 2;
			// Height
			const circleHeightCountFloat = height / circleSize;
			const circleHeightCountInt = Math.floor(circleHeightCountFloat);
			const heightMargin = (circleHeightCountFloat - circleHeightCountInt) * circleSize;
			const heightMarginForEachCircle = heightMargin / circleHeightCountInt / 2;

			return [
				circleWidthCountInt * circleHeightCountInt,
				widthMarginForEachCircle - 0.00001,
				heightMarginForEachCircle - 0.00001,
			];
		} else {
			return [null, null, null];
		}
	}, [layout]);

	const renderCircles =
		circleCount && circleWidthMargin && circleHeightMargin
			? Array(circleCount)
					.fill(null)
					.map((v, i) => (
						<Circle
							size={scaleCircleByDistanceFromMiddle(i, circleCount)}
							widthMargin={circleWidthMargin}
							heightMargin={circleHeightMargin}
							index={i}
						/>
					))
			: null;

	const gestureHandler = useAnimatedGestureHandler({
		onStart: event => {
			console.log('event', event);
		},
		onActive: event => {
			circleX.value = event.absoluteX;
			circleY.value = event.absoluteY;
			console.log('event', event);
		},
		onEnd: event => {
			circleX.value = event.absoluteX;
			circleY.value = event.absoluteY;
			console.log('event', event);
		},
	});

	const animatedStyle = useAnimatedStyle<ViewStyle>(() => {
		return {
			top: circleY.value - 75 / 2,
			left: circleX.value - 75 / 2,
		};
	});

	return (
		// <ScrollView contentContainerStyle={{ height: 1000 }} style={{height: 1000}}  >
		<View
			style={{
				flexDirection: 'row',

				alignItems: 'center',
				justifyContent: 'center',
				flex: 1,
				backgroundColor: 'red',
				paddingTop: top,
				paddingBottom: bottom,
			}}
			onLayout={event => setLayout(event.nativeEvent.layout)}>
			<PanGestureHandler onGestureEvent={gestureHandler}>
				<Animated.View
					style={[
						{
							width: 75,
							height: 75,
							backgroundColor: 'gray',
							borderRadius: 75 / 2,
							padding: 0,
							alignItems: 'center',
							justifyContent: 'center',
              position: 'absolute'
						},
						animatedStyle,
					]}>
					<Text>Animated</Text>
				</Animated.View>
			</PanGestureHandler>
			{/* {renderCircles} */}
		</View>
		// </ScrollView>
	);
};

export default WatchScroll;
