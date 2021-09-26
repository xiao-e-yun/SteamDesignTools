import config from "../config"
export interface DataType
<Iconfig extends keyof config = keyof config>{
    build:{
        req : {
            option:DataType["build"]["option"],
            imgs:{
                name: string, // 圖片名稱
                data: string, // 圖片base64 或 路徑
            }[]
        },
        option:{
            base64:boolean, // data使用base64
            main:number, // 類型
            size:number, // 個人檔案大小 (width/px)
            auto_cut:boolean, // 自動切割
            right_more_img_clip:boolean, // 裁切右邊更多圖片
            background:{
                buffer?:Buffer, //如果有 buffer 讀取
                url:string, //取得圖片 
            },
        },
        resolve:boolean,
    },
    compression:{
        req : {
            option:DataType["compression"]["option"],
            imgs:{
                name: string, // 圖片名稱
                data: string, // 圖片base64 或 路徑
            }[]
        },
        option:{
            base64:boolean, // data使用base64
            quality:[number,number],
            speed:number
        },
        resolve:boolean,
    },
    //
    get_file:{
        req : undefined,
        resolve:string[],
    }
    config:{
        req:undefined,
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
        },
        resolve:void
    }
}

export interface WorkerDataType
{
    build:{
        option:DataType["build"]["option"],
        data:{
            name: string;
            data: string;
        }[]
    }
    compression:{
        option:DataType["compression"]["option"],
        data:{
            name: string;
            data: string;
        }[]
    }
}