/// <reference path="source.ts"/>
interface argsOnDonwloadPageStartedListener {
  path:string,
  page:number,
  source:source,
  manga:string,
  chapter:number,
  numberPage: number
}

interface argsOnDonwloadPageFinishedListener {
  path:string,
  page:number,
  source:source,
  manga:string,
  chapter:number,
  numberPage: number
}

interface argsOnDonwloadPageErrorListener {
  path:string,
  page:number,
  source:source,
  manga:string,
  error:Error,
  chapter:number
}

interface argsOnDonwloadChapterStartedListener {
  manga:string,
  path:string,
  numberPage:number,
  source:string,
  chapter:number
}

interface argsOnDonwloadChapterErrorListener {manga:string,path:string,numberPage:number,source:string,chapter:number,error:Error}
 

interface argsOnDonwloadChapterFinishedListener {
  manga:string,
  path:string,
  numberPage:number,
  source:string,
  chapter:number
}

interface argsOnDonwloadChapterAbortedListener extends argsOnDonwloadChapterFinishedListener {

}

interface argsOnDonwloadChapterErrorListener {
  manga:string,
  path:string,
  numberPage:number,
  source:string,
  chapter:number,
  error:Error
}

interface argsOnDonwloadChapterRestartedListener extends argsOnDonwloadChapterFinishedListener {
  error?:Error
  restartCount:number
  maxRestart:number
}
 

namespace Manladag {
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
}

interface MlagManifestProperties {
  site:string,
  url:string,
  manga:manga,
  chapter: number,
  "pages-number": number,
  "download-date": string,
  "manifest-version": string
}
