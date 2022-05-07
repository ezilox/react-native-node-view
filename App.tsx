import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, Modal } from 'react-native';
import NodeView from './React-Native-Node-View/index';
import Carousel, { Props } from './react-native-carousel/index';
import Bubbles from './react-native-bubbles/index';
// import ShapeMaker from './react-native-map-maker/components/ShapeMaker';
// import Shape from './react-native-map-maker/components/Shape';
// import Map from './react-native-map-maker/components/Map';
// import MapMaker from './react-native-map-maker/index';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import ArcadeGame from './react-native-aracde-timing/index';
// import DrawGraph from './react-native-draw-graph/index';
// import DrawColumnGraph from './react-native-draw-column-graph/index';
// import FluidLoader from './react-native-fluid-loader';
// import StepCounter from './react-native-step-counter';
// import ViewBounce from './react-native-view-bounce';
// import BorderSnake from './react-native-border-snake';
import TilesGame from './react-native-tiles-game';
import FlatListSearch from './react-native-flatlist-search';
import { AnimatedStyleUpdateExample } from './react-native-flatlist-search/test';
import SlideButton from './react-native-slide-button';
import PolyMaker from './react-native-ploy-maker/PolyMaker';
import ImageResize from './react-native-image-resize/ImageResize';
import Score from './react-native-aracde-timing/Score';

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
				backgroundColor: 'rgba(1,1,1,0.3)',
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
				isCollapsed: false,
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
			{ id: '2', lineTo: ['2c'], child: <CustomNodeItem title="Heads" /> },
			{ id: '4', lineTo: ['4c'], child: <CustomNodeItem title="Heads" /> },
			{ id: '5', lineTo: ['5c'], child: <CustomNodeItem title="Heads" /> },

			{ id: '7', lineTo: ['7c'], child: <CustomNodeItem title="Heads" /> },
			{ id: '8', lineTo: ['8c'], child: <CustomNodeItem title="Heads" /> },
			{ id: '9', lineTo: ['9c'], child: <CustomNodeItem title="Heads" /> },
			{ id: '10', lineTo: ['10c'], child: <CustomNodeItem title="Heads" /> },
			{ id: '11', lineTo: ['11c'], child: <CustomNodeItem title="Heads" /> },
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
	{
		nodes: [
			{ id: '2c', child: <CustomNodeItem title="Heads" /> },
			{ id: '4c', child: <CustomNodeItem title="Heads" /> },
			{ id: '5c', child: <CustomNodeItem title="Heads" /> },

			{ id: '7c', child: <CustomNodeItem title="Heads" /> },
			{ id: '8c', child: <CustomNodeItem title="Heads" /> },
			{ id: '9c', child: <CustomNodeItem title="Heads" /> },
			{ id: '10c', child: <CustomNodeItem title="Heads" /> },
			{ id: '11c', child: <CustomNodeItem title="Heads" /> },
			{ id: '92c', child: <CustomNodeItem title="Heads" /> },
			{ id: '102c', child: <CustomNodeItem title="Heads" /> },
			{ id: '113c', child: <CustomNodeItem title="Heads" /> },
			{ id: '942c', child: <CustomNodeItem title="Heads" /> },
			{ id: '6c', child: <CustomNodeItem title="Heads" /> },
			{ id: '6aac', child: <CustomNodeItem title="Heads" /> },
			{ id: '6aaac', child: <CustomNodeItem title="Heads" /> },
			{ id: '6aaaac', child: <CustomNodeItem title="Heads" /> },
			{ id: '942ca', child: <CustomNodeItem title="Heads" /> },
			{ id: '6ca', child: <CustomNodeItem title="Heads" /> },
			{ id: '6aaca', child: <CustomNodeItem title="Heads" /> },
			{ id: '6aaaca', child: <CustomNodeItem title="Heads" /> },
			{ id: '6aaaaca', child: <CustomNodeItem title="Heads" /> },
		],
	},
];

export default function App() {
	const [savedShapes, saveShape] = useState<Array<Array<string>>>([]);
	const [showMap, setShowMap] = useState(false);
	const [node, setNodes] = useState(nodesGroups);
	const [isNodeReady, setIsNodeReady] = useState(false);
	const [percent, setPercent] = useState(0.2);

	// useEffect(() => {
	// 	// console.log( nodeRef.current.renderReady);
	// 	console.log('isNodeReady', isNodeReady);
	// 	if (isNodeReady) {
	// 		nodeRef.current?.collapseNode('1a', '1');
	// 		// nodeRef.current?.collapseNode('1c', '1');
	// 		// nodeRef.current?.collapseNode('1b', '1');
	// 		const tempNodes = [...node];
	// 		tempNodes[1].nodes[0].isCollapsed = true;
	// 		console.log(tempNodes);
	// 		setTimeout(() => setNodes(tempNodes), 1000);
	// 	}
	// }, [isNodeReady]);

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

	// const tempNodes = nodesGroups;
	// const linesIds = tempNodes
	// 	.map(group => group.nodes.map(n => n.lineTo))
	// 	.flat(3)
	// 	.filter(id => typeof id === 'string');

	// tempNodes.map(group => group.nodes.sort(nodeA => !linesIds.includes(nodeA.id)));
	// console.log('linesIds', linesIds);
	console.log('hererer');
	const points = [
		{ x: 0, y: 30 },
		{ x: 20, y: -100 },
		{ x: 70, y: 32 },
		{ x: 120, y: 100 },
		{ x: 150, y: 55 },
		{ x: 170, y: 30 },
		{ x: 200, y: 150 },
		{ x: 221, y: 200 },
		{ x: 231, y: 190 },
		{ x: 250, y: 120 },
		{ x: 260, y: 132 },
		{ x: 270, y: 80 },
		{ x: 280, y: -100 },
		{ x: 300, y: -50 },
		{ x: 320, y: 200 },
		{ x: 350, y: 190 },
		{ x: 380, y: 120 },
		{ x: 390, y: 220 },
	];
	// return <ImageResize uri="https://upload.wikimedia.org/wikipedia/commons/9/9a/Gull_portrait_ca_usa.jpg" />;
  return <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}><Score score={43219}/></View>
	return <PolyMaker />;
	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<SlideButton onPress={() => console.log('Button Press')} />
		</View>
	);
	return <AnimatedStyleUpdateExample />;
	return (
		<View style={{ marginTop: 100 }}>
			<FlatListSearch data={[]} renderItem={({ item }) => <View />} />
		</View>
	);
	const images = Array(20)
		.fill(null)
		.map((v, i) => ({ imageUri: 'https://upload.wikimedia.org/wikipedia/en/7/77/EricCartman.png', key: i }));
	// return (
	// 	<Bubbles images={images} />
	// );
	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			{/* <ArcadeGame /> */}
			{/* <View
				style={{
					width: 300,
					height: 400,
					borderColor: 'gray',
					alignSelf: 'center',
					marginTop: 200,
          borderWidth: 1,
				}}> */}
			{/* <DrawGraph points={points} /> */}
			{/* <DrawPieChart /> */}
			{/* <DrawColumnGraph /> */}
			{/* <NodeView
					// onDeleteNode={(id, old, newNodes) => setNodes(newNodes)}
					enablePan={false}
					enableZoom={false}
					nodesGroups={node}
					nodeSize={55}
					nodePadding={2}
          rtlLine={false}
          enableNodeAnimation={false}
          panGesturePoints={1}
          initZoom={0.7}
				/> */}
			{/* <View style={{ width: 220, height: 300, backgroundColor: 'gray' }}> */}
			{/* <FluidLoader percent={percent} colors={['#5DD3FD', '#007EF3', '#52C9FC']} /> */}
			{/* <StepCounter
					circleFillColor="yellow"
					circleEmptyColor="pink"
					pathColor="white"
					stepsCount={5}
					currentStep={3}
				/> */}
			{/* <BorderSnake speed={1} enabled={true} borderRadius={1} /> */}
			{/* <View style={{ backgroundColor: 'red', borderRadius: 30 }}>
						<Button title="Press" onPress={() => console.log('Press')} />
						<Text>Hello</Text>
					</View> */}
			{/* </View> */}
			{/* <Button title="more" onPress={() => setPercent(percent + 0.1)} /> */}
			{/* </View> */}
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
