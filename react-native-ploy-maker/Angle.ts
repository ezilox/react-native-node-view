export class Angle {
	id: string;
	x: number;
	y: number;
	firstLine: Line;
	secondLine: Line;
	value: null | number;

	constructor(firstLine: Line, secondLine: Line, value?: number) {
		this.id = this.angleId(firstLine, secondLine);
		this.firstLine = firstLine;
		this.secondLine = secondLine;
		this.value = value ?? null;
		this.x = firstLine.startPoint.x;
		this.y = firstLine.startPoint.y;
	}
	angleId(firstLine: Line, secondLine: Line) {
		return [firstLine.id, secondLine.id].sort().join('');
	}
}
