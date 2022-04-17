import React from 'react';
import { FlatList, ListRenderItem, View } from 'react-native';
import Svg, { Line as SvgLine } from 'react-native-svg';
import { Shape } from './Shape';

interface Props {
	shapes: Array<Shape>;
}

const MiniShapeList: React.FC<Props> = ({ shapes }) => {
	const shapesIds = shapes.map(shape => shape.id);
	const setShapesIds = [...new Set(shapesIds)];
	const uniqueShapes = setShapesIds
		.map(id => shapes.find(shape => shape.id === id))
		.filter(shape => shape) as Array<Shape>;

	const renderItem: ListRenderItem<Shape> = ({ item }) => <MiniShapeItem shape={item} />;
	return (
		<View style={{ width: '100%', height: 100, backgroundColor: 'lightgray', position: 'absolute', bottom: 100 }}>
			<FlatList horizontal renderItem={renderItem} data={uniqueShapes} />
		</View>
	);
};

interface IMiniShapeItem {
	shape: Shape;
}

const MiniShapeItem: React.FC<IMiniShapeItem> = ({ shape }) => {
	return (
		<Svg viewBox="0 150 300 200" style={{ width: 50, height: 50, backgroundColor: 'red', marginHorizontal: 10 }}>
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
	);
};

export default MiniShapeList;
