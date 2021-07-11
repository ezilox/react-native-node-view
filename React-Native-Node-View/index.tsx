import React, { useEffect, useState, useRef } from 'react';
import { View, Animated, Text, ViewStyle, LayoutRectangle } from 'react-native';
import Svg, { Line, LineProps } from 'react-native-svg';
import {
	PanGestureHandler,
	TapGestureHandler,
	GestureHandlerStateChangeNativeEvent,
	State,
} from 'react-native-gesture-handler';

const SvgAnim = Animated.createAnimatedComponent(Svg);
const LineAnim = Animated.createAnimatedComponent(Line);

export interface Props {
	nodesGroups: Array<NodeGroup>;
	containerStyle?: ViewStyle;
	lineStyle?: LineProps;
}

interface NodeGroup {
	nodes: Array<Node>;
	rowContainerStyle?: ViewStyle;
}

interface Node {
	id: string;
	lineTo?: Array<string>;
	child?: JSX.Element;
	onPress?: (id: string) => void;
}

interface INodePositions {
	x: Animated.Value;
	y: Animated.Value;
}

interface INodePositions {
	x: Animated.Value;
	y: Animated.Value;
}

const NodeItem = ({ title }: any) => {
	return (
		<View
			style={{
				width: 40,
				height: 40,
				backgroundColor: 'lightgray',
				borderRadius: 40 / 2,
				alignItems: 'center',
				justifyContent: 'center',
			}}>
			<Text style={{ fontSize: 10 }}>{title ?? 'Node'}</Text>
		</View>
	);
};

const NodeView: React.FC<Props> = ({ nodesGroups, containerStyle, lineStyle }) => {
	const nodes = nodesGroups.map(nodeGroup => nodeGroup.nodes).flat();

	const [viewLayout, setViewLayout] = useState<LayoutRectangle | null>(null);

	const positionPadding = viewLayout && viewLayout?.height / nodesGroups.length;

	const nodesData = {
		nodePositions: useRef<Array<INodePositions>>([]).current,
		nodeOnDrag: useRef<Array<() => void>>([]).current,
		toStart: useRef<Array<() => void>>([]).current,
	};
	const [nodesLayout, setNodesLayout] = useState<any>({});

	const [renderReady, setRenderReady] = useState(false);

	useEffect(() => {
		nodes.forEach(() => {
			const animated = { x: new Animated.Value(0), y: new Animated.Value(0) };
			nodesData.nodePositions.push(animated);
			const toStart = () => {
				Animated.parallel([
					Animated.spring(animated.x, { useNativeDriver: true, speed: 6, toValue: 0 }),
					Animated.spring(animated.y, { useNativeDriver: true, speed: 6, toValue: 0 }),
				]).start();
			};
			nodesData.toStart.push(toStart);
			nodesData.nodeOnDrag.push(
				Animated.event([{ nativeEvent: { translationY: animated.y, translationX: animated.x } }], {
					useNativeDriver: true,
				})
			);
			nodesData.toStart.push();
		});
		setRenderReady(true);
	}, []);

	const onLayout = (id: string, layout: LayoutRectangle, groupIndex: number) => {
		const tempData = { ...nodesLayout };
		tempData[id] = layout;

		tempData[id].y = positionPadding && tempData[id].y + groupIndex * positionPadding;
		setNodesLayout(tempData);
	};

	const renderNodes =
		renderReady &&
		nodesGroups.map((nodesMap, groupIndex) => (
			<View
				style={[
					{ flexDirection: 'row', justifyContent: 'space-around', flex: 1, alignItems: 'center' },
					nodesMap.rowContainerStyle,
				]}
				key={groupIndex}>
				{nodesMap.nodes.map((node, index) => {
					const nodeIndex = nodes.findIndex(nodeIndex => nodeIndex.id === node.id);

					return (
						<DragableView
							id={node.id}
							key={node.id}
							onLayout={onLayout}
							child={node.child}
							onDrag={nodesData.nodeOnDrag[nodeIndex]}
							toStart={nodesData.toStart[nodeIndex]}
							viewPositionX={nodesData.nodePositions[nodeIndex].x}
							viewPositionY={nodesData.nodePositions[nodeIndex].y}
							groupIndex={groupIndex}
							viewLayout={viewLayout}
              nodeLayout={nodesLayout[nodeIndex]}
              onPress={node.onPress}
						/>
					);
				})}
			</View>
		));

	const renderLines =
		Object.keys(nodesLayout).length === nodes.length &&
		viewLayout &&
		renderReady &&
		nodes.map((node, index) => {
			if (node.lineTo && node.lineTo?.length > 0) {
				return node.lineTo.map(lineTo => {
					const nodeLayout = nodesLayout[node.id];
					const secNodeLayout = nodesLayout[lineTo];
					const secNodeIndex = nodes.findIndex(nodeIndex => nodeIndex.id === lineTo);

					return (
						<DragableLine
							key={`${node.lineTo}${secNodeIndex}`}
							viewPositionX1={nodesData.nodePositions[index].x}
							viewPositionY1={nodesData.nodePositions[index].y}
							viewPositionX2={nodesData.nodePositions[secNodeIndex].x}
							viewPositionY2={nodesData.nodePositions[secNodeIndex].y}
							nodeLayout={nodeLayout}
							secNodeLayout={secNodeLayout}
							lineProps={{ stroke: 'blue', strokeWidth: '1', ...lineStyle }}
							viewLayout={viewLayout}
						/>
					);
				});
			}
		});

	return (
		<View onLayout={event => setViewLayout(event.nativeEvent.layout)} style={{ flex: 1 }}>
			{viewLayout && renderReady ? (
				<View style={[{ flex: 1 }, containerStyle]}>
					{renderNodes}
					<SvgAnim height={viewLayout?.height} width={viewLayout?.width} style={{ position: 'absolute', zIndex: -1 }}>
						{renderLines}
					</SvgAnim>
				</View>
			) : null}
		</View>
	);
};

interface IDragableLine {
	viewPositionX1: Animated.Value;
	viewPositionY1: Animated.Value;
	viewPositionX2: Animated.Value;
	viewPositionY2: Animated.Value;
	lineProps: LineProps;
	viewLayout: LayoutRectangle;
	nodeLayout: LayoutRectangle;
	secNodeLayout: LayoutRectangle;
}

const DragableLine = ({
	viewPositionX1,
	viewPositionY1,
	viewPositionX2,
	viewPositionY2,
	nodeLayout,
	lineProps,
	viewLayout,
	secNodeLayout,
}: IDragableLine) => {
	const x1Inter = viewPositionX1.interpolate({
		inputRange: [-nodeLayout.x, viewLayout.width - nodeLayout.x - nodeLayout.width],
		outputRange: [-nodeLayout.x, viewLayout.width - nodeLayout.x - nodeLayout.width],
		extrapolate: 'clamp',
	});

	const y1Inter = viewPositionY1.interpolate({
		inputRange: [-nodeLayout.y, 0, viewLayout.height - nodeLayout.y - nodeLayout.height],
		outputRange: [-nodeLayout.y, 0, viewLayout.height - nodeLayout.y - nodeLayout.height],
		extrapolate: 'clamp',
	});

	const x1InterWithWidth = Animated.add(x1Inter, new Animated.Value(nodeLayout.x + nodeLayout.width / 2));

	const y1InterWithHeight = Animated.add(y1Inter, new Animated.Value(nodeLayout.y + nodeLayout.height / 2));

	const x2Inter = viewPositionX2.interpolate({
		inputRange: [-secNodeLayout.x, viewLayout.width - secNodeLayout.x - secNodeLayout.width],
		outputRange: [-secNodeLayout.x, viewLayout.width - secNodeLayout.x - secNodeLayout.width],
		extrapolate: 'clamp',
	});

	const y2Inter = viewPositionY2.interpolate({
		inputRange: [-secNodeLayout.y, 0, viewLayout.height - secNodeLayout.y - secNodeLayout.height],
		outputRange: [-secNodeLayout.y, 0, viewLayout.height - secNodeLayout.y - secNodeLayout.height],
		extrapolate: 'clamp',
	});

	const x2InterWithWidth = Animated.add(x2Inter, new Animated.Value(secNodeLayout.x + secNodeLayout.width / 2));

	const y2InterWithHeight = Animated.add(y2Inter, new Animated.Value(secNodeLayout.y + secNodeLayout.height / 2));

	return (
		<LineAnim
			x1={x1InterWithWidth}
			y1={y1InterWithHeight}
			x2={x2InterWithWidth}
			y2={y2InterWithHeight}
			{...lineProps}
		/>
	);
};

interface IDragableView {
	id: string;
	onDrag: () => void;
	toStart: () => void;
	onLayout: (id: string, layout: LayoutRectangle, groupIndex: number) => void;
	viewPositionX: any;
	viewPositionY: any;
	groupIndex: number;
	child?: JSX.Element;
	onPress?: (id: string) => void;
	viewLayout: LayoutRectangle | null;
	nodeLayout: LayoutRectangle;
}

const DragableView = ({
	id,
	onDrag,
	toStart,
	onLayout,
	viewPositionX,
	viewPositionY,
	child,
	groupIndex,
	viewLayout,
	onPress,
}: IDragableView) => {
	const [nodeLayout, setNodeLayout] = useState<LayoutRectangle>();

	const onNodeLayout = (id: string, layout: LayoutRectangle, groupIndex: number) => {
		!nodeLayout && setNodeLayout(layout);
		onLayout(id, layout, groupIndex);
	};

	const onTap = (nativeEvent: GestureHandlerStateChangeNativeEvent) => {
		nativeEvent.state === State.END && onPress && onPress(id);
	};

	const maxTranslateX =
		viewLayout && nodeLayout
			? viewPositionX.interpolate({
					inputRange: [-nodeLayout?.x, viewLayout?.width - nodeLayout.x - nodeLayout.width],
					outputRange: [-nodeLayout?.x, viewLayout?.width - nodeLayout.x - nodeLayout.width],
					extrapolate: 'clamp',
			  })
			: 0;
	const maxTranslateY =
		viewLayout && nodeLayout
			? viewPositionY.interpolate({
					inputRange: [-nodeLayout?.y, viewLayout?.height - nodeLayout.y - nodeLayout.height],
					outputRange: [-nodeLayout?.y, viewLayout?.height - nodeLayout.y - nodeLayout.height],
					extrapolate: 'clamp',
			  })
			: 0;

	return (
		<TapGestureHandler onHandlerStateChange={event => onTap(event.nativeEvent)}>
			<Animated.View
				onLayout={event => onNodeLayout(id, event.nativeEvent.layout, groupIndex)}
				style={{ transform: [{ translateX: maxTranslateX }, { translateY: maxTranslateY }] }}>
				<PanGestureHandler onGestureEvent={onDrag} onEnded={toStart}>
					<Animated.View>{child ?? <NodeItem />}</Animated.View>
				</PanGestureHandler>
			</Animated.View>
		</TapGestureHandler>
	);
};

export default NodeView;
