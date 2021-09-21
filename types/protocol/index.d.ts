export default interface DataType {
    build:{
        req : {
            option:DataType["build"]["option"],
            imgs:{
                name: string,
                data: string,
            }[]
        },
        worker : {
            option:DataType["build"]["option"],
            data:{
                name: string;
                base64img: string;
            }[]
        },
        option:{
            main:number, // 類型
            size:number, // 個人檔案大小 (width/px)
            auto_cut:boolean, // 自動切割
            background:{
                buffer?:Buffer, //如果有 buffer 讀取
                url:string, //取得圖片 
            },
        },
    },
}