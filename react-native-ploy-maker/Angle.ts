import { Line } from './Line';

export class Angle {
	id: string;
	x: number;
	y: number;
	firstLine: Line;
	secondLine: Line;
	value: null | number;

	constructor(firstLine: Line, secondLine: Line, value?: number) {
		this.id = this.#angleId(firstLine, secondLine);
		this.firstLine = firstLine;
		this.secondLine = secondLine;
		this.value = value ?? null;
		const { x, y } = this.#findAnglePoint(firstLine, secondLine);
		this.x = x;
		this.y = y;
	}

	#angleId(firstLine: Line, secondLine: Line) {
		return [firstLine.id, secondLine.id].sort().join('');
	}

	#findAnglePoint(firstLine: Line, secondLine: Line) {
		if (firstLine.startPoint.x === secondLine.startPoint.x && firstLine.startPoint.y === secondLine.startPoint.y) {
			return { x: firstLine.startPoint.x, y: firstLine.startPoint.y };
		}
		if (firstLine.endPoint.x === secondLine.endPoint.x && firstLine.endPoint.y === secondLine.endPoint.y) {
			return { x: firstLine.endPoint.x, y: firstLine.endPoint.y };
		}
		if (firstLine.startPoint.x === secondLine.endPoint.x && firstLine.startPoint.y === secondLine.endPoint.y) {
			return { x: firstLine.startPoint.x, y: firstLine.startPoint.y };
		}
		if (firstLine.endPoint.x === secondLine.startPoint.x && firstLine.endPoint.y === secondLine.startPoint.y) {
			return { x: firstLine.endPoint.x, y: firstLine.endPoint.y };
		}
		console.warn('angle not found!');
		return { x: 0, y: 0 };
	}
}
