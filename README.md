# Subwaydle

A Wordle-inspired NYC Subway daily puzzle game. Contains some source code lifted from the [open-source clone](https://github.com/cwackerfuss/word-guessing-game) by Hannah Park and Subwaydle(https://subwaydle.com). Subwaydle is a static JavaScript app, written using Create React App with React, Sass, Semantic UI React and Mapbox. A few Ruby scripts were written to generate JSON data files used by the app.

See it live at https://www.subwaydle.com

## Running locally

`````
# You will need to install yarn first
yarn install
yarn start
`````

* To show the map that is displayed after finishing the puzzle: sign up for an account with [Mapbox](https://www.mapbox.com), get a token and add it to an `.env` as `REACT_APP_MAPBOX_TOKEN` (Make sure to use a public token, pk.*). Then import this [style](https://www.mapbox.com/studio/styles/add-style/fryvex/cmb36yvy700ac01qvfp3deajd) and add the style url (ie. mapbox://styles/fryvex/cmb36yvy700ac01qvfp3deajd) to `.env`.

* Ruby scripts in the `scripts/` directory produce the JSON files in `src/data` that are used by the app. *Warning:* viewing the `src/data` can reveal spoilers to the puzzle! All guesses are checked against the keys in the respective `solutions.json` file to be a valid trip, and the `answers.json` contains an array for the answer of each day. The values of the `solutions.json` object contain an example trip of stations that are traveled through for the trip.


Inspirations:
* [The orginal Subwaydle](https://subwaydle.com)