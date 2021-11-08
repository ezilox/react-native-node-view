import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, Alert, Modal } from 'react-native';
import NodeView from './React-Native-Node-View/index';
import Carousel, { Props } from './react-native-carousel/index';
// import Bubbles from './react-native-bubbles/index';
import ShapeMaker from './react-native-map-maker/components/ShapeMaker';
import Shape from './react-native-map-maker/components/Shape';
import Map from './react-native-map-maker/components/Map';
import MapMaker from './react-native-map-maker/index';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// const data: Props['cards'] = [
// 	{
// 		id: 'ad3',
// 		title: '6',
// 		subtitle: 'Apples',
// 		child: (
// 			<View style={{ backgroundColor: 'lightgreen', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
// 				<Text style={{ fontSize: 22 }}>Hello World</Text>
// 			</View>
// 		),
// 	},
// 	{
// 		id: 'ad5',
// 		title: '10',
// 		subtitle: 'Grapes',
// 		child: (
// 			<View style={{ backgroundColor: 'purple', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
// 				<Text style={{ fontSize: 22 }}>Hello World</Text>
// 			</View>
// 		),
// 	},
// 	{
// 		id: 'ad6',
// 		title: '2',
// 		subtitle: 'Bananas',
// 		child: (
// 			<View style={{ backgroundColor: 'yellow', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
// 				<Text style={{ fontSize: 22 }}>Hello World</Text>
// 			</View>
// 		),
// 	},
// ];

const CustomNodeItem = ({ adjustSize, title }: any) => {

	return (
		<View
			style={{
				width: adjustSize?.width ?? 50,
				height: adjustSize?.height ?? 50,
				backgroundColor: 'red',
				borderRadius: 30 / 2,
				alignItems: 'center',
				justifyContent: 'center',
			}}>
			<Text adjustsFontSizeToFit numberOfLines={1} style={{ fontSize: 10 }}>
				{title ?? 'Node'}
			</Text>
		</View>
	);
};


const nodesGroups = [
	{ nodes: [{ id: '1', lineTo: ['2', '3', '4', '5', '6', '1a', '1b'], onPress: (id: any) => console.log(id) }] },
	{
		nodes: [
			{
				id: '1a',
				lineTo: ['2', '3', '4', '5', '6'],
				onPress: (id: any) => console.log(id),
				child: <CustomNodeItem title="Heads" />,
			},
			{ id: '1c', lineTo: [], onPress: (id: any) => console.log(id), child: <CustomNodeItem title="Heads" /> },
			{
				id: '1b',
				lineTo: ['2', '3', '4', '5', '6'],
				onPress: (id: any) => console.log(id),
				child: <CustomNodeItem title="Heads" />,
			},
		],
	},
	{
		nodes: [
			{ id: '2', child: <CustomNodeItem title="Heads" /> },
			{ id: '4', child: <CustomNodeItem title="Heads" /> },
			{ id: '5', child: <CustomNodeItem title="Heads" /> },

			{ id: '7', child: <CustomNodeItem title="Heads" /> },
			{ id: '8', child: <CustomNodeItem title="Heads" /> },
			{ id: '9', child: <CustomNodeItem title="Heads" /> },
			{ id: '10', child: <CustomNodeItem title="Heads" /> },
			{ id: '11', child: <CustomNodeItem title="Heads" /> },
			{ id: '92', child: <CustomNodeItem title="Heads" /> },
			{ id: '102', child: <CustomNodeItem title="Heads" /> },
			{ id: '113', child: <CustomNodeItem title="Heads" /> },
			{ id: '942', child: <CustomNodeItem title="Heads" /> },
			{ id: '6', child: <CustomNodeItem title="Heads" /> },
			{ id: '6aa', child: <CustomNodeItem title="Heads" /> },
			{ id: '6aaa', child: <CustomNodeItem title="Heads" /> },
			{ id: '6aaaa', child: <CustomNodeItem title="Heads" /> },
		],
	},
];

export default function App() {
	const [savedShapes, saveShape] = useState<Array<Array<string>>>([]);
	const [showMap, setShowMap] = useState(false);
	const [node, setNodes] = useState(nodesGroups);

	// const appendShape = (rects: Array<string>) => {
	// 	const tempData = [...savedShapes];
	// 	tempData.push(rects);
	// 	saveShape(tempData);
	// };

	// const addNode = () => {
	// 	const tempData = [...node];
	// 	tempData.push({ nodes: [{ id: '5' }, { id: '6' }] });
	// 	setNodes(tempData);
	// };

	const tempNodes = nodesGroups;
	const linesIds = tempNodes
		.map(group => group.nodes.map(n => n.lineTo))
		.flat(3)
		.filter(id => typeof id === 'string');

	tempNodes.map(group => group.nodes.sort((nodeA) => !linesIds.includes(nodeA.id)));
	console.log('linesIds', linesIds);

	return (
		<View style={{ flex: 1, justifyContent: 'center' }}>
			<View
				style={{
					width: '90%',
					height: '50%',
					borderWidth: 1,
					borderRadius: 10,
					borderColor: 'gray',
					alignSelf: 'center',
				}}>
				<NodeView
					onDeleteNode={(id, old, newNodes) => setNodes(newNodes)}
					enablePan={false}
					enableZoom={false}
					nodesGroups={node}
          nodeSize={55}
          nodePadding={2}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
		justifyContent: 'center',
	},
});
