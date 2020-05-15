var expect = require('chai').expect;
var index = require('../dist/index.js').ManladagSource
var os = require('os')
var Path = require('path')
var fs = require('fs')
const m = {
    "one-piece":{
        name:"One Piece"
    }
}

const testInterface = {
    site: "picsum",
    url: "https://picsum.photos",
    mangas: m,
    async getNumberPageChapter(manga,chapter) {
        return Promise.resolve(Math.floor(Math.random() * Math.floor(12))+4)
    },
    async getUrlPages(manga,chapter){
        const tab = []
        const numberPage = await this.getNumberPageChapter(manga,chapter)
        for(let i =0;i<numberPage;i++) {
            tab.push(this.url+'/seed/'+"gbue"+i+'/200/300')
        }
        return Promise.resolve(tab)
    },
    async getLastChapter(manga){
        return Promise.resolve(500)
    },
    async chapterIsAvailable(manga,chapter) {
        return Promise.resolve(chapter>300&&chapter<=500)
    }
}

const ThrowInterface = {
    site: "picsum",
    url: "https://picsum.photos",
    mangas: m,
    async getNumberPageChapter(manga,chapter) {
        throw new Error('Test Error in getNumberPageChapter')
    },
    async getUrlPages(manga,chapter){
        throw new Error('Test Error in getUrlPages')
    },
    async getLastChapter(manga) {
        throw new Error('Test Error in getLastChapter')
    },
    async chapterIsAvailable(manga,chapter) {
        throw new Error('Test Error in chapterIsAvailable')
    }
}

const source = new index(testInterface)
const tmpDir = Path.join(os.tmpdir(),'manladag-source-testzedrftgyhuj')
if(!fs.existsSync(tmpDir))fs.mkdirSync(tmpDir)

source.addOnDownloadChapterFinishedListener(({path,chapter,}) => {
    console.log(`chapter n°${chapter} download in -> ${path}`)
})
describe('ManladagSource class download test', function () {
    this.timeout(30000)
    it("download test",async () => {
        
        try {
        const result = await source.downloadChapter("one-piece",500,tmpDir)

        expect(result).equal(undefined)
        }catch(e) {expect.fail("it should not throw error")}
    })
    it("download fail for manga isnt",async () => {
        try {
            const result = await source.downloadChapter("one-piec",500,tmpDir)
            expect.fail("it should throw error")
        }catch(e) {
            expect(e.message).to.include(`The manga_key 'one-piec' isn't exist`)
        }
    })
    it("download fail for chapter isnt",async () => {
        try {
            const result = await source.downloadChapter("one-piece",50,tmpDir)
            expect.fail("it should throw error")
        }catch(e) {
            expect(e.message).to.include(`The chapter 50 is not available on`)
        }
    })
})

msthrow = new index(ThrowInterface)

describe('ManladagSource fail methods test', function () {
    this.timeout(30000)
    it('getLastchapter', async function() {
        try {
            await msthrow.getLastChapter(Object.values(msthrow.mangas)[0])
            expect.fail('yeah')
        } catch(e) {
            expect(e).to.include({ name: 'ManladagLibError'})
        }
    })
    it('getNumberpagechapter', async function() {
        try {
            await msthrow.getNumberPageChapter(Object.values(msthrow.mangas)[0], 65)
            expect.fail('yeah')
        } catch(e) {
            expect(e).to.include({ name: 'ManladagLibError'}).and.have.property('message').include('Test Error in getNumberPageChapter')
        }
    })
    it('getUrlPages', async function() {
        try {
            await msthrow.getUrlPages(Object.values(msthrow.mangas)[0])
            expect.fail('yeah')
        } catch(e) {
            expect(e).to.have.include({ name: 'ManladagLibError'}).and.have.property('message').include('Test Error in getUrlPages')
        }
    })
    it('chapterIsavailable', async function() {
        try {
            await msthrow.chapterIsAvailable(Object.values(msthrow.mangas)[0], 65)
            expect.fail('yeah')
        } catch(e) {
            expect(e).to.have.include({ name: 'ManladagLibError'}).and.have.property('message').include('Test Error in chapterIsAvailable')
        }
    })

})
