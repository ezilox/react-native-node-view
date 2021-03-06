import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Dimensions, Text, Animated, Easing, Alert, Button } from 'react-native';
import {
	HandlerStateChangeEvent,
	State,
	TapGestureHandler,
	TapGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { loadNoteAsync, Piano, notes as pianoNotes } from './piano';
import CannonInD from './midis/CannonInDShort.json';
import { Audio } from 'expo-av';

const { height: ScreenHeight, width: ScreenWidth } = Dimensions.get('screen');
const tileWidth = ScreenWidth / 4;
const tileHeight = Math.round(ScreenHeight * 0.2);
const tileCount = 100;
const gameHeight = tileCount * tileHeight;
const speed = 800;
const duration = tileCount * speed;

interface Tail {
	id: number;
	offsetX: number;
	offsetY: number;
}

const generateTiles = () => {
	return Array(tileCount)
		.fill(null)
		.map((value, index) => {
			const tileColumn = Math.floor(Math.random() * 4);
			return { id: index, offsetX: tileColumn * tileWidth, offsetY: index * tileHeight };
		});
};

const initAnimationValue = new Animated.Value(ScreenHeight - gameHeight);

interface Note {
	play: () => void;
	name: string;
}

const TilesGame = () => {
	const translateAnimation = useRef(initAnimationValue).current;
	const [piano, setPiano] = useState<Piano>();
	const [notes, setNotes] = useState<Note[][]>();
	console.log('notes', notes?.length);

	const createSong = async () => {
		const notes: { [time: number]: Array<Note> } = {};

		const playableNotes = await Promise.all(
			CannonInD.tracks[0].notes.map(async midiNote => {
				const name = midiNote.name;
				console.log('note to load', name);
				const { sound: playNote, status } = await Audio.Sound.createAsync(pianoNotes[name]);
				await playNote.playAsync()
				const playableNote: Note = { play: () => playNote.playFromPositionAsync(0, {toleranceMillisAfter: 0}), name: name };
				return playableNote;
			})
		);
		CannonInD.tracks[0].notes.forEach(midiNote => {
			const name = midiNote.name;
			const playableNote = playableNotes.find(playableNote => playableNote.name === name);
			if (playableNote) {
				notes[midiNote.time] = notes[midiNote.time] ? [...notes[midiNote.time], playableNote] : [playableNote];
			}
		});
		// for (const midiNoteKey in CannonInD.tracks[0].notes) {
		// 	if (Object.prototype.hasOwnProperty.call(CannonInD.tracks[0].notes, midiNoteKey)) {
		// 		const midiNote = CannonInD.tracks[0].notes[midiNoteKey];
		// 		const name = midiNote.name;
		// 		console.log("note to load", name);

		// 		const playNote = await loadNoteAsync(pianoNotes[name]);
		// 		const playableNote: Note = { play: playNote.replayAsync };
		// 		console.log("note has loaded", name);

		// 		notes[midiNote.time] = notes[midiNote.time] ? [...notes[midiNote.time], playableNote] : [playableNote];
		// 	}
		// }
		return Object.values(notes);
	};

	useEffect(() => {
		loadSong();
	}, []);

	const loadSong = async () => {
		const notes = await createSong();
		console.log('loaded notes');

		setNotes(notes);
	};

	// const cannonInDNotes = useMemo(() => {
	// 	const notes: { [time: number]: Array<string> } = {};

	// 	CannonInD.tracks[0].notes.forEach(note => {
	// 		notes[note.time] = notes[note.time] ? [...notes[note.time], note.name] : [note.name];
	// 	});

	// 	return Object.values(notes).map(notesGroup => notesGroup);
	// }, []);

	const [pressedTiles, setPressedTiles] = useState<Array<number>>([]);
	const [isGameStarted, setIsGameStarted] = useState(false);
	const [gameCount, setGameCount] = useState(0);
	const tiles = useMemo(generateTiles, [gameCount]);

	const addPressedTile = useCallback(
		(index: number) => {
			if (!notes) {
				return;
			}
			const tempTiles = [...pressedTiles];
			const notesToPlay = notes[index];
			console.log('noteToPlay1', notesToPlay);

			// notesToPlay[0].play();
			notesToPlay.forEach(note => note.play());
			const lastItem = tempTiles[tempTiles.length - 1];
			if (lastItem === index - 1 || (index === 0 && tempTiles.length === 0)) {
				index === 0 && setIsGameStarted(true);
				tempTiles.push(index);
				setPressedTiles(tempTiles);
			}
		},
		[pressedTiles, piano, notes?.length]
	);

	const restartGame = () => {
		setGameCount(gameCount + 1);
		setPressedTiles([]);
		setIsGameStarted(false);
		translateAnimation.setValue(ScreenHeight - gameHeight);
	};

	useEffect(() => {
		// loadPiano();
	}, []);

	const loadPiano = async () => {
		const piano = new Piano();
		await piano.loadNotes();
		console.log('piano has been loaded');

		setPiano(piano);
	};

	useEffect(() => {
		if (pressedTiles.length === tiles.length) {
			Alert.alert('Very Good', 'Play Again?', [{ text: 'Yes', onPress: restartGame }]);
		}
	}, [pressedTiles]);

	const renderTiles = useMemo(
		() =>
			tiles.map(tile => (
				<Tile
					isPressed={pressedTiles.includes(tile.id)}
					setIsPressed={() => addPressedTile(tile.id)}
					key={tile.id}
					tile={tile}
				/>
			)),
		[pressedTiles, notes]
	);

	const validateTiles = (offset: number) => {
		const offsetInter = offset - ScreenHeight + gameHeight;

		if (pressedTiles.length === 0 && offsetInter > tileHeight) {
			return false;
		}

		if (pressedTiles.length > 0 && offsetInter > tileHeight * (pressedTiles.length + 1)) {
			return false;
		}

		return true;
	};

	useEffect(() => {
		if (isGameStarted) {
			Animated.timing(translateAnimation, {
				toValue: ScreenHeight,
				useNativeDriver: true,
				duration: duration,
				easing: Easing.linear,
			}).start();
		}
	}, [isGameStarted]);

	useEffect(() => {
		translateAnimation.removeAllListeners();
		translateAnimation.addListener(event => {
			const isValid = validateTiles(event.value);
			if (!isValid) {
				translateAnimation.stopAnimation();
				Alert.alert('Ops :(', 'Play Again?', [{ text: 'Yes', onPress: restartGame }]);
			}
		});
		return () => {
			translateAnimation.removeAllListeners();
		};
	}, [pressedTiles]);

	// return (
	// 	<View style={{ marginTop: 200 }}>
	// 		<Button onPress={() => piano?.playNote['F4'].playFromPositionAsync(0)} title="play sound" />
	// 	</View>
	// );
	return (
		<View style={{ flex: 1, flexDirection: 'row', position: 'relative' }}>
			<View style={{ position: 'absolute', zIndex: 0, flexDirection: 'row', height: ScreenHeight, width: ScreenWidth }}>
				<View style={{ width: tileWidth, borderWidth: 1, borderColor: 'black', left: tileWidth }} />
				<View style={{ width: tileWidth, borderWidth: 1, borderColor: 'black', left: tileWidth * 2 }} />
			</View>
			<Animated.View style={{ height: gameHeight, transform: [{ translateY: translateAnimation }] }}>
				{renderTiles}
			</Animated.View>
		</View>
	);
};

interface ITile {
	tile: Tail;
	setIsPressed: () => void;
	isPressed: boolean;
}

const Tile: React.FC<ITile> = ({ tile, setIsPressed, isPressed }) => {
	const onPress = (event: HandlerStateChangeEvent<TapGestureHandlerEventPayload>) => {
		if (event.nativeEvent.state === State.BEGAN) {
			setIsPressed();
		}
	};
	return (
		<TapGestureHandler onHandlerStateChange={event => onPress(event)}>
			<View
				key={tile.id}
				style={{
					backgroundColor: isPressed ? 'gray' : 'black',
					position: 'absolute',
					height: tileHeight,
					width: tileWidth,
					left: tile.offsetX,
					bottom: tile.offsetY,
					borderTopWidth: 0.5,

					borderColor: 'rgb(30, 30, 30)',
				}}>
				<Text style={{ color: 'white' }}>{tile.id + 1}</Text>
			</View>
		</TapGestureHandler>
	);
};

export default TilesGame;
