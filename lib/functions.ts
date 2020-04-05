import axios from 'axios'
import fs from 'fs'
export default async function downloadImage(path:string, url:string,page:number) {
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
            writer.destroy(new Error('Impossible to download the page '+(page+1)+' Please check your Internet Connection'))
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
