import axios from 'axios'
import fs from 'fs'
import { source } from './types/source'

export class ManladagLibError extends Error {
    name:string = 'ManladagLibError'
    site:string
    url:string
    stack:string | undefined
    constructor(source:source, error:Error) {
        super(`Error in the lib ${source.site}, Please try to contact his author \n${error.message}`)
        this.site = source.site
        this.url = source.url

        if(Error.captureStackTrace) {
            Error.captureStackTrace(this, ManladagLibError);
        }
    }
}

export async function downloadImage(path:string, url:string,page:number) {
    return new Promise(async (resolve, reject) => {
        const writer = fs.createWriteStream(path)
        
        
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        })
       
    
        response.data.pipe(writer)
        const t = 
        setTimeout(()=> {
            writer.destroy(new Error('Impossible to download the page '+(page)+' Please check your Internet Connection'))
        },30000)
        writer.on('finish', () => {
            try {
            clearTimeout(t)
        } finally {
            resolve()	
        }
        })
        writer.on('error', reject)
      })
}
