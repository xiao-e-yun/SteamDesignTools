import { Protocol } from "puppeteer-core"
import config from "./config"
import { FilterKeysToObject } from "./utils"

export default interface DataType
<Iconfig extends keyof config = keyof config>{
    build:{
        req : {
            option:DataType["build"]["option"]
            imgs:{
                name: string // 圖片名稱
                data: string // 圖片base64 或 路徑
            }[]
        }
        option:{
            base64:boolean // data使用base64
            main:number // 類型
            size:number // 個人檔案大小 (width/px)
            auto_cut:boolean // 自動切割
            right_more_img_clip:boolean // 裁切右邊更多圖片
            background:{
                buffer?:Buffer //如果有 buffer 讀取
                url:string //取得圖片 
            }
        }
        worker:{
            option:DataType["build"]["option"]
            data:{
                name: string;
                data: string;
            }[]
        }
        resolve:boolean
    }
    
    compression:{
        req : {
            option:DataType["compression"]["option"]
            imgs:{
                name: string // 圖片名稱
                data: string // 圖片base64 或 路徑
            }[]
        }
        option:{
            base64:boolean // data使用base64
            quality:[number,number]
            speed:number
        }
        worker:{
            option:DataType["compression"]["option"]
            data:{
                name: string;
                data: string;
            }[]
        }
        resolve:boolean
    }
    //
    
    login_steam:{
        req : {
            username:string
            password:string
        }
        resolve : {
            success : boolean
            guard : {need:boolean,get?:string}
            error ?: string
        } 
    }
    login_guard:{
        req : string //guard
        resolve : {
            success : boolean
            error ?: string
        }
    }

    upload_artwork:{
        req : {
            username:string
            files:{
                name:string
                data:string
            }[] //base64 or path
            option:DataType["upload_artwork"]["option"]
        }
        resolve:{
            success : boolean
            error ?: string
        }
        option:{
            base64:boolean // data使用base64
            type:"artwork"|"screenshot"|"workshop"
        }
        worker:{
            option:{ port: number } & DataType["upload_artwork"]["option"]
            data:{
                name: string;
                data: string;
            }[]
        }
    }

    //
    get_file:{
        req : undefined
        resolve:string[]
    }
    config:{
        req:undefined
        resolve:config
    }
    upload_config:{
        req:
        {
            key:Iconfig
            val:config[Iconfig]
        }[]
        resolve:void
    }
    logger:{
        req:{
            title: string;
            content: string;
        }
        resolve:void
    }
}

export type WorkerDataType = FilterKeysToObject<DataType,{worker:{option:any,data:any[]}}>