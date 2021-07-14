import React, { useState } from 'react';
import { StyleSheet, Text, View, LayoutAnimation } from 'react-native';
import NodeView from './React-Native-Node-View/index';

export default function App() {
	// const [nodesGroups, setNodesGroups] = useState([
	// 	{
	// 		nodes: [{ id: '1', lineTo: ['2', '3'], onPress: (id: string) => console.log(id) }],
	// 	},
	// 	{
	// 		nodes: [
	// 			{ id: '2', lineTo: ['4', '11', '12', '13'] },
	// 			{ id: '3', lineTo: ['5', '6', '7', '8', '9', '10'] },
	// 		],
	// 	},
	// 	{
	// 		nodes: [
	// 			{ id: '11' },
	// 			{ id: '12' },
	// 			{ id: '13', lineTo: ['a4', 'a5', 'a7', 'a8', 'a11', 'a12', 'a13'] },
	// 			{ id: '4' },
	// 			{ id: '5' },
	// 			{ id: '6' },
	// 			{ id: '7' },
	// 			{ id: '8' },
	// 			{ id: '9' },
	// 			{ id: '10' },
	// 		],
	// 	},
	// 	{
	// 		nodes: [
	// 			{ id: 'a11' },
	// 			{ id: 'a12' },
	// 			{ id: 'a13' },
	// 			{ id: 'a4' },
	// 			{ id: 'a5' },
	// 			{ id: 'a6' },
	// 			{ id: 'a7' },
	// 			{ id: 'a8' },
	// 		],
	// 	},
	// ]);

	const [nodesGroups, setNodesGroups] = useState([
		{
			nodes: [{ id: '1', lineTo: ['2', '3'], onPress: (id: string) => console.log(id) }],
		},
		{
			nodes: [{ id: '2' }, { id: '3' }],
		},
	]);

	return (
		<View
			style={{
				flex: 1,
				justifyContent: 'center',
				backgroundColor: 'white',
			}}>
			<NodeView
				enablePan={true}
				enableZoom={true}
				containerStyle={{ borderWidth: 0 }}
				onDeleteNode={(id, oldState, newState) => setNodesGroups(newState)}
				nodesGroups={nodesGroups}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		backgroundColor: 'white',
	},
});
