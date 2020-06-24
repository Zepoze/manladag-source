/// <reference path="./types/source.ts"/>
import axios from 'axios'
import fs from 'fs'


export function downloadImage(path:string, url:string,page:number) {
    const TheError:Error = new Error('Impossible to download the page '+(page)+' Please check your Internet Connection')
    return new Promise(async (resolve, reject) => {
        const writer = fs.createWriteStream(path)
        writer.on('error', reject)
        let d:number = Date.now()
        let count = 0
        try {
            const { data } = await axios({
                url,
                method: 'GET',
                responseType: 'stream',
            })
            
            data.on('data',()=> d = Date.now())
            const stI = setInterval(() => {
                if(Date.now() - d <= 1500) count = 0
                else count++
                if(count >2) {
                    clearInterval(stI)
                    writer.destroy(TheError)
                }
                
            },1500)
            writer.on('finish', function() {
                resolve()
            })
            data.pipe(writer)

            

        }catch(e) {
            reject(e)
        }

        
    })
}
