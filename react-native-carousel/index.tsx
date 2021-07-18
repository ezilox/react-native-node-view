import React, { useRef, useState, useEffect, MutableRefObject } from 'react';
import {
	Text,
	View,
	StyleSheet,
	FlatList,
	ListRenderItem,
	Animated,
	NativeScrollEvent,
	NativeSyntheticEvent,
	Pressable,
	I18nManager,
	LayoutRectangle,
	TextStyle,
} from 'react-native';

const isRtl = I18nManager.isRTL;

export interface Props {
	cards: Array<ICard>;
}

interface ICard {
	id: string;
	title: string;
	subtitle: string;
	child: JSX.Element;
	titleStyle?: TextStyle;
	subtitleStyle?: TextStyle;
}

const Carousel: React.FC<Props> = ({ cards }) => {
	const offsetX = useRef(new Animated.Value(0)).current;
	const flatListRef: MutableRefObject<any> = useRef();
	const flatListChildRef: MutableRefObject<any> = useRef();
	const flatListSnapToIndex = useRef({ value: 0 }).current;
	const [viewLayout, setViewLayout] = useState<LayoutRectangle | null>(null);
	const viewWidth = viewLayout ? viewLayout.width : null;
	const itemSize = viewLayout ? viewLayout.width / 3 : null;

	const revertIndex = (index: number) => {
		return cards.length - 1 - index;
	};

	const onScrollAnim = Animated.event([{ nativeEvent: { contentOffset: { x: offsetX } } }], { useNativeDriver: false });
	const renderItem: ListRenderItem<any> = ({ item, index }) =>
		itemSize ? (
			<Item
				index={isRtl ? revertIndex(index) : index}
				title={item.title}
				subtitle={item.subtitle}
				offsexX={offsetX}
				center={() => scrollToIndex(isRtl ? revertIndex(index) : index)}
				itemSize={itemSize}
				titleStyle={item.titleStyle}
				subtitleStyle={item.subtitleStyle}
			/>
		) : null;

	const scrollToIndex = (index: number) => {
		flatListRef?.current?.scrollToIndex({ index: index, animated: true });
		flatListChildRef?.current?.scrollToIndex({ index: index, animated: true });
	};

	const renderItemChild: ListRenderItem<any> = ({ item, index }) =>
		viewWidth ? <ViewItem viewWidth={viewWidth} child={item.child} /> : null;

	const onScrollHandler = (event: NativeSyntheticEvent<NativeScrollEvent>, isMainList: boolean) => {
		isMainList && onScrollAnim(event);
		const scrollOffsetX = event.nativeEvent.contentOffset.x;
		const divider = itemSize && viewWidth ? (isMainList ? itemSize : viewWidth) : 1;

		flatListSnapToIndex.value = Math.round(scrollOffsetX / divider);
	};

	const onScrollEndDragHandler = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const allowedIndex =
			flatListSnapToIndex.value < 0
				? 0
				: flatListSnapToIndex.value > cards.length - 1
				? cards.length - 1
				: flatListSnapToIndex.value;
		scrollToIndex(allowedIndex);
	};

	return (
		<View onLayout={event => setViewLayout(event.nativeEvent.layout)} style={styles.container}>
			{viewLayout && itemSize && viewWidth ? (
				<View style={{ flex: 1 }}>
					<View>
						<FlatList
							ref={flatListRef}
							onScroll={event => onScrollHandler(event, true)}
							scrollEventThrottle={1}
							onScrollEndDrag={event => onScrollEndDragHandler(event)}
							renderItem={renderItem}
							data={cards}
							keyExtractor={(item, index) => item.id}
							horizontal
							getItemLayout={(data, index) => ({ length: itemSize, offset: itemSize * index, index })}
							showsHorizontalScrollIndicator={false}
							initialScrollIndex={Math.floor(cards.length / 2) - 1}
							ListHeaderComponent={() => <View style={{ height: itemSize, width: itemSize }} />}
							ListFooterComponent={() => <View style={{ height: itemSize, width: itemSize }} />}
						/>
					</View>
					<FlatList
						ref={flatListChildRef}
						onScroll={event => onScrollHandler(event, false)}
						scrollEventThrottle={1}
						onScrollEndDrag={event => onScrollEndDragHandler(event)}
						renderItem={renderItemChild}
						data={cards}
						keyExtractor={(item, index) => item.id}
						horizontal
						getItemLayout={(data, index) => ({ length: viewWidth, offset: viewWidth * index, index })}
						showsHorizontalScrollIndicator={false}
						initialScrollIndex={Math.floor(cards.length / 2) - 1}
					/>
				</View>
			) : null}
		</View>
	);
};

interface IItemProps {
	offsexX: Animated.Value;
	index: number;
	title: string;
	subtitle: string;
	center: () => void;
	itemSize: number;
	titleStyle?: TextStyle;
	subtitleStyle?: TextStyle;
}

const Item = ({ offsexX, index, title, subtitle, center, itemSize, titleStyle, subtitleStyle }: IItemProps) => {
	const centerPoint = itemSize * index;

	const opacity = offsexX.interpolate({
		inputRange: [centerPoint - itemSize, centerPoint, centerPoint + itemSize],
		outputRange: [0.4, 1, 0.4],
	});
	const translateY = offsexX.interpolate({
		inputRange: [centerPoint - itemSize, centerPoint, centerPoint + itemSize],
		outputRange: [-20, 1, -20],
	});
	const scale = offsexX.interpolate({
		inputRange: [centerPoint - itemSize, centerPoint, centerPoint + itemSize],
		outputRange: [0.6, 1, 0.6],
	});

	return (
		<Animated.View
			style={[
				itemStyles.container,
				{
					width: itemSize,
					height: itemSize,
					opacity: opacity,
					transform: [{ translateY: translateY }, { scale: scale }],
				},
			]}>
			<Pressable hitSlop={35} onPress={center} style={itemStyles.pressable}>
				<Text style={[itemStyles.title, titleStyle]}>{title}</Text>
				<Text style={[itemStyles.subtitle, subtitleStyle]}>{subtitle}</Text>
			</Pressable>
		</Animated.View>
	);
};

const itemStyles = StyleSheet.create({
	container: {
		// width: ITEM_SIZE,
		// height: ITEM_SIZE,
		alignItems: 'center',
		justifyContent: 'center',
	},
	pressable: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: { fontSize: 26 },
	subtitle: { fontSize: 18 },
});

interface IViewItem {
	child: JSX.Element;
	viewWidth: number;
}

const ViewItem = ({ child, viewWidth }: IViewItem) => {
	return (
		<View style={{ width: viewWidth, flex: 1, backgroundColor: 'gray' }}>
			{child ?? (
				<View style={{ width: '100%', backgroundColor: 'red' }}>
					<Text>Empty</Text>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
});

export default Carousel;
