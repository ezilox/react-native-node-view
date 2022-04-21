import { makeAutoObservable, configure } from 'mobx';
import { Shape } from '../Shape';

configure({ enforceActions: 'never' });

class ShapeStore {
	selectedShape: Shape | null = null;
	selectedAngleId: string | null = null;
	selectedLineId: string | null = null;
	shapes: Array<Shape> = [];

	constructor() {
		makeAutoObservable(this);
	}

	get selectedAngle() {
		return this.selectedShape?.angles.find(angle => angle.id === this.selectedAngleId);
	}
	get selectedLine() {
		return this.selectedShape?.lines.find(line => line.id === this.selectedLineId);
	}
}

export default ShapeStore;
