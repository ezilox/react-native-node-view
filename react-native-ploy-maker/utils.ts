import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Line } from './Line';

const DIVISION_COUNT = 2;

export const getIntersectionOfPoints = (
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	x3: number,
	y3: number,
	x4: number,
	y4: number
) => {
	// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
	// Determine the intersection point of two line segments
	// Return FALSE if the lines don't intersect

	// Check if none of the lines are of length 0
	if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
		return false;
	}

	const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

	// Lines are parallel
	if (denominator === 0) {
		return false;
	}

	let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
	let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

	// is the intersection along the segments
	if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
		return false;
	}

	// Return a object with the x and y coordinates of the intersection
	let x = x1 + ua * (x2 - x1);
	let y = y1 + ua * (y2 - y1);

	return { x, y };
};

export const getDistanceBetweenPoints = (x1: number, y1: number, x2: number, y2: number) => {
	const xDiff = x2 - x1;
	const yDiff = y2 - y1;

	return Math.sqrt(Math.pow(yDiff, 2) + Math.pow(xDiff, 2));
};

export const deepCopy = (obj: any) => Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);

export const getInLinePoints = (line: Line, divisionCount = DIVISION_COUNT) => {
	const points: Array<Point> = Array(divisionCount - 1)
		.fill(null)
		.map((value, index) => {
			const xDiff = line.endPoint.x - line.startPoint.x;
			const yDiff = line.endPoint.y - line.startPoint.y;

			return {
				x: line.startPoint.x + ((index + 1) / divisionCount) * xDiff,
				y: line.startPoint.y + ((index + 1) / divisionCount) * yDiff,
				associateLine: { [line.id]: true },
				id: uuidv4(),
			};
		});

	return points;
};

export const isPointOnLine = (point: Point, line: Line) => {
	const firstDistance = getDistanceBetweenPoints(point.x, point.y, line.startPoint.x, line.startPoint.y);
	const secondDistance = getDistanceBetweenPoints(point.x, point.y, line.endPoint.x, line.endPoint.y);
	return firstDistance + secondDistance === line.length;
};
