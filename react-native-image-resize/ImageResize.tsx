import React, { useEffect, useRef, useState } from 'react';
import { Image, View } from 'react-native';
import Animated, {
	runOnJS,
	useAnimatedGestureHandler,
	useAnimatedProps,
	useSharedValue,
} from 'react-native-reanimated';
import { Svg, Path, PathProps } from 'react-native-svg';
import { GestureEventPayload, PanGestureHandler, PanGestureHandlerEventPayload } from 'react-native-gesture-handler';
import { getDistanceBetweenPoints } from '../react-native-ploy-maker/utils';
import { manipulateAsync, FlipType, SaveFormat, ActionCrop, ImageResult } from 'expo-image-manipulator';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type Snap = 'body' | 'cornerTopLeft' | 'cornerTopRight' | 'cornerBottomLeft' | 'cornerBottomRight' | null;

interface Props {
	uri: string;
}

const ImageResize: React.FC<Props> = ({ uri }) => {
	const [imageOriginSize, setImageOriginSize] = useState<{ width: number; height: number }>();
	const [newImage, setNewImage] = useState<ImageResult>();
	const [snapElement, setSnapElement] = useState<Snap>(null);
	const imageWidth = 350;
	const imageHeight = 250;
	const imageRef = useRef<Image>(null);

	useEffect(() => {
		getImageOriginSize();
	}, [uri]);

	const getImageOriginSize = () => {
		Image.getSize(uri, (width, height) => {
			setImageOriginSize({ width: width, height: height });
		});
	};

	const translationX = useSharedValue(0);
	const translationY = useSharedValue(0);

	const coverCornerTopX = useSharedValue(0);
	const coverCornerTopY = useSharedValue(0);

	const coverCornerBottomX = useSharedValue(imageWidth);
	const coverCornerBottomY = useSharedValue(imageHeight);

	const rectAnimatedProps = useAnimatedProps<PathProps>(() => {
		const paddingOutline = 5;

		const outline = `M${-paddingOutline} ${-paddingOutline} L${imageWidth + paddingOutline} ${-paddingOutline} L${
			imageWidth + paddingOutline
		} ${imageHeight + paddingOutline} L${-paddingOutline} ${
			imageHeight + paddingOutline
		} L${-paddingOutline} ${-paddingOutline}`;
		return {
			d: `
      ${outline} 
      M${coverCornerTopX.value + translationX.value} 
      ${coverCornerTopY.value + translationY.value} 
      L${coverCornerBottomX.value + translationX.value}
      ${coverCornerTopY.value + translationY.value}
      L${coverCornerBottomX.value + translationX.value}
      ${coverCornerBottomY.value + translationY.value}
      L${coverCornerTopX.value + translationX.value}
      ${coverCornerBottomY.value + translationY.value}
      L${coverCornerTopX.value + translationX.value}
      ${coverCornerTopY.value + translationY.value}
      `,
		};
	}, [coverCornerTopX, coverCornerTopY, coverCornerBottomX, coverCornerBottomY]);

	const validateX = (x: number, oppositeX: number) => {
		const minimumDistance = 75;
		if (snapElement === 'cornerBottomRight' || snapElement === 'cornerTopRight') {
			if (x - oppositeX < minimumDistance) {
				return oppositeX + minimumDistance;
			}
		}
		if (snapElement === 'cornerBottomLeft' || snapElement === 'cornerTopLeft') {
			if (oppositeX - x < minimumDistance) {
				return oppositeX - minimumDistance;
			}
		}
		if (x < 0) {
			return 0;
		}
		if (x > imageWidth) {
			return imageWidth;
		}
		return x;
	};

	const validateY = (y: number, oppositeY: number) => {
		const minimumDistance = 75;

		if (snapElement === 'cornerBottomRight' || snapElement === 'cornerBottomLeft') {
			if (y - oppositeY < minimumDistance) {
				return oppositeY + minimumDistance;
			}
		}
		if (snapElement === 'cornerTopLeft' || snapElement === 'cornerTopRight') {
			if (oppositeY - y < minimumDistance) {
				return oppositeY - minimumDistance;
			}
		}
		if (y < 0) {
			return 0;
		}
		if (y > imageHeight) {
			return imageHeight;
		}
		return y;
	};

	const validateTranslateX = (topX: number, bottomX: number, translateX: number) => {
		if (topX + translateX < 0) {
			return -topX;
		}
		console.log(bottomX, translateX);

		if (bottomX + translateX > imageWidth) {
			return imageWidth - bottomX;
		}
		return translateX;
	};

	const onPanStart = (event: Readonly<GestureEventPayload & PanGestureHandlerEventPayload>) => {
		const distance = 30;

		if (getDistanceBetweenPoints(event.x, event.y, coverCornerTopX.value, coverCornerTopY.value) < distance) {
			setSnapElement('cornerTopLeft');
		} else if (getDistanceBetweenPoints(event.x, event.y, coverCornerBottomX.value, coverCornerTopY.value) < distance) {
			setSnapElement('cornerTopRight');
		} else if (
			getDistanceBetweenPoints(event.x, event.y, coverCornerBottomX.value, coverCornerBottomY.value) < distance
		) {
			setSnapElement('cornerBottomRight');
		} else if (getDistanceBetweenPoints(event.x, event.y, coverCornerTopX.value, coverCornerBottomY.value) < distance) {
			setSnapElement('cornerBottomLeft');
		} else {
			setSnapElement('body');
		}
	};

	const onPanActive = (event: Readonly<GestureEventPayload & PanGestureHandlerEventPayload>) => {
		const x = event.x + translationX.value;
		const y = event.y + translationY.value;
		// const validX = validateX(event.x + translationX.value);

		if (snapElement === 'cornerTopLeft') {
			coverCornerTopX.value = validateX(x, coverCornerBottomX.value);
			coverCornerTopY.value = validateY(y, coverCornerBottomY.value);
		} else if (snapElement === 'cornerTopRight') {
			coverCornerBottomX.value = validateX(x, coverCornerTopX.value);
			coverCornerTopY.value = validateY(y, coverCornerBottomY.value);
		} else if (snapElement === 'cornerBottomRight') {
			coverCornerBottomX.value = validateX(x, coverCornerTopX.value);
			coverCornerBottomY.value = validateY(y, coverCornerTopY.value);
		} else if (snapElement === 'cornerBottomLeft') {
			coverCornerTopX.value = validateX(x, coverCornerBottomX.value);
			coverCornerBottomY.value = validateY(y, coverCornerTopY.value);
		} else if (snapElement === 'body') {
			translationX.value = validateTranslateX(coverCornerTopX.value, coverCornerBottomX.value, event.translationX);
			translationY.value = event.translationY;
		}
	};

	const onPanEnd = (event: Readonly<GestureEventPayload & PanGestureHandlerEventPayload>) => {
		if (snapElement === 'body') {
			translationX.value = 0;
			translationY.value = 0;

			coverCornerTopX.value = validateX(coverCornerTopX.value + event.translationX, coverCornerBottomX.value);
			coverCornerTopY.value = validateY(coverCornerTopY.value + event.translationY, coverCornerBottomY.value);

			coverCornerBottomX.value = coverCornerBottomX.value + event.translationX;
			coverCornerBottomY.value = coverCornerBottomY.value + event.translationY;
		}
		setSnapElement(null);

		imageCrop();
	};

	const onPan = useAnimatedGestureHandler({
		onStart: event => {
			runOnJS(onPanStart)(event);
		},
		onActive: event => {
			runOnJS(onPanActive)(event);
		},
		onEnd: event => {
			runOnJS(onPanEnd)(event);
		},
	});

	const imageCrop = async () => {
		const originWidth = imageOriginSize?.width;
		const originHeight = imageOriginSize?.height;

		if (!originWidth || !originHeight) {
			return;
		}

		const width = (originWidth * Math.abs(coverCornerTopX.value - coverCornerBottomX.value)) / imageWidth;
		const height = (originHeight * Math.abs(coverCornerTopY.value - coverCornerBottomY.value)) / imageHeight;
		const originX = (originWidth * coverCornerTopX.value) / imageWidth;
		const originY = (originHeight * coverCornerTopY.value) / imageHeight;

		const crop: ActionCrop = {
			crop: { originX: originX, originY: originY, width: width, height: height },
		};
		const result = await manipulateAsync(uri, [crop], { compress: 1, format: SaveFormat.PNG });

		setNewImage(result);
	};

	return (
		<View style={{ flex: 1, backgroundColor: 'gray', justifyContent: 'center' }}>
			<PanGestureHandler onGestureEvent={onPan}>
				<Animated.View style={{ width: imageWidth, height: imageHeight, alignSelf: 'center' }}>
					<Image
						ref={imageRef}
						style={{ width: imageWidth, height: imageHeight }}
						onLoad={event => console.log('onLoad,', event.nativeEvent.source)}
						source={{ uri: uri }}
					/>
					<Svg style={{ position: 'absolute' }}>
						<AnimatedPath
							strokeLinecap={'square'}
							fill="gray"
							fillOpacity={0.8}
							fillRule={'evenodd'}
							stroke="white"
							strokeWidth={3}
							animatedProps={rectAnimatedProps}
						/>
					</Svg>
				</Animated.View>
			</PanGestureHandler>
			{newImage ? (
				<Image
					resizeMode="contain"
					style={{ width: imageWidth, height: imageHeight, alignSelf: 'center', marginTop: 10 }}
					source={{ uri: newImage.uri }}
				/>
			) : null}
		</View>
	);
};

export default ImageResize;
