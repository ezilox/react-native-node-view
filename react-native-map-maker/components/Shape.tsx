import React from 'react';
import { View, Animated } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

interface IShape {
  pressedRect: Array<string>;
  shapeMargin?: boolean;
  
}

const SvgAnim = Animated.createAnimatedComponent(Svg);

const Shape: React.FC<IShape> = ({ pressedRect, shapeMargin = true }) => {
	const rectSize = 15;
	const height = 150;
	const width = 150;
	const xRects = pressedRect.map(rect => rect[1]).sort((rectA, rectB) => parseInt(rectA) - parseInt(rectB));
	const yRects = pressedRect.map(rect => rect[0]).sort((rectA, rectB) => parseInt(rectA) - parseInt(rectB));

	const xOffset = xRects[0];
	const xPadding = xRects[xRects.length - 1];
	const yOffset = yRects[0];
	const yPadding = yRects[yRects.length - 1];

	const pressedRectNewPosition = pressedRect.map(
		rect => `${parseInt(rect[0]) - parseInt(yOffset)}${parseInt(rect[1]) - parseInt(xOffset)}`
	);

	const grid = [...Array(height / rectSize - (9 - parseInt(yPadding) + parseInt(yOffset))).keys()].map(
		(data, gridIndex) => {
			return (
				<SvgAnim key={gridIndex} width={(parseInt(xPadding) - parseInt(xOffset) + 1) * rectSize} height={rectSize}>
					{[...Array(width / rectSize - (9 - parseInt(xPadding) + parseInt(xOffset))).keys()].map((data, index) => {
						const key = `${gridIndex}${index}`;
						return (
							<Rect
								key={key}
								x={rectSize * index}
								y={0}
								fill={pressedRectNewPosition.includes(key) ? 'gray' : undefined}
								width={rectSize}
								height={rectSize}
							/>
						);
					})}
				</SvgAnim>
			);
		}
	);

	return (
		<View
			style={{
				flex: 0,
				backgroundColor: 'transparent',
				margin: shapeMargin ? 8 : 0,
				alignItems: 'center',
				justifyContent: 'center',
			}}>
			{grid}
		</View>
	);
};

export default Shape;
