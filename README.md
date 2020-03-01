# Zettai-ts
This is a "fork" (copy of the npm package, because the actual repository seems to have been taken down) of the [zettai npm package](https://www.npmjs.com/package/zettai).

The static functions of the original package have been moved into the `Zettai` class and proper scoping has been implemented (so you can parse multiple filenames back-to-back).

## Requirements
Due to zettai-ts's use of lookbehind assertions, you may need to use the --harmony flag, especially with older versions of node. You can get more information [here](https://node.green/); look for "RegExp Lookbehind Assertions." If you plan on using electron, you must be on AT LEAST version 3.0.0-beta.1 . You can get it by running `npm install electron@3.0.0-beta.$`, $ being between 1 and the current beta (8 at the time of writing). 

## Installation

```sh
$ npm install zettai-ts
```

## Usage
Typescript:
```typescript
import Zettai from 'zettai-ts';

const title = '[TaigaSubs]_Toradora!_(2008)_-_01v2_-_Tiger_and_Dragon_[1280x720_H.264_FLAC][1234ABCD].mkv';
const result = Zettai.parseAnime(title);
```

Javascript:
```javascript
const Zettai = require('zettai-ts');

const title = '[TaigaSubs]_Toradora!_(2008)_-_01v2_-_Tiger_and_Dragon_[1280x720_H.264_FLAC][1234ABCD].mkv';
const result = Zettai.parseAnime(title);
```

## Example output
```javascript
  {
    "extension": ".mkv"
    "version": "v2"
    "resolution": "1280x720"
    "videoTerm": "H264"
    "audioTerm": "FLAC"
    "checksum": "1234ABCD"
    "year": "2008"
    "episodeOrMovieNumber": "01"
    "episodeTitle": "Tiger and Dragon"
    "releaseGroup": "TaigaSubs"
    "title": "Toradora!"
  }
```
