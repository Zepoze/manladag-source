const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

const Path = require('path')
const fs = require('fs')
const stream = require('stream')

const { ManladagSource, _DOWNLOAD } = require('../dist/index.js')
const  donwloadImage = require('../dist/functions.js').downloadImage

const cleanLib = {
    chapterIsAvailable: function (a,n) { return Promise.resolve(n == 900)},
    getLastChapter: sinon.fake.resolves(900),
    getNumberPageChapter: sinon.fake.resolves(21),
    getUrlPages: sinon.fake.resolves(new Array(21).fill("/image.jpg").fill("/image.bitmap", 2, 3).fill("/image.png", 11, 20)),
    mangas: {
        "one-piece":{
            name: "One Piece"
        }
    },
    site: "Example",
    url: "https://example.com"
}

const errorLib = { ...cleanLib, 
    getLastChapter: sinon.fake.throws(),
    getNumberPageChapter: sinon.fake.throws(),
    getUrlPages: sinon.fake.throws(),
    chapterIsAvailable: sinon.fake.throws()
}


describe("Test Manladag source",function () {
    this.timeout(30000)
    this.slow(2100)
    const sandbox = sinon.createSandbox()
    const m = new ManladagSource(cleanLib)

    beforeEach(function() {
        sandbox.spy(m)
    })

    afterEach(function () {
        sandbox.restore()
        sinon.restore()
        m.downloadEvents = {}
    })

    it("Normal preDownload", async  function (){

        m.setOnDownloadChapterStartedListener( startSpy = sinon.spy())

        const d = await m.downloadChapter("one-piece", await m.getLastChapter(m.mangas["one-piece"]), __dirname, _DOWNLOAD.INIT.NO_AUTO_START)


        await (function() {
            return new Promise((resolve) => {
                setTimeout(resolve, 1000)
            })
        })()

        expect(startSpy.callCount, 'download start check INIT FLAG').eq(0)

        expect(m.getManga).to.have.been.calledOnceWith("one-piece")
        expect(m.getUrlPages).to.have.been.calledOnceWith(cleanLib.mangas["one-piece"], 900)
        expect(m.chapterIsAvailable).to.have.been.calledOnceWith(cleanLib.mangas["one-piece"], 900)
        expect(m.getNumberPageChapter.callCount).eq(0)
    })


    describe("Args -> Error", function() {
        describe('First arg', function () {
            it('Not a manga in lib', async function() {
                let r
                try {
                    await m.downloadChapter("dragon ball", 900, __dirname,_DOWNLOAD.INIT.NO_AUTO_START)
                } catch (error) {
                    expect(error).to.be.an('error')
                } finally{
                    expect(r, 'should throw an error').eq(undefined)
                }
            })
        })

        describe('Second arg', function() {
            it('Invalid chapter', async function() {
                let r
                try {
                    r = await m.downloadChapter("one-piece", -10, __dirname,_DOWNLOAD.INIT.NO_AUTO_START)
                } catch (error) {
                    expect(error).to.be.an('error')
                } finally{
                    expect(r, 'should throw an error').eq(undefined)
                }
            })

            it('Unavailable chapter', async function() {
                let r
                try {
                    r = await m.downloadChapter("one-piece", 899, __dirname,_DOWNLOAD.INIT.NO_AUTO_START)
                    
                } catch (error) {
                    expect(error, 'wtf').to.be.an('error')
                } finally{
                    expect(r, 'should throw an error').eq(undefined)
                }
            })
        })

        describe('Third arg', function() {
            it('directory not existing', async function() {
                let r
                try {
                    r = await m.downloadChapter("one-piece", 900, 'oups',_DOWNLOAD.INIT.NO_AUTO_START)
        
                } catch (error) {
                    expect(error).to.be.an('error')
                } finally{
                    expect(r, 'should throw an error').eq(undefined)
                }
            })
            
            it('path is file', async function() {
                let r
                try {
                    r = await m.downloadChapter("one-piece", 900, Path.join(__filename),_DOWNLOAD.INIT.NO_AUTO_START)
        
                } catch (error) {
                    expect(error).to.be.an('error')
                } finally{
                    expect(r, 'should throw an error').eq(undefined)
                }
            })

        })
    })

    describe('source lib error',function() {
        const m2 = new ManladagSource(errorLib)
        it('chapterIsAvailable error', async function() {
            let r
            try {
                r = await m2.chapterIsAvailable(m2.mangas["one-piece"], 900)
            } catch(error) {
                expect(error.name).eq('ManladagLibError')
            } finally {
                expect(r, 'should throw an error').eq(undefined)
            }
        })

        it('getLastChapter error', async function() {
            let r
            try {
                r = await m2.getLastChapter(m.mangas["one-piece"])
            } catch(error) {
                expect(error.name).eq('ManladagLibError')
            } finally {
                expect(r, 'should throw an error').eq(undefined)
            }
        })

        it('getNumberPageChapter error', async function() {
            let r
            try {
                r = await m2.getNumberPageChapter(m.mangas["one-piece"],900)
            } catch(error) {
                expect(error.name).eq('ManladagLibError')
            } finally {
                expect(r, 'should throw an error').eq(undefined)
            }
        })

        it('getUrlPages error', async function() {
            let r
            try {
                r = await m2.getUrlPages(m2.mangas["one-piece"],900)
            } catch(error) {
                expect(error.name).eq('ManladagLibError')
            } finally {
                expect(r, 'should throw an error').eq(undefined)
            }
        })
    })

})

describe('Download test',function() {
    this.timeout(3000)
    this.slow(2100)
    const md = new ManladagSource(cleanLib)
    let stubDownloadImage
    const spyChapterStart = sinon.spy()
    const spyChapterFinish = sinon.spy()
    const spyChapterError = sinon.spy()
    const spyPageStart = sinon.spy()
    const spyPageFinish = sinon.spy()
    const spyPageError = sinon.spy()
    const spyChapterAbort = sinon.spy()
    const spyChapterRestart = sinon.spy()

    md.setOnDownloadChapterStartedListener(spyChapterStart)
    .setOnDownloadChapterFinishedListener(spyChapterFinish)
    .setOnDownloadChapterErrorListener(spyChapterError)
    .setOnDownloadPageStartedListener(spyPageStart)
    .setOnDownloadPageFinishedListener(spyPageFinish)
    .setOnDownloadPageErrorListener(spyPageError)
    .setOnDonwloadChapterAbortedListener(spyChapterAbort)
    .setOnDonwloadChapterRestartedListener(spyChapterRestart)
    let d
    describe("Check handle on donwloads events", function() {
        


        before(async function() {
            d = await md.downloadChapter("one-piece", 900, __dirname, _DOWNLOAD.INIT.NO_AUTO_START)
            stubDownloadImage = sinon.stub(d,"_downloadImage").resolves()
            d.start()
            
        })

        it('started', async function() {
            expect(spyChapterStart.calledOnce)
        })
        it('Page started (21 times)', function() {
            expect(spyPageStart.firstCall).to.have.been.calledAfter(spyChapterStart.lastCall)
            expect(spyPageStart.callCount).eq(21)
        })
        it('Page Finished (21 times)', function() {
            expect(spyPageFinish.lastCall).to.have.been.calledAfter(spyPageStart.lastCall)
            expect(spyPageFinish.callCount).eq(21)
        })
        it('Chapter Finished', function() {
            expect(spyChapterFinish.firstCall).to.have.been.calledAfter(spyPageFinish.lastCall)
            expect(spyPageFinish.calledOnce)
        })
        it('21 image downloaded', function() {
            expect(stubDownloadImage.callCount).eq(21)
        })
        it('No error', function() {
            expect(!spyPageError.called)
            expect(!spyChapterError.called)
        })

        describe('check error event', function() {

            before(async function() {
                //d = d? d : await md.downloadChapter("one-piece", 900, __dirname, _DOWNLOAD.INIT.NO_AUTO_START)
                
                [spyChapterStart,spyChapterFinish,spyChapterError,spyPageStart,spyPageFinish,spyPageError, spyChapterAbort, spyChapterRestart].forEach((e) => {
                    e.resetHistory()
                })
                stubDownloadImage.reset()

                for(let i =0;i<17;i++) {
                    stubDownloadImage.onCall(i).resolves()
                }
                stubDownloadImage.onCall(17).rejects()
                
                d.start()
                await (function() {
                    return new Promise((resolve) => {
                        setTimeout(resolve, 1000)
                    })
                })()
                
            })

            it('Started', function() {
                expect(spyChapterStart.calledOnce)
            })

            it('Page started (18 times)', function() {
                expect(spyPageStart.callCount).eq(18)
            })
            it('Page finished (17 times)', function() {
                expect(spyPageStart.callCount).eq(18)
            })
            it('Page 18 error', function() {
                expect(spyPageError.calledOnce)
                expect(spyPageError.firstCall).to.have.been.calledAfter(spyPageStart.lastCall)
                expect(spyPageError.firstCall.args[0]).to.have.property('page', 18)
            })
            it('Chapter error', function() {
                expect(spyChapterError.calledOnce)
                expect(spyChapterError.firstCall).to.have.been.calledAfter(spyPageError.firstCall)
            })
            it('Not finished', function() {
                expect(spyChapterFinish.called)
            })
        })
    })
    describe("Action", function() {
        this.timeout(5000)
        this.slow(4500)
        before(function() {
            stubDownloadImage.reset()
            stubDownloadImage.resolves()
        })

        this.beforeEach(function() {
            [spyChapterStart,spyChapterFinish,spyChapterError,spyPageStart,spyPageFinish,spyPageError,spyChapterAbort, spyChapterRestart].forEach((e) => {
                e.resetHistory()
            })
        })

        it("start", async function() {
            expect(d.start()).eq(_DOWNLOAD.ACTION.DONE)
            expect(d.start()).eq(_DOWNLOAD.ACTION.NOT_DONE)
            await (function() {
                return new Promise((resolve) => {
                    setTimeout(resolve, 1300)
                })
            })()
        })
        it("abort", async function() {
            

            const abort = ({ page }) => {
                if(page == 10) {
                    d.abort()
                    d.removeListener('download-page-started', abort)
                }
            }

            d.setOnDownloadPageStartedListener(abort)
            expect(d.start()).eq(_DOWNLOAD.ACTION.DONE)

            await (function() {
                return new Promise((resolve) => {
                    setTimeout(resolve, 2000)
                })
            })()

            expect(spyChapterStart.calledOnce)
            expect(spyChapterAbort.calledOnce)

            expect(d.abort()).eq(_DOWNLOAD.ACTION.NOT_DONE)
            spyChapterAbort.resetHistory()

        })

        it("restart", async function() {


            const restart = ({ page }) => {
                if(page == 10) {
                    d.removeListener('download-page-started', restart)
                    d.restart()
                }
            }

            d.setOnDownloadPageStartedListener(restart)

            expect(d.start()).eq(_DOWNLOAD.ACTION.DONE)

            await (function() {
                return new Promise((resolve) => {
                    setTimeout(resolve, 2000)
                })
            })()
    
            expect(spyChapterRestart.calledOnce)
            expect(spyChapterStart.calledTwice)
            expect(spyChapterFinish.calledOnce)
            expect(spyPageFinish.callCount).greaterThan(21)

            expect(d.restart()).eq(_DOWNLOAD.ACTION.NOT_DONE)

            spyChapterRestart.resetHistory()
        })

        it("start with 5 maxRestart ", async function() {
            stubDownloadImage.reset()
            for(let i=0;i<5;i++) {
                stubDownloadImage.onCall(i).rejects()
            }
            stubDownloadImage.onCall(5).resolves()

            expect(d.start(5)).eq(_DOWNLOAD.ACTION.DONE)

            await (function() {
                return new Promise((resolve) => {
                    setTimeout(resolve, 3000)
                })
            })()

            expect(spyChapterStart.callCount).eq(6)
            expect(spyChapterRestart.callCount).eq(5)
            expect(spyChapterFinish.calledOnce)
        })
        
    })
    describe("DownloadImage test", function() {
        this.timeout(20000)
        this.slow(8000)
        before(function() {
        })
        it("download", async function() {
            const testFile = Path.join(__dirname,"image.jpg")

            if(fs.existsSync(testFile)) fs.unlinkSync(testFile)

            const writer = new fs.createWriteStream(testFile)

            sinon.replace(fs, "createWriteStream", () => writer)

            await donwloadImage(testFile, 'https://i.pinimg.com/originals/47/0a/19/470a19a36904fe200610cc1f41eb00d9.jpg',6)

            expect(fs.existsSync(testFile))
            
        })
    })

    
})


