import React, { useState, useRef, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Pressable,
	Animated,
	ImageStyle,
	LayoutRectangle,
  ImageBackground,
  Easing
} from 'react-native';

interface IBubbles {
	images: Array<IImage>;
}

interface IImage {
	imageUri: string;
	imageStyle?: ImageStyle;
	key: string | number;
}

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

const Bubbles: React.FC<IBubbles> = ({ images }) => {
	// const image = images[0];
	const [viewLayout, setViewLayout] = useState<LayoutRectangle | null>(null);

	return (
		<View onLayout={event => setViewLayout(event.nativeEvent.layout)} style={[StyleSheet.absoluteFill]}>
			{viewLayout &&
				images.map(image => (
					<BubbleImage
						key={image.key}
						viewLayout={viewLayout}
						imageUri={image.imageUri}
						imageStyle={image.imageStyle}
					/>
				))}
		</View>
	);
};

interface IBubbleImage {
	viewLayout: LayoutRectangle;
	imageUri: string;
	imageStyle?: ImageStyle;
}

const BubbleImage: React.FC<IBubbleImage> = ({ viewLayout, imageStyle, imageUri }) => {
	const imageInitPosition = useRef(randomIntFromInterval(0, viewLayout.width)).current;
	const translateY = useRef(new Animated.Value(0)).current;
	const translateYInter = translateY.interpolate({ inputRange: [0, 1], outputRange: [0, -viewLayout.height] });
	const translateX = useRef(new Animated.Value(0)).current;
	const translateXInter = translateX.interpolate({
		inputRange: [0, 1],
		outputRange: [0, -imageInitPosition],
	});
	const scale = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		movingUpAnimation();
		movingSideAnimation();
	}, []);

	const movingUpAnimation = () => {
		Animated.sequence([
			Animated.timing(translateY, {
				useNativeDriver: true,
				toValue: randomIntFromInterval(0, 0.3),
        duration: randomIntFromInterval(4000, 11000),
        easing: Easing.elastic(1)
			}),
			Animated.timing(translateY, {
				useNativeDriver: true,
				toValue: randomIntFromInterval(0.3, 0.6),
        duration: randomIntFromInterval(4000, 12000),
        easing: Easing.elastic(1)
			}),
			Animated.timing(translateY, {
				useNativeDriver: true,
				toValue: randomIntFromInterval(0.6, 1),
        duration: randomIntFromInterval(4000, 11000),
        easing: Easing.elastic(1)
			}),
			Animated.timing(translateY, {
				useNativeDriver: true,
				toValue: 1,
        duration: randomIntFromInterval(4000, 12000),
        easing: Easing.elastic(1)
			}),
		]).start();
	};

	const movingSideAnimation = () => {
		Animated.sequence([
			Animated.timing(translateX, {
				useNativeDriver: true,
				toValue: randomIntFromInterval(-0.3, 0),
        duration: randomIntFromInterval(3000, 5000),
        easing: Easing.elastic(1)
			}),
			Animated.timing(translateX, { useNativeDriver: true, toValue: 0, duration: 4000 }),
			Animated.timing(translateX, {
				useNativeDriver: true,
				toValue: randomIntFromInterval(0, 0.5),
        duration: randomIntFromInterval(3000, 5000),
        easing: Easing.elastic(1)
			}),
			Animated.timing(translateX, {
				useNativeDriver: true,
				toValue: randomIntFromInterval(0.5, 0.7),
        duration: randomIntFromInterval(3000, 5000),
        easing: Easing.elastic(1)
			}),
			Animated.timing(translateX, { useNativeDriver: true, toValue: 0.5, duration: 5000 }),
		]).start();
	};

	const scaleDown = () => {
		Animated.spring(scale, {
			useNativeDriver: true,
			bounciness: 3,
      toValue: 0,
		}).start();
	};

	return (
		<AnimatedImageBackground
			source={{ uri: imageUri }}
			style={[
				{
					width: 50,
					height: 50,
					position: 'absolute',
					bottom: 0,
					left: imageInitPosition,
					transform: [{ translateY: translateYInter }, { translateX: translateXInter }, { scale: scale }],
					opacity: 0.95,
				},
				imageStyle,
			]}>
			<Pressable style={{ flex: 1 }} onPress={scaleDown} />
		</AnimatedImageBackground>
	);
};

const randomIntFromInterval = (min: number, max: number) => {
	const ran = Math.random() * (max - min) + min;
	console.log('from', min, max, 'got', ran);

	return ran;
};

export default Bubbles;
