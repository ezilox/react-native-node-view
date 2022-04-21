import { v4 as uuidv4 } from 'uuid';

export class Line {
	id: string;
	parentId?: string;
	startPoint: Point;
	endPoint: Point;
	centerPoint: Point;
	value: number | undefined;

	constructor(startPoint: Point, endPoint: Point, parentId?: string, value?: number) {
		this.id = uuidv4();
		this.parentId = parentId;
		this.startPoint = startPoint;
		this.endPoint = endPoint;
		this.centerPoint = this.getCenterPoint(startPoint, endPoint);
	}

	getCenterPoint(startPoint: Point, endPoint: Point) {
		return {
			id: uuidv4(),
			x: (startPoint.x + endPoint.x) / 2,
			y: (startPoint.y + endPoint.y) / 2,
			associateLine: { [this.id]: true },
		};
	}
}
