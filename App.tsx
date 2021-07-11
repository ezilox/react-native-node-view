import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import NodeView from './React-Native-Node-View/index';

export default function App() {
	return (
		<View style={styles.container}>
			<View style={{ height: 100, width: '100%' }} />
			<Text style={{ alignSelf: 'center', fontSize: 22 }}>My Little Complex Node Graph</Text>
			<View
				style={{ width: 300, height: 300, alignSelf: 'center', borderWidth: 1, borderRadius: 10, borderColor: 'gray' }}>
				<NodeView
					nodesGroups={[
						{
							nodes: [{ id: '1', lineTo: ['2', '3'], onPress: id => console.log(id) }],
						},
						{
							nodes: [
								{ id: '2', lineTo: ['4'] },
								{ id: '3', lineTo: ['5'] },
							],
						},
						{
							nodes: [{ id: '4' }, { id: '5' }],
						},
					]}
				/>
			</View>
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
