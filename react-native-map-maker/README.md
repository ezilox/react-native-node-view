# Screenshots

<p float="left">
  <img title="asdadasda" alt="#dada" src="https://github.com/ezilox/react-native-node-view/raw/main/docs/react-native-carousel-cards.gif" width="207" height="448" />
</p>

# How To Use

Install

```console
npm i react-native-card-carousel-animated
```

Import

```jsx
import Carousel from 'react-native-card-carousel-animated';
```

## Examples

Simple

```jsx
const data: Props['cards'] = [
	{
		id: 'ad3',
		title: '6',
		subtitle: 'Apples',
		child: (
			<View style={{ backgroundColor: 'lightgreen', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				<Text style={{ fontSize: 22 }}>Hello World</Text>
			</View>
		),
	},
	{
		id: 'ad5',
		title: '10',
		subtitle: 'Grapes',
		child: (
			<View style={{ backgroundColor: 'purple', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				<Text style={{ fontSize: 22 }}>Hello World</Text>
			</View>
		),
	},
	{
		id: 'ad6',
		title: '2',
		subtitle: 'Bananas',
		child: (
			<View style={{ backgroundColor: 'yellow', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				<Text style={{ fontSize: 22 }}>Hello World</Text>
			</View>
		),
	},
];

export default function App() {
	return (
		<View
			style={{
				height: 400,
				backgroundColor: 'white',
			}}>
			<View style={{ height: 50 }}></View>
			<Carousel cards={data} />
		</View>
	);
}
```

# API

## carousel Object

| Prop Name | Description                   | Type         | required |
| --------- | ----------------------------- | ------------ | -------- |
| cards     | List of card objects          | Array <Card> | true     |
| rtlFlag   | Revert side for rtl languages | boolean      | false    |

## Card Object

| Prop Name     | Description                               | Type        | required |
| ------------- | ----------------------------------------- | ----------- | -------- |
| id            | The id of the card                        | string      | true     |
| title         | Card title                                | string      | true     |
| subtitle      | Card subtitle                             | string      | true     |
| child         | Component that will render below the card | JSX.Element | true     |
| titleStyle    | Title text style                          | TextStyle   | false    |
| subtitleStyle | Subtitle text style                       | TextStyle   | false    |

# Supported

Tested on Android and IOS with expo sdk 41
