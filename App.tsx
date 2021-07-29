import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import NodeView from './React-Native-Node-View/index';
import Carousel, { Props } from './react-native-carousel/index';
// import Bubbles from './react-native-bubbles/index';
import ShapeMaker from './react-native-map-maker/components/ShapeMaker';
import Shape from './react-native-map-maker/components/Shape';
import Map from './react-native-map-maker/components/Map';
import MapMaker from './react-native-map-maker/index';

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

export default function App() {
	const [savedShapes, saveShape] = useState<Array<Array<string>>>([]);
	const [showMap, setShowMap] = useState(false);
	const appendShape = (rects: Array<string>) => {
		const tempData = [...savedShapes];
		tempData.push(rects);
		saveShape(tempData);
	};
	return (
		<View
			style={{
				flex: 1,
				backgroundColor: 'white',
			}}>
			<MapMaker/>

			{/* <Carousel rtlFlag cards={data} /> */}
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
