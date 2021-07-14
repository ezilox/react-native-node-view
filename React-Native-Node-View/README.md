# Screenshots

<p float="left">
  <img title="asdadasda" alt="#dada" src="https://github.com/ezilox/react-native-node-view/raw/main/docs/my_node_graph.gif" width="207" height="448" />
  <img title="asdadasda" alt="#dada" src="https://github.com/ezilox/react-native-node-view/raw/main/docs/my_little_node_graph.gif" width="207" height="448" />
  <img title="asdadasda" alt="#dada" src="https://github.com/ezilox/react-native-node-view/raw/main/docs/Simulator%20Screen%20Recording%20-%20iPhone%2011%20-%202021-07-14%20at%2021.25.12%20(1).gif" width="207" height="448" />
</p>

# How To Use

Install

```console
npm i react-native-node-view
```

Import

```jsx
import NodeView from 'react-native-node-view';
```

## Examples

Simple

```jsx
<NodeView
	nodesGroups={[
		{ nodes: [{ id: '1', lineTo: ['2', '3'], onPress: id => console.log(id) }] },
		{ nodes: [{ id: '2' }, { id: '3' }] },
	]}
/>
```

Inside view

```jsx
<View style={{ width: 300, height: 300, alignSelf: 'center', borderWidth: 1, borderRadius: 10, borderColor: 'gray' }}>
	<NodeView
		nodesGroups={[
			{ nodes: [{ id: '1', lineTo: ['2', '3'], onPress: id => console.log(id) }] },
			{ nodes: [{ id: '2' }, { id: '3' }] },
		]}
	/>
</View>
```

With delete operation

```jsx
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
```

# API

## nodesGroups Object

| Prop Name           | Description                          | Type                                                                         | required |
| ------------------- | ------------------------------------ | ---------------------------------------------------------------------------- | -------- |
| nodesGroups         | List of Node objects                 | Array <NodeGroup>                                                            | true     |
| containerStyle      | Style of the node view container     | ViewStyle                                                                    | false    |
| lineStyle           | Style for each line of the node view | LineProps                                                                    | false    |
| onDeleteNode        | On deleting node                     | (id: string, oldState: Array<NodeGroup>, newState: Array<NodeGroup>) => void | false    |
| onLongPress         | Listener for node long press         | (id: string) => void                                                         | false    |
| maxZoom             | Max zoom                             | number                                                                       | 1.5      |
| minZoom             | Min zoom                             | number                                                                       | 0.5      |
| maxPan              | Max movement for pan gesture         | number                                                                       | 100      |
| minPan              | Min movement for pan gesture         | number                                                                       | -100     |
| enablePan           | Enable pan gesture                   | boolean                                                                      | false    |
| enableZoom          | Enable pinch gesture                 | boolean                                                                      | false    |
| deleteNodeViewStyle | Delete node container style          | ViewStyle                                                                    | false    |
| deleteNodeLineStyle | Delete node line container style     | ViewStyle                                                                    | false    |
| enableDeleteMode    | Style for each line of the node view | boolean                                                                      | true     |

## Node Object

| Prop Name | Description                                      | Type                 | required |
| --------- | ------------------------------------------------ | -------------------- | -------- |
| id        | The id of the node                               | string               | true     |
| lineTo    | List of all the lines to draw to each node by id | list                 | false    |
| child     | Custom component to use                          | JSX.Element          | false    |
| onPress   | On press listener                                | (id: string) => void | false    |

# Supported

Tested on Android and IOS with expo sdk 41
