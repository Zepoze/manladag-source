/// <reference path="./types/index.ts"/>

import fs from 'fs'

import { ManladagDownload } from './manladagDownload'
import { ManladagLibError } from './ManladagLibError'
import ClassMlagZip from './ClassMlagZip'

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
    readonly site:string
    readonly url:string
    readonly downloadEvents: Manladag.DownloadEvents = {}
    private source:source

    /**
     * Get asynchronously the number of page corresponding to the given chapter and manga
     * @param mangaKey 
     * @param chapter 
     */

    public async getNumberPageChapter(mangaKey:string,chapter:number):Promise<number>

    /**
     * 
     * @param manga 
     * @param chapter
     * @deprecated 
     */

    public async getNumberPageChapter(mangaKey:manga,chapter:number):Promise<number>

    public async getNumberPageChapter(manga:manga|string,chapter:number):Promise<number>{
        try {
            return await this.source.getNumberPageChapter(typeof manga == 'string' ? this.getManga(manga) : manga, chapter)
        } catch(error) {
            throw new ManladagLibError(this.source, error)
        }
    }

    /**
     * Get asynchronously the pages urls corresponding to a given manga and chapter
     * @param manga 
     * @param chapter 
     */
    public async getUrlPages(manga:string,chapter:number):Promise<string[]>

    /**
     * 
     * @param manga 
     * @param chapter 
     * @deprecated
     */
    public async getUrlPages(manga:manga,chapter:number):Promise<string[]>

    public async getUrlPages(manga:manga|string,chapter:number):Promise<string[]>{
        try {
            return await this.source.getUrlPages(typeof manga == 'string' ? this.getManga(manga) : manga, chapter)
        } catch (error) {
            throw new ManladagLibError(this.source, error)
        }
    }

    /**
     * Get asynchronously the last chapter available to download corresponding to a given manga
     * @param manga 
     */
    public async getLastChapter(manga:string):Promise<number>

    /**
     * 
     * @param manga 
     * @deprecated
     */
    public async getLastChapter(manga:manga):Promise<number>

    public async getLastChapter(manga:manga|string):Promise<number> {
        try {
            return await this.source.getLastChapter(typeof manga == 'string' ? this.getManga(manga) : manga)
        } catch(error) {
            throw new ManladagLibError(this.source, error)
        }
    }

    /**
     * Return true if the given manga's chapter is available to download
     * @param manga 
     * @param chapter 
     */
    public async chapterIsAvailable(manga:string,chapter:number): Promise<boolean>

    /**
     * 
     * @param manga 
     * @param chapter 
     * @deprecated
     */
    public async chapterIsAvailable(manga:manga,chapter:number): Promise<boolean>

    public async chapterIsAvailable(manga:manga|string,chapter:number): Promise<boolean> {
        try {
            return await this.source.chapterIsAvailable(typeof manga == 'string' ? this.getManga(manga) : manga, chapter)
        } catch (error) {
            throw new ManladagLibError(this.source, error)
        }
    }

    public async getChaptersAvailable(manga:manga, fromChapter:number, toChapter:number): Promise<number[]> 
    public async getChaptersAvailable(manga:manga|string, fromChapter:number, toChapter:number): Promise<number[]>{
        if(!this.source.getChaptersAvailable) throw new Error(`The source ${this.source.site} dont implement the function \`getChaptersAvailable\` `)
    
        try {
            return this.source.getChaptersAvailable!(typeof manga == 'string' ? this.getManga(manga) : manga,fromChapter,toChapter)
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
     * Download the given mang chapter in dirDownload
     * @param manga_key 
     * @param chapter 
     * @param dirDownload 
     * @param flag Flag  _DOWNLOAD.INIT
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
     * Get manga from key
     * manga_key = typeof Object.keys(this.mngas)
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
     *   Set a callback when a download's page finished
     */
    public setOnDownloadPageFinishedListener(listener: Manladag.Download.Events.onDonwloadPageFinishedListener) {
        this.downloadEvents.onDonwloadPageFinishedListener = listener
        return this
    }

    /**
     *  Set a callback when a download's page started
     */
    public  setOnDownloadPageStartedListener(listener: Manladag.Download.Events.onDonwloadPageStartedListener) {
        this.downloadEvents.onDonwloadPageStartedListener = listener
        return this
    }

    /**
     *  Set a callback when a download's page throw Error
     */
    public  setOnDownloadPageErrorListener(listener: Manladag.Download.Events.onDonwloadPageErrorListener) {
        this.downloadEvents.onDonwloadPageErrorListener = listener
        return this
    }

    /**
     *  Set a callback when a download's chapter started
     */
    public  setOnDownloadChapterStartedListener(listener: Manladag.Download.Events.onDonwloadChapterStartedListener) {
        this.downloadEvents.onDonwloadChapterStartedListener = listener
        return this
    }

    /**
     *  Set a callback when a download's page finished
     */
    public  setOnDownloadChapterFinishedListener(listener: Manladag.Download.Events.onDonwloadChapterFinishedListener) {
        this.downloadEvents.onDonwloadChapterFinishedListener = listener
        return this
    }

    /**
     *  Set a callback when a download's chapter throw Error
     */
    public  setOnDownloadChapterErrorListener(listener:Manladag.Download.Events.onDonwloadChapterErrorListener) {
        this.downloadEvents.onDonwloadChapterErrorListener = listener
        return this
    }

    /**
     *      Set a callback when a download's chapter aborted
     */
    public  setOnDonwloadChapterAbortedListener(listener: Manladag.Download.Events.onDonwloadChapterAbortedListener) {
        this.downloadEvents.onDonwloadChapterAbortedListener = listener
        return this
    }

    /**
     *  Set a callback when a download's chapter restarted
     */
    public  setOnDonwloadChapterRestartedListener(listener: Manladag.Download.Events.onDonwloadChapterRestartedListener) {
        this.downloadEvents.onDonwloadChapterRestartedListener = listener
        return this
    }
}

export class MlagZip extends ClassMlagZip {

}