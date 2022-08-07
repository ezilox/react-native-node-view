import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import WatchScroll from './react-native-apple-watch-scroll';
// import NodeView from './React-Native-Node-View/index';
// import Carousel, { Props } from './react-native-carousel/index';
// import Bubbles from './react-native-bubbles/index';
// import ShapeMaker from './react-native-map-maker/components/ShapeMaker';
// import Shape from './react-native-map-maker/components/Shape';
// import Map from './react-native-map-maker/components/Map';
// import MapMaker from './react-native-map-maker/index';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import ArcadeGame from './react-native-aracde-timing/index';
// import ScrollInfinite from './react-native-infinite-scroll';
// import DrawGraph from './react-native-draw-graph/index';
// import DrawColumnGraph from './react-native-draw-column-graph/index';
// import FluidLoader from './react-native-fluid-loader';
// import StepCounter from './react-native-step-counter';
// import ViewBounce from './react-native-view-bounce';
// import BorderSnake from './react-native-border-snake';
// import TilesGame from './react-native-tiles-game';
// import FlatListSearch from './react-native-flatlist-search';
// import { AnimatedStyleUpdateExample } from './react-native-flatlist-search/test';
// import SlideButton from './react-native-slide-button';
// // import PolyMaker from './react-native-ploy-maker/PolyMaker';
// import ImageResize from './react-native-image-resize/ImageResize';
// import Score from './react-native-aracde-timing/Score';
// import Game from './react-native-ball-collision';
// import Noise from './react-native-noise/Index';
// import SoccerGame from './react-native-soccer-kick/Index';
import CircleHover from './react-native-hover-circle/Index';

export default function App() {
	return (
		<SafeAreaProvider>
			<View style={{ flex: 1, backgroundColor: 'darkgreen' }}>
				<CircleHover />
			</View>
		</SafeAreaProvider>
	);
}
