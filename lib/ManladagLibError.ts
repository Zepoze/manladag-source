import { Manladag } from "./manladag-namespace"

export class ManladagLibError extends Error {
    name:string = 'ManladagLibError'
    site:string
    url:string
    stack:string | undefined
    constructor(source:Manladag.source, error:Error) {
        super(`Error in the lib ${source.site}, Please try to contact his author \n${error.message}\nOr check your internet connection`)
        this.site = source.site
        this.url = source.url

        if(Error.captureStackTrace) {
            Error.captureStackTrace(this, ManladagLibError);
        }
    }
}