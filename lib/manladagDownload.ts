
import { EventEmitter } from 'events'
import Path from 'path'

import { downloadImage } from './functions'
import { _DOWNLOAD } from '.'

export class ManladagDownload extends EventEmitter{
    dirDownload:string
    manga:manga
    chapter:number
    site: string
    url: string
    pagesUrl: string[]
    state: number = _DOWNLOAD.STATE.WAITING_TO_START
    tryCount = 0
    maxTry = 1
    constructor(source: { site:string, url:string }, manga: manga, chapter: number, pagesUrl: string[], dirDownload:string, opts: { events?: Manladag.DownloadEvents, flag?:number }) {
        super()
        this.site = source.site
        this.url = source.url
        this.pagesUrl = pagesUrl
        this.dirDownload = dirDownload
        this.manga = manga
        this.chapter = chapter


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
            let path:string,ext:string

            this.emit('download-chapter-started', {manga:this.manga.name,numberPage,path:this.dirDownload,chapter: this.chapter,source:this.site})

            for(let i =0;i<numberPage;i++) {
                if(this.state & _DOWNLOAD.STATE.WAITING_TO_ABORT)
                    break
                ext = Path.extname(Path.basename(this.pagesUrl[i]))
                ext = (ext=='.jpg'||ext=='.png')? `${ext}`:'.jpg'
                path = Path.join(this.dirDownload,(i<10 ? `0${i+ext}`: `${i+ext}`))

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
                this.state = _DOWNLOAD.STATE.FINISHED
                this.emit('download-chapter-finished', {manga:this.manga.name,numberPage,path:this.dirDownload,chapter: this.chapter,source:this.site})
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

    public abort() {
        if(this.state & (_DOWNLOAD.STATE.STARTED | _DOWNLOAD.STATE.WAITING_TO_RESTART | _DOWNLOAD.STATE.WAITING_TO_ABORT)) {
            if(this.state & _DOWNLOAD.STATE.WAITING_TO_ABORT) this.state = _DOWNLOAD.STATE.FORCE_ABORT
            else this.state = this.state & _DOWNLOAD.STATE.WAITING_TO_RESTART ? _DOWNLOAD.STATE.WAITING_TO_ABORT | _DOWNLOAD.STATE.WAITING_TO_RESTART : _DOWNLOAD.STATE.WAITING_TO_ABORT
            return _DOWNLOAD.ACTION.DONE
        } else {
            return _DOWNLOAD.ACTION.NOT_DONE
        }
    }
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

    // SETTERS
    public setOnDownloadPageStartedListener(listener: Manladag.Download.Events.onDonwloadPageStartedListener) {
        return this.on('download-page-started', listener)
    }

    public setOnDownloadPageFinishedListener(listener: Manladag.Download.Events.onDonwloadPageFinishedListener) {
        return this.on('download-page-finished', listener)
    }

    public setOnDownloadPageErrorListener(listener: Manladag.Download.Events.onDonwloadPageErrorListener) {
        return this.on('download-page-error', listener)
    }

    public setOnDownloadChapterStartedListener(listener: Manladag.Download.Events.onDonwloadChapterStartedListener): this {
        return this.on('download-chapter-started', listener)
    }

    public setOnDownloadChapterFinishedListener(listener: Manladag.Download.Events.onDonwloadChapterFinishedListener) {
        return this.on('download-chapter-finished', listener)
    }

    public setOnDownloadChapterAbortedListener(listener: Manladag.Download.Events.onDonwloadChapterAbortedListener) {
        return this.on('download-chapter-aborted', listener)
    }

    public setOnDownloadChapterRestartedListener(listener: Manladag.Download.Events.onDonwloadChapterRestartedListener) {
        return this.on('download-chapter-restarted', listener)
    }

    public setOnDownloadChapterErrorListener(listener:Manladag.Download.Events.onDonwloadChapterErrorListener) {
        return this.on('download-chapter-error', listener)
    }

    private reset() {
        this.tryCount = 1
        this.maxTry = 1
    }
}