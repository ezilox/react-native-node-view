export class Shape {
	lines: Array<Line>;
	id: string;

	constructor(shapeLines: Array<Line>) {
		this.lines = [...shapeLines];
		this.id = this.shapeId(shapeLines);
	}

	shapeId(lines: Array<Line>) {
		return lines
			.map(line => line.id)
			.sort()
			.join('');
	}

	hasLine(line: Line) {
    return this.id.includes(line.id);
  }
}
