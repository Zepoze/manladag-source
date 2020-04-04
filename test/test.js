var expect = require('chai').expect;
var index = require('../dist/index.js').ManladagSource

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
    async getUrlPages(manga,chapter,numberPage){
        const tab = []
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

const source = new index(testInterface)
describe('ManladagSource class test', () => {
    it("download test",async () => {
        try {
        const result = await source.downloadChapter("one-piece",500,__dirname)

        expect(result).equal(undefined)
        }catch(e) {expect.fail("it should not throw error")}
    })
    it("download fail for manga isnt",async () => {
        try {
            const result = await source.downloadChapter("one-piec",500,__dirname)
            expect.fail("it should throw error")
        }catch(e) {
            expect(e.message).to.include(`The manga_key 'one-piec' isn't exist`)
        }
    })
    it("download fail for chapter isnt",async () => {
        try {
            const result = await source.downloadChapter("one-piece",50,__dirname)
            expect.fail("it should throw error")
        }catch(e) {
            expect(e.message).to.include(`The chapter 50 is not available on`)
        }
    })
})
