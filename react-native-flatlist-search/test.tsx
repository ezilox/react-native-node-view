import Animated, {
	useSharedValue,
	withTiming,
	useAnimatedStyle,
	Easing,
	useAnimatedScrollHandler,
	interpolate,
	Extrapolate,
	useDerivedValue,
	runOnUI,
	runOnJS,
	useAnimatedReaction,
} from 'react-native-reanimated';
import { View, Button, FlatList, Text, FlatListProps } from 'react-native';
import React, { useState } from 'react';
import { TextInput } from 'react-native-gesture-handler';

const data = [
	{ id: '1', title: 'Excepteur cupidatat cillum Lorem enim minim et labore Lorem sint.' },
	{ id: '11', title: 'Magna exercitation adipisicing cillum commodo.' },
	{
		id: '111',
		title:
			'Magna ex exercitation quis sint culpa fugiat eiusmod consequat aliqua laboris nostrud anim aliqua pariatur.',
	},
	{ id: '1111', title: 'Exercitation exercitation proident sint occaecat mollit.' },
	{ id: '11111', title: 'Officia fugiat et consectetur ad deserunt do laborum laboris mollit.' },
];
const AnimatedFlatList = Animated.createAnimatedComponent<FlatListProps<IItem>>(FlatList);
export const AnimatedStyleUpdateExample = () => {
	const searchBarHeight = 55;
	const translationY = useSharedValue(0);
	const paddingTranslationY = useSharedValue(0);
	const [isSearchBarOpen, setIsSearchOpen] = useState(false);
	const [shouldCloseSearchBar, setShouldCloseSearchBar] = useState(false);

	useDerivedValue(() => {
		if (translationY.value < -searchBarHeight / 2) {
			!isSearchBarOpen && runOnJS(setIsSearchOpen)(true);
		}
		if (translationY.value < -searchBarHeight && paddingTranslationY.value !== -searchBarHeight) {
			paddingTranslationY.value = -searchBarHeight;
		}
	}, [isSearchBarOpen]);

	const scrollHandler = useAnimatedScrollHandler(event => {
		// console.log('event', event.contentOffset.y);

		translationY.value = event.contentOffset.y;
	});

	const style = useAnimatedStyle(() => {
		const offset = paddingTranslationY.value + translationY.value;
		const translationYInter = interpolate(offset, [-searchBarHeight, 0, searchBarHeight], [searchBarHeight, 0, 0], {
			extrapolateLeft: Extrapolate.CLAMP,
		});
		return {
			height: translationYInter,
		};
	});

	const closeSearchBar = () => {
		paddingTranslationY.value = withTiming(
			0,
			{ duration: 150, easing: Easing.linear },
			isFinished => isFinished && runOnJS(setIsSearchOpen)(false)
		);
	};

	const onEndScroll = () => {
		if (!searchBarHeight) {
			return false;
		}
		if (translationY.value > searchBarHeight / 5) {
			closeSearchBar();
		}
		console.log(translationY.value);
	};

	return (
		<View
			style={{
				marginTop: 100,
			}}>
			<Animated.View style={[{ width: '100%', backgroundColor: 'lightgray' }, style]}>
				<TextInput placeholder="Search" style={{ backgroundColor: 'gray', flex: 1, borderRadius: 8 }} />
			</Animated.View>

			<AnimatedFlatList
				onScroll={scrollHandler}
				onScrollEndDrag={onEndScroll}
				scrollEventThrottle={4}
				style={{ backgroundColor: 'gray', height: 300 }}
				renderItem={({ item }) => <Item {...item} />}
				data={data}
				keyExtractor={item => item.id}
				overScrollMode="never"
			/>
		</View>
	);
};

interface IItem {
	id: string;
	title: string;
}

const Item: React.FC<IItem> = ({ id, title }) => {
	return (
		<View style={{ borderWidth: 1, borderColor: 'lightgray', padding: 8 }}>
			<Text>{title}</Text>
		</View>
	);
};
