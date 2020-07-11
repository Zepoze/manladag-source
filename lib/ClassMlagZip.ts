import AdmZip from 'adm-zip'

export default class MlagZip extends AdmZip {
    properties:MlagManifestProperties
    constructor(filename:string) {
        super(filename)
        let tmp

        try {
            tmp = JSON.parse(this.readAsText('manifest.json'))
        } catch(e) {
            throw new Error(filename+' is not a mlag file')
        }

        const infos:MlagManifestProperties = tmp

        if(infos["download-date"]||infos["manifest-version"]||infos["pages-number"]|| infos.chapter||infos.manga|| infos.site || infos.url) {

            switch(infos["manifest-version"]) {
                
            }

        } else {
            throw new Error(filename+' mlag file is corrupted')
        }

        this.properties = infos
    }
}