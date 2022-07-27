import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Animated, Text, ViewStyle, LayoutRectangle } from 'react-native';
import Svg, { Line, LineProps } from 'react-native-svg';
import {
	PanGestureHandler,
	TapGestureHandler,
	LongPressGestureHandler,
	GestureHandlerStateChangeNativeEvent,
	LongPressGestureHandlerStateChangeEvent,
	TapGestureHandlerStateChangeEvent,
	PinchGestureHandler,
	PinchGestureHandlerStateChangeEvent,
	State,
} from 'react-native-gesture-handler';

const LineAnim = Animated.createAnimatedComponent(Line);

export interface Props {
	nodesGroups: Array<NodeGroup>;
	containerStyle?: ViewStyle;
	lineStyle?: LineProps;
	nodeSize?: number;
	nodePadding?: number;
	onDeleteNode?: (id: string, oldState: Array<NodeGroup>, newState: Array<NodeGroup>) => void;
	onLongPress?: (id: string) => void;
	maxZoom?: number;
	minZoom?: number;
	initZoom?: number;
	maxPan?: number;
	minPan?: number;
	enablePan?: boolean;
	enableZoom?: boolean;
	deleteNodeViewStyle?: ViewStyle;
	deleteNodeLineStyle?: ViewStyle;
	enableDeleteMode?: boolean;
	rtlLine?: boolean;
	panGesturePoints?: number;
	panGestureMinDist?: number;
}

interface NodeGroup {
	nodes: Array<Node>;
	rowContainerStyle?: ViewStyle;
}

interface NodeSize {
	width: number;
	height: number;
}

interface Node {
	id: string;
	lineTo?: Array<string>;
	child?: JSX.Element;
	onPress?: (id: string) => void;
}

const NodeItem = ({ title, adjustSize }: any) => {
	return (
		<View
			style={{
				width: adjustSize?.width ?? 50,
				height: adjustSize?.height ?? 50,
				backgroundColor: 'lightgray',
				borderRadius: 30 / 2,
				alignItems: 'center',
				justifyContent: 'center',
			}}>
			<Text style={{ fontSize: 10 }}>{title ?? 'Node'}</Text>
		</View>
	);
};

const NodeView: React.FC<Props> = ({
	nodesGroups,
	containerStyle,
	lineStyle,
	nodeSize = 55,
	nodePadding = 2,
	onDeleteNode,
	onLongPress,
	maxZoom = 1.5,
	minZoom = 0.5,
	initZoom = 1,
	maxPan = 100,
	minPan = -100,
	enablePan = false,
	enableZoom = false,
	deleteNodeViewStyle,
	deleteNodeLineStyle,
	enableDeleteMode = true,
	rtlLine = false,
	panGesturePoints = 2,
	panGestureMinDist = 10,
}) => {
	const nodes = nodesGroups.map(nodeGroup => nodeGroup.nodes).flat();

	const [viewLayout, setViewLayout] = useState<LayoutRectangle | null>(null);
	const [deleteMode, setDeleteMode] = useState(false);

	const positionPadding = viewLayout && viewLayout?.height / nodesGroups.length;

	const [nodesLayout, setNodesLayout] = useState<any>({});

	const panGestureRef = useRef();
	const pinchGestureRef = useRef();
	const zoomBaseAnim = useRef(new Animated.Value(1)).current;
	const zoomPinchAnim = useRef(new Animated.Value(1)).current;
	const zoomAnim = Animated.multiply(zoomBaseAnim, zoomPinchAnim);
	let lastScale = 1;

	const zoomAnimInter = zoomAnim.interpolate({
		inputRange: [minZoom, 1, maxZoom],
		outputRange: [minZoom, initZoom, maxZoom],
		extrapolate: 'extend',
	});

	const graphTranslateX = useRef(new Animated.Value(0)).current;
	const graphTranslateY = useRef(new Animated.Value(0)).current;

	const graphTranslateXInter = graphTranslateX.interpolate({
		inputRange: [minPan, maxPan],
		outputRange: [minPan, maxPan],
		extrapolate: 'extend',
	});

	const graphTranslateYInter = graphTranslateY.interpolate({
		inputRange: [minPan, maxPan],
		outputRange: [minPan, maxPan],
		extrapolate: 'extend',
	});

	const onPinch = Animated.event([{ nativeEvent: { scale: zoomPinchAnim } }], { useNativeDriver: true });
	const onPan = Animated.event([{ nativeEvent: { translationX: graphTranslateX, translationY: graphTranslateY } }], {
		useNativeDriver: true,
	});

	const onPinchHandlerStateChange = (event: PinchGestureHandlerStateChangeEvent) => {
		if (event.nativeEvent.oldState === State.ACTIVE) {
			const scale = lastScale * event.nativeEvent.scale;
			if (scale >= minZoom && scale <= maxZoom) {
				lastScale *= event.nativeEvent.scale;
				zoomBaseAnim.setValue(lastScale);
				zoomPinchAnim.setValue(1);
			} else {
				if (scale < minZoom) {
					lastScale = minZoom;
					Animated.timing(zoomBaseAnim, { useNativeDriver: true, toValue: lastScale, duration: 200 }).start();
				}
				if (scale > maxZoom) {
					lastScale = maxZoom;
					Animated.timing(zoomBaseAnim, { useNativeDriver: true, toValue: lastScale, duration: 200 }).start();
				}
				Animated.timing(zoomPinchAnim, { useNativeDriver: true, toValue: 1, duration: 200 }).start();
			}
		}
	};

	const onPanHandlerStateChange = useCallback(() => {
		graphTranslateY.extractOffset();
		graphTranslateX.extractOffset();
	}, []);

	useEffect(() => {
		const nodesIds = nodes.map(node => node.id);

		Object.keys(nodesLayout).forEach(key => {
			if (!nodesIds.includes(key)) {
				const tempNodeLayout = { ...nodesLayout };
				delete tempNodeLayout[key];
				setNodesLayout(tempNodeLayout);
			}
		});
	}, [nodesGroups]);


	const onGlobalTouch = (event: TapGestureHandlerStateChangeEvent) => {
		if (event.nativeEvent.state === State.ACTIVE) {
			setDeleteMode(false);
		}
	};

	useEffect(() => {
		if (positionPadding && viewLayout) {
			const tempNodeLayout: any = {};
			nodesGroups.forEach((group, groupIndex) => {
				const groupLength = group.nodes.length;
				let nodeNewSize = { width: nodeSize, height: nodeSize };
				if (viewLayout && viewLayout?.width / groupLength < nodeSize) {
					const size = viewLayout?.width / groupLength - nodePadding;
					nodeNewSize = { width: size, height: size };
				}
				const groupWidth = groupLength * nodeNewSize.width;
				const groupSpace = viewLayout?.width - groupWidth;
				const spaces = groupSpace / (groupLength + 1);
				group.nodes.forEach((node, index) => {
					const positionX = (index + 1) * spaces + nodeNewSize.width * index;
					const groupPadding = groupIndex * positionPadding;
					const positionY = groupPadding + (positionPadding - nodeNewSize.height) / 2;
					tempNodeLayout[node.id] = {
						x: rtlLine ? viewLayout.width - positionX - nodeNewSize.width : positionX,
						y: positionY,
						width: nodeNewSize.width,
						height: nodeNewSize.height,
					};
				});
			});
			setNodesLayout(tempNodeLayout);
		}
	}, [viewLayout, nodesGroups]);

	const deleteNodeHandler = (id: string) => {
		const newNodesGroups = nodesGroups.map(nodeGroup => ({ ...nodeGroup }));
		newNodesGroups.forEach(nodeGroup => {
			nodeGroup.nodes = nodeGroup.nodes.filter(node => node.id !== id);
		});
		onDeleteNode && onDeleteNode(id, nodesGroups, newNodesGroups);
	};

	const renderNodes = nodesGroups.map((nodesMap, groupIndex) => (
		<View
			style={[
				{ flexDirection: 'row', justifyContent: 'space-evenly', flex: 1, alignItems: 'center' },
				nodesMap.rowContainerStyle,
			]}
			key={groupIndex}>
			{nodesMap.nodes.map((node) => {
				
				let nodeNewSize = { width: nodeSize, height: nodeSize };
				if (viewLayout && viewLayout?.width / nodesMap.nodes.length < nodeSize) {
					const size = viewLayout?.width / nodesMap.nodes.length - nodePadding;
					nodeNewSize = { width: size, height: size };
				}

				return (
					<DragableView
						id={node.id}
						key={node.id}
						child={node.child}
						adjustSize={nodeNewSize}
						groupIndex={groupIndex}
						viewLayout={viewLayout}
						nodeLayout={nodesLayout[node.id]}
						onPress={node.onPress}
						deleteMode={deleteMode}
						setDeleteMode={setDeleteMode}
						onDeleteNode={deleteNodeHandler}
						onLongPressListener={onLongPress}
						deleteNodeViewStyle={deleteNodeViewStyle}
						deleteNodeLineStyle={deleteNodeLineStyle}
						enableDeleteMode={enableDeleteMode}
					/>
				);
			})}
		</View>
	));

	const renderLines =
		viewLayout &&
		nodes.map((node, index) => {
			if (node.lineTo && node.lineTo?.length > 0) {
				return node.lineTo.map(lineTo => {
					const nodeLayout = nodesLayout[node.id];
					const secNodeLayout = nodesLayout[lineTo];
					const secNodeIndex = nodes.findIndex(nodeIndex => nodeIndex.id === lineTo);
					if (nodeLayout && secNodeLayout) {
						return (
							<DragableLine
								key={`${node.lineTo}${secNodeIndex}`}
								nodeLayout={nodeLayout}
								secNodeLayout={secNodeLayout}
								lineProps={{ stroke: 'blue', strokeWidth: '1', ...lineStyle }}
								viewLayout={viewLayout}
							/>
						);
					} else {
						return null;
					}
				});
			}
		});

	return (
		<View onLayout={event => setViewLayout(event.nativeEvent.layout)} style={{ flex: 1 }}>
			{viewLayout ? (
				<PinchGestureHandler
					enabled={enableZoom}
					minPointers={2}
					ref={pinchGestureRef}
					onHandlerStateChange={onPinchHandlerStateChange}
					onGestureEvent={onPinch}>
					<Animated.View style={{ flex: 1 }}>
						<PanGestureHandler
							enabled={enablePan}
							minDist={panGestureMinDist}
							simultaneousHandlers={pinchGestureRef}
							minPointers={panGesturePoints}
							ref={panGestureRef}
							onHandlerStateChange={onPanHandlerStateChange}
							onGestureEvent={onPan}>
							<Animated.View style={{ flex: 1 }}>
								<TapGestureHandler onHandlerStateChange={onGlobalTouch}>
									<Animated.View
										style={[
											{
												flex: 1,
												transform: [
													{
														scale: zoomAnimInter,
													},
													{ translateX: graphTranslateXInter },
													{ translateY: graphTranslateYInter },
												],
											},
											containerStyle,
										]}>
										{renderNodes}
										<Svg style={{ position: 'absolute', zIndex: -1, width: '100%', height: '100%' }}>{renderLines}</Svg>
									</Animated.View>
								</TapGestureHandler>
							</Animated.View>
						</PanGestureHandler>
					</Animated.View>
				</PinchGestureHandler>
			) : null}
		</View>
	);
};

interface IDragableLine {
	lineProps: LineProps;
	viewLayout: LayoutRectangle;
	nodeLayout: LayoutRectangle;
	secNodeLayout: LayoutRectangle;
}

const DragableLine = ({ nodeLayout, lineProps, viewLayout, secNodeLayout }: IDragableLine) => {
	const x1 = nodeLayout.x + nodeLayout.width / 2;
	const y1 = nodeLayout.y + nodeLayout.height / 2;
	const x2 = secNodeLayout.x + secNodeLayout.width / 2;
	const y2 = secNodeLayout.y + secNodeLayout.height / 2;

	return <LineAnim x1={x1} y1={y1} x2={x2} y2={y2} {...lineProps} />;
};

interface IDragableView {
	id: string;
	groupIndex: number;
	child?: JSX.Element;
	onPress?: (id: string) => void;
	viewLayout: LayoutRectangle | null;
	nodeLayout: LayoutRectangle;
	deleteMode: boolean;
	setDeleteMode: (flag: boolean) => void;
	onDeleteNode: (id: string) => void;
	onLongPressListener?: (id: string) => void;
	deleteNodeViewStyle?: ViewStyle;
	deleteNodeLineStyle?: ViewStyle;
	enableDeleteMode: boolean;
	adjustSize: NodeSize | null;
}

const DragableView = ({
	id,
	child,
	onPress,
	deleteMode,
	setDeleteMode,
	onDeleteNode,
	onLongPressListener,
	deleteNodeViewStyle,
	deleteNodeLineStyle,
	enableDeleteMode,
	adjustSize,
}: IDragableView) => {
	const rotateAnim = useRef(new Animated.Value(0)).current;
	const rotateAnimInter = rotateAnim.interpolate({ inputRange: [-0.04, 0.04], outputRange: ['-3deg', '3deg'] });

	const onTap = (nativeEvent: GestureHandlerStateChangeNativeEvent) => {
		nativeEvent.state === State.ACTIVE && onPress && onPress(id);
	};

	useEffect(() => {
		startRotate(deleteMode);
	}, [deleteMode]);

	const startRotate = (startFlag: boolean) => {
		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(rotateAnim, {
					toValue: 0.04,
					duration: 100,
					useNativeDriver: true,
				}),
				Animated.timing(rotateAnim, {
					toValue: -0.04,
					duration: 100,
					useNativeDriver: true,
				}),
			])
		);
		startFlag ? animation.start() : endRotate();
	};

	const endRotate = () => {
		Animated.timing(rotateAnim, {
			toValue: 0,
			duration: 100,
			useNativeDriver: true,
		}).start();
	};

	const onLongPress = (event: LongPressGestureHandlerStateChangeEvent) => {
		if (event.nativeEvent.state === State.ACTIVE && enableDeleteMode) {
			setDeleteMode(!deleteMode);
			onLongPressListener && onLongPressListener(id);
		}
	};

	const childNode = child && adjustSize ? React.cloneElement(child, { adjustSize: adjustSize }) : child;

	return (
		<LongPressGestureHandler minDurationMs={800} onHandlerStateChange={onLongPress}>
			<TapGestureHandler onHandlerStateChange={event => onTap(event.nativeEvent)}>
				<Animated.View
					style={{
						transform: [{ rotateZ: rotateAnimInter }],
					}}>
					<Animated.View>{childNode ?? <NodeItem adjustSize={adjustSize} />}</Animated.View>
					<DeleteNodeButton
						viewStyle={deleteNodeViewStyle}
						lineViewStyle={deleteNodeLineStyle}
						deleteMode={deleteMode}
						onDeleteNode={onDeleteNode}
						nodeId={id}
					/>
				</Animated.View>
			</TapGestureHandler>
		</LongPressGestureHandler>
	);
};

interface IDeleteNodeButton {
	deleteMode: boolean;
	onDeleteNode: (id: string) => void;
	nodeId: string;
	viewStyle?: ViewStyle;
	lineViewStyle?: ViewStyle;
}

const DeleteNodeButton = ({ deleteMode, onDeleteNode, nodeId, viewStyle, lineViewStyle }: IDeleteNodeButton) => {
	const position = -5;
	const scaleAnim = useRef(new Animated.Value(0)).current;
	const deleteModePrevious = usePrevious(deleteMode);
	
	useEffect(() => {
		if (deleteModePrevious && !deleteMode) {
			scaleDown();
		}
		if (deleteMode) {
			scaleUp();
		}
	}, [deleteMode]);

	const scaleUp = () => {
		Animated.spring(scaleAnim, {
			toValue: 1,
			bounciness: 20,
			useNativeDriver: true,
		}).start();
	};

	const scaleDown = () => {
		Animated.spring(scaleAnim, {
			toValue: 0,
			bounciness: 5,
			useNativeDriver: true,
		}).start();
	};

	const onTap = (nativeEvent: GestureHandlerStateChangeNativeEvent) => {
		nativeEvent.state === State.ACTIVE && onDeleteNode(nodeId);
	};

	return (
		<TapGestureHandler onHandlerStateChange={event => onTap(event.nativeEvent)}>
			<Animated.View
				style={{
					height: 20,
					width: 20,
					borderRadius: 20 / 2,
					backgroundColor: '#ebeef2',
					position: 'absolute',
					left: position,
					top: position,
					transform: [{ scale: scaleAnim }],
					alignItems: 'center',
					justifyContent: 'center',
					...viewStyle,
				}}>
				<View style={{ width: '60%', height: 2, backgroundColor: '#40464d', borderRadius: 10, ...lineViewStyle }} />
			</Animated.View>
		</TapGestureHandler>
	);
};

// Hook
function usePrevious<T>(value: T): T {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref: any = useRef<T>();
  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

export default NodeView;
