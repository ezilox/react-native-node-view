import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TextProps } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

interface Props {
	score: number;
}

const Score: React.FC<Props> = ({ score }) => {
	return (
		<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
			{Array.from(String(score), Number).map((number, index) => {
				return <ScoreNumber key={`${number}-${index}`} number={Number(number)} />;
			})}
		</View>
	);
};

const numbers = [
	{ id: '0', value: 0 },
	{ id: '1', value: 1 },
	{ id: '2', value: 2 },
	{ id: '3', value: 3 },
	{ id: '4', value: 4 },
	{ id: '5', value: 5 },
	{ id: '6', value: 6 },
	{ id: '7', value: 7 },
	{ id: '8', value: 8 },
	{ id: '9', value: 9 },
];

interface ScoreNumberProps {
	number: number;
}

const ScoreNumber: React.FC<ScoreNumberProps> = ({ number }) => {
	const scrollValue = useRef(new Animated.Value(0)).current;
	const flatlistRef: any = useRef();

	const onScrollAnim = Animated.event([{ nativeEvent: { contentOffset: { y: scrollValue } } }], {
		useNativeDriver: true,
	});

	const renderItem = ({ item, index }: any) => (
		<TextScroll index={index} number={item.value} scrollValue={scrollValue} style={{ fontSize: 24 }} />
	);

	useEffect(() => {
		if (Number.isInteger(number) && flatlistRef.current) {
			flatlistRef?.current.scrollToIndex({ index: number });
		}
	}, [flatlistRef.current]);

	return (
		<View>
			<AnimatedFlatList
				ref={flatlistRef}
				onScroll={onScrollAnim}
				scrollEnabled={false}
				style={{ height: 25 }}
				keyExtractor={item => item.id}
				renderItem={renderItem}
				data={numbers}
				showsVerticalScrollIndicator={false}
				getItemLayout={(data, index) => ({ length: 25, offset: 25 * index, index })}
			/>
		</View>
	);
};

interface TextScroll extends TextProps {
	number: number;
	scrollValue: Animated.Value;
	index: number;
}

const TextScroll: React.FC<TextScroll> = ({ number, index, scrollValue, ...props }) => {
	const itemSize = 25;
	const centerPoint = index * itemSize;

	const opacity = scrollValue.interpolate({
		inputRange: [centerPoint - itemSize, centerPoint, centerPoint + itemSize],
		outputRange: [0.2, 1, 0.2],
	});

	const scale = scrollValue.interpolate({
		inputRange: [centerPoint - itemSize, centerPoint, centerPoint + itemSize],
		outputRange: [0.4, 1, 0.4],
	});

	return (
		<View style={{ height: 25, justifyContent: 'center', alignItems: 'center' }}>
			<Animated.Text
				{...props}
				style={[{ opacity: opacity, transform: [{ scale: scale }], textAlign: 'center' }, props.style]}>
				{number}
			</Animated.Text>
		</View>
	);
};

export default Score;
