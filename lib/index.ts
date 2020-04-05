import { EventEmitter } from 'events'
import axios from 'axios'
import Path from 'path'
import fs from 'fs'
import downloadImage from './functions'

export class ManladagSource extends EventEmitter implements source{
    site:string
    url:string
    getNumberPageChapter(manga:manga,chapter:number):Promise<number>{
        return Promise.resolve(0)
    }
    getUrlPages(manga:manga,chapter:number,numberPage:number):Promise<string[]>{
        return Promise.resolve([])
    }
    getLastChapter(manga:manga):Promise<number> {
        return Promise.resolve(0)
    }
    chapterIsAvailable(manga:manga,chapter:number): Promise<boolean> {
        return Promise.resolve(false)
    }
    mangas:{ [name:string]: manga }
    constructor( source : source ) {
        super()
        this.site = source.site
        this.url = source.url
        this.mangas = source.mangas
        this.getNumberPageChapter = source.getNumberPageChapter
        this.getUrlPages = source.getUrlPages
        this.chapterIsAvailable = source.chapterIsAvailable
        this.getLastChapter = source.getLastChapter
    }

    /**
     * downloadChapter
     */
    public async downloadChapter(manga_key:string,chapter:number,dirDownload:string) {
        try {
            if(chapter<0) throw new Error(`chapter should be a valid number but its '${chapter}'`)
            if(fs.existsSync(dirDownload)) {
                if(fs.lstatSync(dirDownload).isFile()) throw new Error(`${dirDownload} is not a directory`)
            } else {
                throw new Error(`the directory '${dirDownload}' doesnt exist`)
            }
            const manga = this.getManga(manga_key)

            if(!(await this.chapterIsAvailable(manga,chapter))) throw new Error(`The chapter ${chapter} is not available on ${this.site}`)

            const numberPage:number = await this.getNumberPageChapter(manga,chapter)

            const tabUrl:string[] = await this.getUrlPages(manga,chapter,numberPage)

            let path:string,ext:string

            this.emit('download-chapter-started', {manga:manga.name,numberPage,path:dirDownload,chapter,source:this.site})

            for(let i =0;i<numberPage;i++) {
                ext = Path.extname(Path.basename(tabUrl[i]))
                ext = (ext=='.jpg'||ext=='.png')? `${ext}`:'.jpg'
                path = Path.join(dirDownload,(i<10 ? `0${i+ext}`: `${i+ext}`))

                this.emit('download-page-started', {path,page:i,chapter,source:this.site,manga})
                try {
                    await downloadImage(path,tabUrl[i],i)
                    this.emit('download-page-finished', {path,page:i,chapter,source:this.site,manga:manga.name})
                } catch(e) {
                    this.emit('download-page-error', {path,page:i,chapter,source:this.site,error:e,manga:manga.name})
                    throw e
                }
            }
            this.emit('download-chapter-finished', {manga:manga.name,numberPage,path:dirDownload,chapter,source:this.site})

        } catch (e) {
            this.emit('download-chapter-error', {chapter,source:this.site,error:e,manga:manga_key})
            throw e
        }
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
     * addOnDownloadPageFinishedListener
     *  add a callback when a download's page finished
     */
    public addOnDownloadPageFinishedListener(listener:onDonwloadPageFinishedListener) {
        this.on('download-page-finished', listener)
    }

    /**
     * addOnDownloadPageStartedListener
     * add a callback when a download's page started
     */
    public addOnDownloadPageStartedListener(listener:onDonwloadPageStartedListener) {
        this.on('download-page-started', listener)
    }

    /**
     * addOnDownloadPageErrorListener
     * add a callback when a download's page throw Error
     */
    public addOnDownloadPageErrorListener(listener:onDonwloadPageErrorListener) {
        this.on('download-page-started', listener)
    }

    /**
     * addOnDownloadChapterStartedListener
     * add a callback when a download's chapter started
     */
    public addOnDownloadChapterStartedListener(listener:onDonwloadChapterStartedListener) {
        this.on('download-chapter-started', listener)
    }

    /**
     * addDownloadChapterFinishedListener
     * add a callback when a download's page finished
     */
    public addDownloadChapterFinishedListener(listener:onDonwloadChapterFinishedListener) {
        this.on('download-chapter-finished', listener)
    }

    /**
     * addDownloadChapterErrorListener
     * add a callback when a download's chapter throw Error
     */
    public addDownloadChapterErrorListener(listener:onDonwloadChapterErrorListener) {
        this.on('download-chapter-error', listener)
    }
}

