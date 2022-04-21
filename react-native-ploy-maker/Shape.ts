import { getDistanceBetweenPoints } from './utils';
import { Angle } from './Angle';
import { Line } from './Line';

export class Shape {
	id: string;
	lines: Array<Line>;
	angles: Array<Angle>;

	constructor(shapeLines: Array<Line>) {
		this.lines = [...shapeLines];
		this.id = this.shapeId(shapeLines);
		this.angles = shapeLines.map((line, index) => {
			const beforeIndex = index - 1 < 0 ? shapeLines.length - 1 : index - 1;
			return new Angle(line, shapeLines[beforeIndex]);
		});
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

	isCloseToAngle(x: number, y: number) {
		const angleDistance = 30;

		const angleDistances = this.angles.find(angle => getDistanceBetweenPoints(x, y, angle.x, angle.y) < angleDistance);
		if (angleDistances) {
			return angleDistances;
		}
	}

	isCloseToLine(x: number, y: number) {
		const lineDistance = 30;

		const lineDistances = this.lines.find(
			line => getDistanceBetweenPoints(x, y, line.centerPoint.x, line.centerPoint.y) < lineDistance
		);

		if (lineDistances) {
			return lineDistances;
		}
	}
}
