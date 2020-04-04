# manladag-source
manladag source Parent class
# But what is it ?
Manladag is class wrapper for the processing of manga


# ManladagSource API

##### constructor(source)

~~~~ts
const { ManladagSource } = require('@manladag/source')

var ms = new ManladagSource({
   site: string,
   url: string,
   mangas: { 
    'manga-key':{
      name:"Complete name"
              ~
              ~ others properties
              ~
     }
   },
   getNumberPageChapter(manga:manga,chapter:number):Promise<number>,
   getUrlPages(manga:manga,chapter:number,numberPage:number):Promise<string[]>,
   getLastChapter(manga:manga):Promise<number>,
   chapterIsAvailable(manga:manga,chapter:number) : Promise<boolean>
})
~~~~

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


