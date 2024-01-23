var SpellChecker = require('simple-spellchecker');
SpellChecker.getDictionary('en-EN', function (err, dictionary) {
	if (!err) {
		var misspelled = !dictionary.spellCheck('maisonn');
		if (misspelled) {
			var suggestions = dictionary.getSuggestions('maisonn');
		}
	}
});
console.log(SpellChecker.spellCheck('dic'));
