export class Shape {
	lines: Array<Line>;
	id: string;

	constructor(shapeLines: Array<Line>) {
		this.lines = [...shapeLines];
		this.id = this.shapeId(shapeLines);
	}

	shapeId(lines: Array<Line>) {
		return String(
			lines.reduce(
				(previousValue, currentValue) =>
					String(currentValue.endPoint.x) +
					String(currentValue.endPoint.y) +
					String(currentValue.startPoint.x) +
					String(currentValue.startPoint.y) +
					String(previousValue),
				''
			)
		);
	}
}
