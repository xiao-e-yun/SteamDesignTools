#![cfg_attr(not(debug_assertions),windows_subsystem = "windows")]
use std::{env, process::Command};
use std::os::windows::process::CommandExt;
use serde::{Deserialize, Serialize};
use notify_rust::Notification;
use cluFlock::ExclusiveFlock;
use std::path::Path;
use nfd2::Response;
use serde_json;

#[derive(Serialize, Deserialize)]
struct Config {
    clear_tmp: Option<bool>,
    clear_output: Option<bool>,
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() == 2 {        
        let mode: &String = &args[1];
        if mode == "choose_image" {
            let filter: Option<&str> = Some("png,jpg");
            let result = nfd2::open_file_multiple_dialog(filter,None).unwrap();
            match result {
                Response::OkayMultiple(files) => print!("{:?}", files),
                _ => print!("[]")
            }
        }
        return;
    }



    // //是否缺少檔案
    if !Path::new("core.exe").is_file() {
        // core not found
        Notification::new()
        .summary("找不到 core.exe")
        .body("相同目錄缺少檔案\"core.exe\"")
        .show().unwrap();
        panic!("core.exe not found");
    }
    
    // //是否缺少檔案，缺少的話創建新的
    let config = "config.json";
    let config_path = Path::new(&config);
    if !config_path.is_file() {
        println!("create {}", &config);
        std::fs::write(config, "{}").unwrap();
    };
    
    // //是否缺少檔案，缺少的話創建新的
    let tmp = "tmp";
    let tmp_path = Path::new(&tmp);
    if !tmp_path.is_dir() {
        println!("create {}", &tmp);
        std::fs::create_dir(tmp).unwrap();
    };

    //運行軟體
    if cfg!(target_os = "windows") {
        let file_lock = std::fs::File::create(".LOCK").unwrap().try_lock();
        match file_lock {
            Ok(_) => print!("locked"),
            Err(_) => panic!("is locked"),
        }
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        let mut open_core = Command::new("core.exe");
        open_core.args(["run",&args[0]]).creation_flags(CREATE_NO_WINDOW).output().expect("can't open core");
        drop(file_lock)
    }

    //如果設定有，刪除暫存檔
    let config_json = std::fs::read_to_string(config_path).expect("can't read config");
    let config:Config = serde_json::from_str(&config_json[..]).expect("can't parse config");
    
    if config.clear_tmp == Some(true) && tmp_path.is_dir(){
        std::fs::remove_dir_all(tmp_path).unwrap();
    }
    
    //如果設定有，刪除輸出檔
    let output_path = Path::new("output");
    if config.clear_output == Some(true) && output_path.is_dir(){
        std::fs::remove_dir_all(output_path).unwrap();
    }
}