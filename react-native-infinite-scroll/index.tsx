import React, { useRef, useState } from 'react';
import { View, FlatList, Text, ListRenderItem, Dimensions, Button } from 'react-native';

const { width: ScreenWidth } = Dimensions.get('screen');

interface ItemData {
	id: string;
	value: number;
}

const index = () => {
	const flatlistRef = useRef<FlatList>(null);
	const [data, setData] = useState<Array<ItemData>>([
		{ id: '1', value: 1 },
		{ id: '2', value: 2 },
		{ id: '3', value: 3 },
	]);
	const renderItem: ListRenderItem<ItemData> = ({ item }) => {
		return <Item index={item.value} />;
	};

	const appendBefore = () => {
		const newData = [
			{ id: '4', value: 1 },
			{ id: '5', value: 2 },
			{ id: '6', value: 3 },
		];
		const tempData = [...data];
		setData([...newData, ...tempData]);
		setTimeout(() => {
			flatlistRef.current?.scrollToOffset({ animated: false, offset: ScreenWidth * 3 });
		}, 100);
	};

	return (
		<View style={{ flex: 1 }}>
			<FlatList
				onScroll={event => console.log(event.nativeEvent.contentOffset.x)}
				ref={flatlistRef}
				contentContainerStyle={{ alignSelf: 'center', justifyContent: 'center', backgroundColor: 'gray' }}
				horizontal
				data={data}
				keyExtractor={item => item.id}
				renderItem={renderItem}
			/>
			<Button title="appendBefore" onPress={appendBefore} />
		</View>
	);
};

interface IItem {
	index: number;
}

const Item: React.FC<IItem> = ({ index }) => {
	return (
		<View
			style={{
				width: ScreenWidth,
				height: 200,
				borderRadius: 0,
				backgroundColor: 'blue',
				alignItems: 'center',
				justifyContent: 'center',
				borderWidth: 1,
				borderColor: 'black',
			}}>
			<Text>{index}</Text>
		</View>
	);
};

export default index;
