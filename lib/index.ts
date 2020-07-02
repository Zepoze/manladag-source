/// <reference path="./types/index.ts"/>

import fs from 'fs'

import { ManladagDownload } from './manladagDownload'
import { ManladagLibError } from './ManladagLibError'

export namespace _DOWNLOAD {
    export enum STATE {
        WAITING_TO_START = 0x01,
        STARTED = 0x02,
        WAITING_TO_RESTART = 0x04,
        WAITING_TO_ABORT = 0x08,
        FORCE_ABORT = 0x10,
        FINISHED = 0x20
    }
    export enum INIT {
        AUTO_START = 0b001,
        NO_AUTO_START = 0b010,
        CLEAR_EVENTS = 0b100,
    }
    export enum ACTION {
        DONE,
        NOT_DONE
    }
}

export class ManladagSource {
    site:string
    url:string
    downloadEvents: Manladag.DownloadEvents = {}
    private source:source
    async getNumberPageChapter(manga:manga,chapter:number):Promise<number>{
        try {
            return await this.source.getNumberPageChapter(manga, chapter)
        } catch(error) {
            throw new ManladagLibError(this.source, error)
        }
    }
    async getUrlPages(manga:manga,chapter:number):Promise<string[]>{
        try {
            return await this.source.getUrlPages(manga, chapter)
        } catch (error) {
            throw new ManladagLibError(this.source, error)
        }
    }
    async getLastChapter(manga:manga):Promise<number> {
        try {
            return await this.source.getLastChapter(manga)
        } catch(error) {
            throw new ManladagLibError(this.source, error)
        }
    }
    async chapterIsAvailable(manga:manga,chapter:number): Promise<boolean> {
        try {
            return await this.source.chapterIsAvailable(manga, chapter)
        } catch (error) {
            throw new ManladagLibError(this.source, error)
        }
    }
    mangas:{ [name:string]: manga }
    constructor( source : source ) {
        this.site = source.site
        this.url = source.url
        this.mangas = source.mangas
        this.source = source
    }

    /**
     * downloadChapter
     */
    public async downloadChapter(manga_key:string,chapter:number,dirDownload:string, flag:number, opts:{ mlag?:string } = {}) {
        
        if(chapter<0) throw new Error(`chapter should be a valid number but its '${chapter}'`)
        if(fs.existsSync(dirDownload)) {
            if(fs.lstatSync(dirDownload).isFile()) throw new Error(`${dirDownload} is not a directory`)
        } else {
            throw new Error(`the directory '${dirDownload}' doesnt exist`)
        }
        const manga = this.getManga(manga_key)

        if(!(await this.chapterIsAvailable(manga,chapter))) throw new Error(`The chapter ${chapter} is not available on ${this.site}`)

        const tabUrl:string[] = await this.getUrlPages(manga,chapter)

        return new ManladagDownload({ site: this.site, url: this.url}, manga, chapter, tabUrl, dirDownload, { flag, events: this.downloadEvents, mlag: opts.mlag })
      
    }

    /**
     * getManga
     */
    public getManga(manga_key:string):manga {
        const m = this.mangas[manga_key]
        if(typeof(m)=="undefined") throw new Error(`The manga_key '${manga_key}' isn't exist in ${this.site}'lib`)
        return m
    }
    /*
        Manage events
    */
    /**
     * setOnDownloadPageFinishedListener
     *   set a callback when a download's page finished
     */
    public setOnDownloadPageFinishedListener(listener: Manladag.Download.Events.onDonwloadPageFinishedListener) {
        this.downloadEvents.onDonwloadPageFinishedListener = listener
        return this
    }

    /**
     *  setOnDownloadPageStartedListener
     *  set a callback when a download's page started
     */
    public  setOnDownloadPageStartedListener(listener: Manladag.Download.Events.onDonwloadPageStartedListener) {
        this.downloadEvents.onDonwloadPageStartedListener = listener
        return this
    }

    /**
     *  setOnDownloadPageErrorListener
     *  set a callback when a download's page throw Error
     */
    public  setOnDownloadPageErrorListener(listener: Manladag.Download.Events.onDonwloadPageErrorListener) {
        this.downloadEvents.onDonwloadPageErrorListener = listener
        return this
    }

    /**
     *  setOnDownloadChapterStartedListener
     *  set a callback when a download's chapter started
     */
    public  setOnDownloadChapterStartedListener(listener: Manladag.Download.Events.onDonwloadChapterStartedListener) {
        this.downloadEvents.onDonwloadChapterStartedListener = listener
        return this
    }

    /**
     *  setOnDownloadChapterFinishedListener
     *  set a callback when a download's page finished
     */
    public  setOnDownloadChapterFinishedListener(listener: Manladag.Download.Events.onDonwloadChapterFinishedListener) {
        this.downloadEvents.onDonwloadChapterFinishedListener = listener
        return this
    }

    /**
     *  setOnDownloadChapterErrorListener
     *  set a callback when a download's chapter throw Error
     */
    public  setOnDownloadChapterErrorListener(listener:Manladag.Download.Events.onDonwloadChapterErrorListener) {
        this.downloadEvents.onDonwloadChapterErrorListener = listener
        return this
    }

    /**
     *  setOnDonwloadChapterAbortedListener
     */
    public  setOnDonwloadChapterAbortedListener(listener: Manladag.Download.Events.onDonwloadChapterAbortedListener) {
        this.downloadEvents.onDonwloadChapterAbortedListener = listener
        return this
    }

    /**
     *  setOnDonwloadChapterRestartedListener
     */
    public  setOnDonwloadChapterRestartedListener(listener: Manladag.Download.Events.onDonwloadChapterRestartedListener) {
        this.downloadEvents.onDonwloadChapterRestartedListener = listener
        return this
    }
}
