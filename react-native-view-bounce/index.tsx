import React, { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import {
	TapGestureHandler,
	HandlerStateChangeEvent,
	TapGestureHandlerEventPayload,
	State,
} from 'react-native-gesture-handler';

interface Props {
	children: JSX.Element;
	enabled: boolean;
}

const ViewBounce: React.FC<Props> = ({ children, enabled }) => {
	const bounceAnim = useRef(new Animated.Value(0)).current;
	const [isEnabled, setEnables] = useState(enabled);

	useEffect(() => {
		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(bounceAnim, { useNativeDriver: true, duration: 500, toValue: 1.3 }),
				Animated.timing(bounceAnim, { useNativeDriver: true, duration: 500, toValue: 1, delay: 200 }),
			])
		);
		if (isEnabled) {
			animation.start();
		} else {
			animation.stop();
			Animated.timing(bounceAnim, { useNativeDriver: true, duration: 500, toValue: 1, delay: 100 }).start();
		}
	}, [isEnabled]);

	const onPress = (event: HandlerStateChangeEvent<TapGestureHandlerEventPayload>) => {
		if (event.nativeEvent.state === State.ACTIVE) {
			setEnables(false);
		}
	};

	return (
		<TapGestureHandler onHandlerStateChange={onPress}>
			<Animated.View style={{ transform: [{ scale: bounceAnim }] }}>{children}</Animated.View>
		</TapGestureHandler>
	);
};

export default ViewBounce;
