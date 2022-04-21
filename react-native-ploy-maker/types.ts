interface SimplePoint {
	x: number;
	y: number;
	c: number;
}

interface Point {
	id: string;
	x: number;
	y: number;
	associateLine: { [id: string]: boolean };
}

interface SimpleLine {
	id: string;
	parentId?: string;
	startPoint: SimplePoint;
	endPoint: SimplePoint;
}

