export const getDistanceBetweenPoints = (x1: number, y1: number, x2: number, y2: number) => {
	'worklet';
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

export const getRandomValueBetweenRange = (min: number, max: number) => {
	const difference = max - min;
	let rand = Math.random();
	rand = Math.floor(rand * difference);
	rand = rand + min;

	return rand;
};
