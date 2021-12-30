export interface argsOnDonwloadPageStartedListener {
  path:string,
  page:number,
  source:Manladag.source,
  manga:string,
  chapter:number,
  numberPage: number
}

export interface argsOnDonwloadPageFinishedListener {
  path:string,
  page:number,
  source:Manladag.source,
  manga:string,
  chapter:number,
  numberPage: number
}

export interface argsOnDonwloadPageErrorListener {
  path:string,
  page:number,
  source:Manladag.source,
  manga:string,
  error:Error,
  chapter:number
}

export interface argsOnDonwloadChapterStartedListener {
  manga:string,
  path:string,
  numberPage:number,
  source:string,
  chapter:number
}

export interface argsOnDonwloadChapterErrorListener {manga:string,path:string,numberPage:number,source:string,chapter:number,error:Error}
 

export interface argsOnDonwloadChapterFinishedListener {
  manga:string,
  path:string,
  numberPage:number,
  source:string,
  chapter:number
}

export type argsOnDonwloadChapterAbortedListener = argsOnDonwloadChapterFinishedListener 

export interface argsOnDonwloadChapterErrorListener {
  manga:string,
  path:string,
  numberPage:number,
  source:string,
  chapter:number,
  error:Error
}

export interface argsOnDonwloadChapterRestartedListener extends argsOnDonwloadChapterFinishedListener {
  error?:Error
  restartCount:number
  maxRestart:number
}
 

export namespace Manladag {
  export namespace Download {
    export namespace Events {
      export interface onDonwloadPageStartedListener {
        (args:argsOnDonwloadPageStartedListener ): void 
      }
      export interface onDonwloadPageFinishedListener{ 
        ( args: argsOnDonwloadPageFinishedListener ): void
      }
      export interface onDonwloadPageErrorListener{
        ( args:argsOnDonwloadPageErrorListener ): void
      }
      export interface onDonwloadChapterStartedListener{
        ( args:argsOnDonwloadChapterStartedListener ): void
      }
      export interface onDonwloadChapterFinishedListener{
        ( args:argsOnDonwloadChapterFinishedListener ): void
      }
      export interface onDonwloadChapterAbortedListener{
        ( args:argsOnDonwloadChapterAbortedListener ): void
      }
      export interface onDonwloadChapterErrorListener{
        ( args:argsOnDonwloadChapterErrorListener ): void
      }
      export interface onDonwloadChapterRestartedListener{
        ( args:argsOnDonwloadChapterRestartedListener ): void
      }
    }
  }
  export interface DownloadEvents {
    onDonwloadPageStartedListener?: Manladag.Download.Events.onDonwloadPageStartedListener,
    onDonwloadPageFinishedListener?: Manladag.Download.Events.onDonwloadPageFinishedListener ,
    onDonwloadPageErrorListener?: Manladag.Download.Events.onDonwloadPageErrorListener,
    onDonwloadChapterStartedListener?: Manladag.Download.Events.onDonwloadChapterStartedListener,
    onDonwloadChapterFinishedListener?: Manladag.Download.Events.onDonwloadChapterFinishedListener,
    onDonwloadChapterErrorListener?: Manladag.Download.Events.onDonwloadChapterErrorListener,
    onDonwloadChapterAbortedListener?: Manladag.Download.Events.onDonwloadChapterAbortedListener,
    onDonwloadChapterRestartedListener?: Manladag.Download.Events.onDonwloadChapterRestartedListener
    
  }
  export interface MlagManifestProperties {
    site:string,
    url:string,
    manga:manga,
    chapter: number,
    "pages-number": number,
    "download-date": string,
    "manifest-version": string
  }
  export interface manga {
    name: string
  }

  export interface source {
      site: string,
      url: string,
      mangas: { [name:string]: manga },
      getNumberPageChapter(manga:manga,chapter:number):Promise<number>,
      getUrlPages(manga:manga,chapter:number):Promise<string[]>,
      getLastChapter(manga:manga):Promise<number>,
      chapterIsAvailable(manga:manga,chapter:number) : Promise<boolean>
      getChaptersAvailable?(manga:manga, fromChapter:number, toChapter:number): Promise<number[]>
  }
}


