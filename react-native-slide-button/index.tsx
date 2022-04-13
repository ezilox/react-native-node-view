import React, { useEffect, useRef, useState } from 'react';
import { View, Text, LayoutRectangle } from 'react-native';
import Animated, {
	interpolate,
	runOnJS,
	useAnimatedGestureHandler,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { PanGestureHandler, TapGestureHandler } from 'react-native-gesture-handler';

const containerDefaultWidth = 20;
const containerDefaultHeight = 20;

interface Props {
	onPress: () => void;
}

const SlideButton: React.FC<Props> = ({ onPress }) => {
	const [containerLayout, setContainerLayout] = useState<LayoutRectangle>();
	const [triggerWhenRelease, setTriggerWhenRelease] = useState(false);
	const blurViewTranslateAnim = useSharedValue(0);
	const textTranslateAnim = useSharedValue(0);
	const panGestureRef = useRef(null);

	const containerWidth = containerLayout?.width ?? containerDefaultWidth;
	const containerHeight = containerLayout?.height ?? containerDefaultHeight;

	const gradientWidth = containerWidth * 0.2;
	const gradientHeight = containerHeight * 0.4;

	const gradientCenterColor = 'rgba(255,0,0,0.8)';
	const gradientSideColor = 'rgba(255,0,0,0.0)';

	const releaseText = 'Release To ...';

	const onTapTextTranslateX = containerWidth * 0.05;

	const blurViewStyle = useAnimatedStyle(() => {
		const translateInter = interpolate(
			blurViewTranslateAnim.value,
			[0, 1],
			[-containerWidth / 2, containerWidth / 2 - gradientWidth]
		);
		return { transform: [{ translateX: translateInter }] };
	});

	const textStyle = useAnimatedStyle(() => {
		return { transform: [{ translateX: textTranslateAnim.value }] };
	});

	const releaseTextStyle = useAnimatedStyle(() => {
		const opacityInter = interpolate(
			textTranslateAnim.value,
			[0, containerWidth / 2 - containerWidth * 0.1, containerWidth / 2],
			[0, 0, 1]
		);
		if (opacityInter >= 1) {
			runOnJS(setTriggerWhenRelease)(true);
		} else {
			runOnJS(setTriggerWhenRelease)(false);
		}
		return { opacity: opacityInter };
	}, [containerWidth]);

	const startTranslateAnimation = () => {
		blurViewTranslateAnim.value = withTiming(1, { duration: 2000 }, () => {
			blurViewTranslateAnim.value = 0;
			runOnJS(startTranslateAnimation)();
		});
	};

	const onTap = useAnimatedGestureHandler({
		onActive: () => {
			textTranslateAnim.value = withTiming(
				onTapTextTranslateX,
				{ duration: 250 },
				() => (textTranslateAnim.value = withTiming(0, { duration: 200 }))
			);
		},
	});
	const onPan = useAnimatedGestureHandler({
		onActive: event => {
			textTranslateAnim.value = event.translationX;
		},
		onEnd: event => {
			if (event.velocityX > 550 || triggerWhenRelease) {
				textTranslateAnim.value = withTiming(5000, { duration: 400 });
				runOnJS(onPress)();
			} else {
				textTranslateAnim.value = withTiming(0, { duration: 400 });
			}
		},
	});

	useEffect(() => {
		startTranslateAnimation();
	}, []);

	return (
		<TapGestureHandler waitFor={panGestureRef} onGestureEvent={onTap}>
			<Animated.View>
				<PanGestureHandler ref={panGestureRef} onGestureEvent={onPan}>
					<Animated.View
						onLayout={event => setContainerLayout(event.nativeEvent.layout)}
						style={{
							width: 300,
							backgroundColor: 'red',
							height: 50,
							borderRadius: 8,
							alignItems: 'center',
							justifyContent: 'center',
							position: 'relative',
							overflow: 'hidden',
						}}>
						<Animated.Text style={[textStyle]}>{`> Hello Hello Hello`}</Animated.Text>
						<Animated.Text style={[{ position: 'absolute' }, releaseTextStyle]}>{releaseText}</Animated.Text>

						<Animated.View
							style={[
								{
									borderRadius: 20,
									position: 'absolute',
									width: gradientWidth,
									height: gradientHeight,
									left: '50%',
								},
								blurViewStyle,
							]}>
							<LinearGradient
								start={{ x: 0.0, y: 0.5 }}
								end={{ x: 1, y: 0.5 }}
								colors={[gradientSideColor, gradientCenterColor, gradientSideColor]}
								style={{ width: '100%', height: '100%' }}
							/>
						</Animated.View>
					</Animated.View>
				</PanGestureHandler>
			</Animated.View>
		</TapGestureHandler>
	);
};

export default SlideButton;
