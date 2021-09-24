#![cfg_attr(not(debug_assertions),windows_subsystem = "windows")]
use std::process::Command;
use std::os::windows::process::CommandExt;
use std::path::Path;
use notify_rust::Notification;

fn main() {
    if !Path::new("core.exe").is_file() {
        // core not found
        Notification::new()
            .summary("找不到 core.exe")
            .body("相同目錄缺少檔案\"core.exe\"")
            .show().unwrap();
        panic!("core.exe not found");
    }
    

    
    let config = "config.json";
    if !Path::new(&config).is_file() {
        println!("create {}", &config);
        std::fs::write(config, "{}").unwrap();
    };

    let tmp = "tmp";
    if !Path::new(&tmp).is_dir() {
        println!("create {}", &tmp);
        std::fs::create_dir(tmp).unwrap();
    };

    if cfg!(target_os = "windows") {
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        let mut open_core = Command::new("core.exe");
        let log = open_core.arg("run").creation_flags(CREATE_NO_WINDOW).output().expect("can't open core");
        println!("{}", String::from_utf8_lossy(&log.stdout));
    }
}