function sentenceCounter(sentence) {
	let sentenceCounter = 0;
	let sentenceArr = sentence.split('');
	for (let i = 0; i < sentenceArr.length; i++) {
		if (sentenceArr[i] === '.' || sentenceArr[i] === '?' || sentenceArr[i] === '!') {
			sentenceCounter++;
		}
	}
	return sentenceCounter;
}
function wordCounter(sentence) {
	let wordCounter = 1;
	let wordArr = sentence.split('');
	for (let i = 0; i < wordArr.length; i++) {
		if (wordArr[i] === ' ') {
			wordCounter++;
		}
	}
	return wordCounter;
}
function letterCounter(sentence) {
	let letterCounter = 0;
	let letterArr = sentence.split('');
	for (let i = 0; i < letterArr.length; i++) {
		if ((letterArr[i] >= 'a' && letterArr[i] <= 'z') || (letterArr[i] >= 'A' && letterArr[i] <= 'Z')) {
			letterCounter++;
		}
	}
	return letterCounter;
}

export const gradeLevel = (content) => {
	let L = (letterCounter(content) / wordCounter(content)) * 100;
	let S = (sentenceCounter(content) / wordCounter(content)) * 100;
	let grade = 0.0588 * L - 0.296 * S - 15.8;
	let gradeInt = Math.round(grade);
	return `Average Grade Level of Entry: ${gradeInt}`;
};
