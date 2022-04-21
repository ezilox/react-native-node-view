import React from 'react';
import { FlatList, ListRenderItem, View, Text, TouchableOpacity } from 'react-native';
import Svg, { Line as SvgLine } from 'react-native-svg';
import { Shape } from './Shape';

interface Props {
	shapes: Array<Shape>;
	setShape: (shape: Shape) => void;
}

const MiniShapeList: React.FC<Props> = ({ shapes, setShape }) => {
	const renderItem: ListRenderItem<Shape> = ({ item }) => <MiniShapeItem setShape={setShape} shape={item} />;
	return (
		<View style={{ width: '100%', height: 100, backgroundColor: 'lightgray', position: 'absolute', bottom: 100 }}>
			<Text style={{ alignSelf: 'center', textAlign: 'center' }}>{shapes.length}</Text>
			<FlatList horizontal renderItem={renderItem} data={shapes} />
		</View>
	);
};

interface IMiniShapeItem {
	shape: Shape;
	setShape: (shape: Shape) => void;
}

const MiniShapeItem: React.FC<IMiniShapeItem> = ({ shape, setShape }) => {
	let viewBoxMinX = Number.MAX_SAFE_INTEGER;
	let viewBoxMinY = Number.MAX_SAFE_INTEGER;
	let viewBoxWidth = 0;
	let viewBoxHeight = 0;

	shape.lines.forEach(line => {
		viewBoxMinX = line.startPoint.x < viewBoxMinX ? line.startPoint.x : viewBoxMinX;
		viewBoxMinX = line.endPoint.x < viewBoxMinX ? line.endPoint.x : viewBoxMinX;

		viewBoxMinY = line.startPoint.y < viewBoxMinY ? line.startPoint.y : viewBoxMinY;
		viewBoxMinY = line.endPoint.y < viewBoxMinY ? line.endPoint.y : viewBoxMinY;
	});

	shape.lines.forEach(line => {
		const distanceX = line.startPoint.x - viewBoxMinX;
		const distanceY = line.startPoint.y - viewBoxMinY;

		viewBoxWidth = distanceX > viewBoxWidth ? distanceX : viewBoxWidth;
		viewBoxHeight = distanceY > viewBoxHeight ? distanceY : viewBoxHeight;
	});

	console.log(` ${viewBoxWidth} ${viewBoxHeight}`);

	return (
		<TouchableOpacity activeOpacity={0.8} onPress={() => setShape(shape)}>
			<Svg
				viewBox={`${viewBoxMinX - viewBoxMinX * 0.05} ${viewBoxMinY - viewBoxMinY * 0.05} 220 220`}
				style={{ aspectRatio: 1, height: '100%', marginHorizontal: 10 }}>
				{shape.lines.map(line => (
					<SvgLine
						key={line.id}
						x1={line.startPoint.x}
						y1={line.startPoint.y}
						x2={line.endPoint.x}
						y2={line.endPoint.y}
						stroke="black"
						strokeWidth={4}
						strokeLinecap="round"
					/>
				))}
			</Svg>
		</TouchableOpacity>
	);
};

export default MiniShapeList;
