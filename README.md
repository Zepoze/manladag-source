# @manladag/source
manladag source Parent class
# But what is it ?
Manladag is class wrapper for the processing of manga's chapter on different website

# Manladag's Sources
- [Github/manladag-lelscanv](https://github.com/Zepoze/manladag-lelscanv) -> [Web](https://lelscanv.com/)

your favorite source is missing ? See below 

# Create your own library's Source
A tutorial will soon be written about it. For now you can learn how to do it with [Github/manladag-lelscanv](https://github.com/Zepoze/manladag-lelscanv)
# ManladagSource API

##### constructor(source)
To get an instance with parameter source logic

##### async downloadChapter(manga_key:string,chapter:number,dirDownload:string):void
Download given chapter of the given manga_key in the given Directory dirDownload

##### getManga(manga_key:string):manga
Manga getter 

# Events

Manladag class is extended from [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter "NodeJs Events")\
During processing of chapter as the download some events are emited and you can add listeners by two different way
~~~~ts
//add listener when a download finished
ms.on('download-chapter-finished',({path,source,manga,chapter}) => {
  console.log(`The download in ${path} of ${manga}'s chapter n°${chapter} finished`)
})

//or

ms.addOnDonwloadChapterErrorListener(({path,source,manga,chapter}) => {
  console.log(`The download in ${path} of ${manga}'s chapter n°${chapter} finished`)
})

~~~~
# How To use It
~~~~bash
$ npm install @manladag/source
~~~~

### Typescript (recomended)
Install devDependencies for Typescript developpement
~~~~bash
$ npm install @manladag/source
$ npm install typescript -D
$ npm install --save-dev @manladag/types
$ npm install --save-dev @types/node
~~~~
Now you need to configure your tsconfig.json like that (or better)
##### tsconfig.json
~~~~json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "lib": ["ES2015"],
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
    }
}
~~~~
Learn more about [Typescript](https://www.typescriptlang.org)

##### lib/index.ts
~~~~ts
import { ManladagSource } from '@manladag/source'
const LelscanvSource = require('@manladag/lelscanv').Source
//same logic than javascript
~~~~
###  Javascript

##### index.js
~~~~ts
const { ManladagSource } = require('@manladag/source')
const SourceLib = require('@manladag/lelscanv').Source
//create an instance
const Ms = new ManladagSource(SourceLib)
//set different events handling
Ms.addOnDownloadChapterStartedListener(({path,numberPage,source,manga,chapter}) => {
    console.log(`The download of ${manga}'s chapter n°${chapter} in ${path} started`)
})
Ms.addOnDownloadChapterFinishedListener(({path,numberPage,source,manga,chapter}) => {
    console.log(`The download of ${manga}'s chapter n°${chapter} in ${path} finished`)
})

// and now ? just start a download in the current directory
Ms.downloadChapter("one-piece",975,__dirname)
~~~~
A warnings can appear if you try to run with node [#issue](https://github.com/Zepoze/manladag-source/issues/4)
so use this command
~~~~bash
$ node --no-warnings index.js
~~~~
