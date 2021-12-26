
import { EventEmitter } from 'events'
import Path from 'path'
import fs, { lstatSync } from 'fs'
import AdmZip from 'adm-zip'

import { downloadImage } from './functions'
import { Manladag, _DOWNLOAD } from '.'

export class ManladagDownload extends EventEmitter{
    readonly dirDownload:string
    readonly manga:Manladag.manga
    readonly chapter:number
    readonly site: string
    readonly url: string
    readonly pagesUrl: string[]
    private state: number = _DOWNLOAD.STATE.WAITING_TO_START
    private tryCount = 0
    private maxTry = 1

    private mlagPath: string |undefined

    constructor(source: { site:string, url:string }, manga: Manladag.manga, chapter: number, pagesUrl: string[], dirDownload:string, opts: { events?: Manladag.DownloadEvents, flag?:number, mlag?: string }) {
        super()
        this.site = source.site
        this.url = source.url
        this.pagesUrl = pagesUrl
        this.dirDownload = dirDownload
        this.manga = manga
        this.chapter = chapter
        this.setMlagPtah(opts.mlag)

        if(opts.events) {
            if(opts.events.onDonwloadPageStartedListener) this.setOnDownloadPageStartedListener(opts.events.onDonwloadPageStartedListener)
            if(opts.events.onDonwloadPageFinishedListener) this.setOnDownloadPageFinishedListener(opts.events.onDonwloadPageFinishedListener)
            if(opts.events.onDonwloadPageErrorListener) this.setOnDownloadPageErrorListener(opts.events.onDonwloadPageErrorListener)
            if(opts.events.onDonwloadChapterStartedListener) this.setOnDownloadChapterStartedListener(opts.events.onDonwloadChapterStartedListener)
            if(opts.events.onDonwloadChapterFinishedListener) this.setOnDownloadChapterFinishedListener(opts.events.onDonwloadChapterFinishedListener)
            if(opts.events.onDonwloadChapterErrorListener) this.setOnDownloadChapterErrorListener(opts.events.onDonwloadChapterErrorListener)
            if(opts.events.onDonwloadChapterAbortedListener) this.setOnDownloadChapterAbortedListener(opts.events.onDonwloadChapterAbortedListener)
            if(opts.events.onDonwloadChapterRestartedListener) this.setOnDownloadChapterRestartedListener(opts.events.onDonwloadChapterRestartedListener)
        }

        if((opts.flag ? opts.flag : _DOWNLOAD.INIT.AUTO_START) & _DOWNLOAD.INIT.AUTO_START )
            this.start()
    }
    /**
     * Start the download when possible
     * @param {number} [maxRestart=0] the maximum number of times the download can be restarted if it does not succeed
     */
    public start(maxRestart = 0){
        if(this.state & (_DOWNLOAD.STATE.WAITING_TO_START | _DOWNLOAD.STATE.FINISHED)) {
            this.reset()
            this.maxTry = maxRestart++
            this._start()
            return _DOWNLOAD.ACTION.DONE
        }
        else return _DOWNLOAD.ACTION.NOT_DONE
        
    }

    private async _start() {

        const numberPage = this.pagesUrl.length
        try {
            this.state = _DOWNLOAD.STATE.STARTED
            let path:string

            this.emit('download-chapter-started', {manga:this.manga.name,numberPage,path:this.dirDownload,chapter: this.chapter,source:this.site})

            for(let i =0;i<numberPage;i++) {
                if(this.state & _DOWNLOAD.STATE.WAITING_TO_ABORT)
                    break  
                path = this._getPageUrlPath(i)

                this.emit('download-page-started', {path,page:i+1,chapter: this.chapter,source:this.site,manga: this.manga.name, numberPage})
                try {
                    await this._downloadImage(path,this.pagesUrl[i],i+1)
                    this.emit('download-page-finished', {path,page:i+1,chapter: this.chapter,source:this.site,manga:this.manga.name, numberPage})
                } catch(e) {
                    this.emit('download-page-error', {path,page:i+1,chapter: this.chapter,source:this.site,error:e,manga:this.manga.name, numberPage})
                    throw e
                }
            }
            if(this.state & (_DOWNLOAD.STATE.WAITING_TO_ABORT | _DOWNLOAD.STATE.FORCE_ABORT)) {
                const forceAbort = this.state & _DOWNLOAD.STATE.FORCE_ABORT
                const restart = this.state & _DOWNLOAD.STATE.WAITING_TO_RESTART
                this.state = _DOWNLOAD.STATE.WAITING_TO_START
                if(restart && !forceAbort) {
                    this.emit('download-chapter-restarted', {manga:this.manga.name,numberPage,path:this.dirDownload,chapter: this.chapter,source:this.site, restartCount: this.tryCount})
                    this.start()
                } 
                else this.emit('download-chapter-aborted', {manga:this.manga.name,numberPage,path:this.dirDownload,chapter: this.chapter,source:this.site})
                
            }
            else {
                if(this.mlagPath) {
                    this._mlag()
                }
                this.state = _DOWNLOAD.STATE.FINISHED
                this.emit('download-chapter-finished', {manga:this.manga.name,numberPage,path:this.mlagPath? this.mlagPath : this.dirDownload,chapter: this.chapter,source:this.site})
                this.reset()
            }
            return null
        }catch (e) {
            this.state = _DOWNLOAD.STATE.WAITING_TO_START
            if(this.tryCount>this.maxTry) {
                this.emit('download-chapter-error', {chapter: this.chapter,source:this.site,error:e,manga:this.manga.name, path:this.dirDownload, numberPage})
            } else {
                this.emit('download-chapter-restarted', {manga:this.manga.name,numberPage,path:this.dirDownload,chapter: this.chapter,source:this.site, error:e, restartCount: this.tryCount, maxRestart: this.maxTry})
                await this._restart()
            }
            return null
        }
    }

    /**
     * Abort the download when possible
     */
    public abort() {
        if(this.state & (_DOWNLOAD.STATE.STARTED | _DOWNLOAD.STATE.WAITING_TO_RESTART | _DOWNLOAD.STATE.WAITING_TO_ABORT)) {
            if(this.state & _DOWNLOAD.STATE.WAITING_TO_ABORT) this.state = _DOWNLOAD.STATE.FORCE_ABORT
            else this.state = this.state & _DOWNLOAD.STATE.WAITING_TO_RESTART ? _DOWNLOAD.STATE.WAITING_TO_ABORT | _DOWNLOAD.STATE.WAITING_TO_RESTART : _DOWNLOAD.STATE.WAITING_TO_ABORT
            return _DOWNLOAD.ACTION.DONE
        } else {
            return _DOWNLOAD.ACTION.NOT_DONE
        }
    }

    /**
     * Restart the download when possible
     */
    public restart() {
         if(this.state & _DOWNLOAD.STATE.STARTED) {
            this.state = _DOWNLOAD.STATE.WAITING_TO_RESTART
            return this.abort()
         } else {
             return _DOWNLOAD.ACTION.NOT_DONE
         }
     }

     private async _restart() {
         if(this.tryCount<=this.maxTry) {
             this.tryCount++
             await this._start()
         }
     }



    private async _downloadImage(path:string, url:string,page:number) {
        await downloadImage(path, url, page)        
    }

    private _mlag() {
        const infos = {
            "site": this.site,
            "url": this.url,
            "manga": {name: this.manga.name},
            "chapter": this.chapter,
            "download-date": ((date:number) => {
                let d = new Date(date),
                    month = '' + (d.getMonth() + 1),
                    day = '' + d.getDate(),
                    year = d.getFullYear();
            
                if(month.length < 2) 
                    month = '0' + month;
                if(day.length < 2) 
                    day = '0' + day;
            
                return [year, month, day].join('-');
            })(Date.now()),
            "pages-number": this.pagesUrl.length,
            "manifest-version": "1.0.0"
        }

        const zip = new AdmZip()
        zip.addFile('manifest.json', new Buffer(JSON.stringify(infos,null,"\t")), "Manifest Entry")
        for(let i = 0;i<this.pagesUrl.length;i++) {
            zip.addLocalFile(this._getPageUrlPath(i))
        }
        zip.writeZip(this.mlagPath)
        for(let i = 0;i<this.pagesUrl.length;i++) {
            fs.unlinkSync(this._getPageUrlPath(i))
        }
        
    }

    private _getPageUrlPath(pageUrlIndex:number) {
        let ext = Path.extname(Path.basename(this.pagesUrl[pageUrlIndex]))
        ext = (ext=='.jpg'||ext=='.png')? `${ext}`:'.jpg'
        return Path.join(this.dirDownload,(pageUrlIndex<10 ? `0${pageUrlIndex+ext}`: `${pageUrlIndex+ext}`))
    }


    //SETTERS
    /**
     * Set the path where the download will be compressed to a mlag file
     * @param filename the path of the filename without extension if undefined the download will not be compressed
     */
    public setMlagPtah(filename:string|undefined) {
        const mlag = filename+'.mlag'
        if(filename) {
            if(!fs.existsSync(mlag)) {
                let tmp
                if(!fs.existsSync(tmp = Path.join(mlag,'..'))) throw new Error(`The directory ${tmp} doesn't exist`)
            }
            else {
                if(fs.lstatSync(mlag).isDirectory()) throw new Error(`the path ${mlag} is a directorie that already exist`)
            }
            this.mlagPath = mlag
        } else this.mlagPath = undefined
    }

    //GETTERS
    public getMlagPath() {
        return this.mlagPath
    }
    /**
     * Get the state of the download
     */
    public getState() {
        return this.state
    }


    // SETTERS EVENTS
    /**
     * Set a callback when a download's page started
     * @param listener 
     */
    public setOnDownloadPageStartedListener(listener: Manladag.Download.Events.onDonwloadPageStartedListener) {
        return this.on('download-page-started', listener)
    }

    /**
     * Set a callback when a download's page finished
     * @param listener 
     */
    public setOnDownloadPageFinishedListener(listener: Manladag.Download.Events.onDonwloadPageFinishedListener) {
        return this.on('download-page-finished', listener)
    }

    /**
     * Set a callback when a download's page throw error
     * @param listener 
     */
    public setOnDownloadPageErrorListener(listener: Manladag.Download.Events.onDonwloadPageErrorListener) {
        return this.on('download-page-error', listener)
    }

    /**
     * Set a callback when a download's chapter started
     * @param listener 
     */
    public setOnDownloadChapterStartedListener(listener: Manladag.Download.Events.onDonwloadChapterStartedListener): this {
        return this.on('download-chapter-started', listener)
    }

    /**
     * Set a callback when a download's chapter finished
     * @param listener 
     */
    public setOnDownloadChapterFinishedListener(listener: Manladag.Download.Events.onDonwloadChapterFinishedListener) {
        return this.on('download-chapter-finished', listener)
    }

    /**
     * Set a callback when a download's chapter aborted
     * @param listener 
     */
    public setOnDownloadChapterAbortedListener(listener: Manladag.Download.Events.onDonwloadChapterAbortedListener) {
        return this.on('download-chapter-aborted', listener)
    }

    /**
     * Set a callback when a download's chapter restarted
     * @param listener 
     */
    public setOnDownloadChapterRestartedListener(listener: Manladag.Download.Events.onDonwloadChapterRestartedListener) {
        return this.on('download-chapter-restarted', listener)
    }

    /**
     * Set a callback when a download's chapter throw error
     * @param listener 
     */
    public setOnDownloadChapterErrorListener(listener:Manladag.Download.Events.onDonwloadChapterErrorListener) {
        return this.on('download-chapter-error', listener)
    }

    private reset() {
        this.tryCount = 1
        this.maxTry = 1
    }
}