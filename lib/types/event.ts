import { manga, source } from './source'

export declare interface argsOnDonwloadPageFinishedListener {path:string,page:number,source:source,manga:string,chapter:number}
  export declare interface onDonwloadPageFinishedListener {
    (args:argsOnDonwloadPageFinishedListener):void
}

export declare interface argsOnDonwloadPageStartedListener {path:string,page:number,source:source,manga:string,chapter:number}
export declare interface onDonwloadPageStartedListener {
    (args:argsOnDonwloadPageStartedListener):void
}

export declare interface argsOnDonwloadPageErrorListener {path:string,page:number,source:source,manga:string,error:Error,chapter:number}
  export declare interface onDonwloadPageErrorListener {
    (args:argsOnDonwloadPageErrorListener):void
}

export declare interface argsOnDonwloadChapterStartedListener {manga:string,path:string,numberPage:number,source:string,chapter:number}
  export declare interface onDonwloadChapterStartedListener {
    (args:argsOnDonwloadChapterStartedListener):void
}

export declare interface argsOnDonwloadChapterFinishedListener {manga:string,path:string,numberPage:number,source:string,chapter:number}
  export declare interface onDonwloadChapterFinishedListener {
    (args:argsOnDonwloadChapterFinishedListener):void
}

export declare interface argsOnDonwloadChapterErrorListener {manga:string,path:string,numberPage:number,source:string,chapter:number,error:Error}
  export declare interface onDonwloadChapterErrorListener {
    (args:argsOnDonwloadChapterErrorListener):void
}