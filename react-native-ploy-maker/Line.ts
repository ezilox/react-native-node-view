import { v4 as uuidv4 } from 'uuid';
import { getDistanceBetweenPoints, getIntersectionOfPoints, isPointOnLine } from './utils';

export class Line {
	id: string;
	parentId?: string;
	startPoint: Point;
	endPoint: Point;
	centerPoint: Point;
	value: number | undefined;
	length: number;

	constructor(startPoint: Point, endPoint: Point, parentId?: string, value?: number) {
		this.id = uuidv4();
		this.parentId = parentId;
		this.startPoint = startPoint;
		this.endPoint = endPoint;
		this.centerPoint = this.#getCenterPoint(startPoint, endPoint);
		this.length = this.#getLineLength(startPoint, endPoint);
	}

	#getCenterPoint(startPoint: Point, endPoint: Point) {
		return {
			id: uuidv4(),
			x: (startPoint.x + endPoint.x) / 2,
			y: (startPoint.y + endPoint.y) / 2,
			associateLine: { [this.id]: true },
		};
	}
	#getLineLength(startPoint: Point, endPoint: Point) {
		const length = getDistanceBetweenPoints(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
		if (length < 5) {
			console.warn('line is very small', this.id);
		}
		return length;
	}

	isPointStartPoint(point: Point) {
		return point.x === this.startPoint.x && point.y === this.startPoint.y;
	}

	isPointEndPoint(point: Point) {
		return point.x === this.endPoint.x && point.y === this.endPoint.y;
	}

	isPointInLine(point: Point) {
		if (this.isPointStartPoint(point) || this.isPointEndPoint(point)) {
			return false;
		} else {
			return isPointOnLine(point, this);
		}
	}
}
