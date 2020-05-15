export declare interface manga {
    name: string
}

export declare interface source {
    site: string,
    url: string,
    mangas: { [name:string]: manga },
    getNumberPageChapter(manga:manga,chapter:number):Promise<number>,
    getUrlPages(manga:manga,chapter:number):Promise<string[]>,
    getLastChapter(manga:manga):Promise<number>,
    chapterIsAvailable(manga:manga,chapter:number) : Promise<boolean>
}