import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { View, FlatList, Text, Animated, Easing, TextInput, FlatListProps } from 'react-native';

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

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

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

interface ISearchBox {
	animValue: Animated.Value;
}

const SearchBox = React.forwardRef<any, ISearchBox>(({ animValue }, ref) => {
	const searchBarHeight = 50;
	const paddingOffsetAnim = useRef(new Animated.Value(0)).current;

	const offsetYInter = animValue.interpolate({
		inputRange: [-searchBarHeight / 2, 0, searchBarHeight / 2],
		outputRange: [searchBarHeight, 0, -searchBarHeight],
		extrapolate: 'clamp',
	});
	const opacityInter = Animated.add(offsetYInter, paddingOffsetAnim).interpolate({
		inputRange: [0, searchBarHeight / 2, searchBarHeight],
		outputRange: [0, 0, 1],
		extrapolate: 'clamp',
	});
	const heightInter = Animated.add(offsetYInter, paddingOffsetAnim).interpolate({
		extrapolate: 'clamp',
		inputRange: [0, searchBarHeight],
		outputRange: [0, searchBarHeight],
	});

	const [isSearchOpen, setIsSearchOpen] = useState(false);

	useEffect(() => {
		animValue.removeAllListeners();
		animValue.addListener(event => {
			if (event.value < -searchBarHeight / 2) {
				setIsSearchOpen(true);
			}
			if (event.value < -searchBarHeight) {
				paddingOffsetAnim.setValue(searchBarHeight);
			}
		});
	}, []);

	const startDrag = () => {
		setIsSearchOpen(false);
	};

	const endDrag = () => {
		if (isSearchOpen) {
			Animated.timing(paddingOffsetAnim, {
				toValue: searchBarHeight,
				duration: 100,
				useNativeDriver: false,
				easing: Easing.linear,
			}).start();
		} else {
			Animated.timing(paddingOffsetAnim, {
				toValue: 0,
				duration: 200,
				useNativeDriver: false,
				easing: Easing.linear,
			}).start();
		}
	};

	useImperativeHandle(ref, () => ({
		startDrag: startDrag,
		endDrag: endDrag,
	}));

	return (
		<Animated.View
			style={{
				height: heightInter,
			}}>
			<View
				style={{
					backgroundColor: 'lightgray',
					marginHorizontal: 8,
					marginVertical: 8,
					flex: 1,
					borderRadius: 6,
					paddingHorizontal: 4,
				}}>
				<AnimatedTextInput
					clearButtonMode="while-editing"
					style={{ flex: 1, fontSize: 16, opacity: opacityInter }}
					placeholder="Search..."
				/>
			</View>
		</Animated.View>
	);
});

interface Props<T> extends FlatListProps<T> {}

const SearchList = <T extends Object>({}: Props<T>) => {
	const offsetY = useRef(new Animated.Value(0)).current;
	const searchBoxRef = useRef<any>();

	const scrollAnim = Animated.event([{ nativeEvent: { contentOffset: { y: offsetY } } }], { useNativeDriver: false });

	return (
		<View style={{ backgroundColor: 'gray' }}>
			<SearchBox ref={searchBoxRef} animValue={offsetY} />

			<FlatList
				onScrollEndDrag={() => searchBoxRef.current?.endDrag && searchBoxRef.current?.endDrag()}
				onScrollBeginDrag={() => searchBoxRef.current?.startDrag && searchBoxRef.current?.startDrag()}
				onScroll={scrollAnim}
				scrollEventThrottle={4}
				style={{ backgroundColor: 'gray' }}
				renderItem={({ item }) => <Item {...item} />}
				data={data}
				keyExtractor={item => item.id}
			/>
		</View>
	);
};

export default SearchList;
