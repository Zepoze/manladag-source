import AdmZip from 'adm-zip'
import { Manladag } from './manladag-namespace'

export default class MlagZip extends AdmZip {
    properties:Manladag.MlagManifestProperties
    constructor(filename:string) {
        super(filename)
        let tmp

        try {
            tmp = JSON.parse(this.readAsText('manifest.json'))
        } catch(e) {
            throw new Error(filename+' is not a mlag file')
        }

        const infos:Manladag.MlagManifestProperties = tmp

        if(infos["download-date"]||infos["manifest-version"]||infos["pages-number"]|| infos.chapter||infos.manga|| infos.site || infos.url) {

            switch(infos["manifest-version"]) {
                
            }

        } else {
            throw new Error(filename+' mlag file is corrupted')
        }

        this.properties = infos
    }
}