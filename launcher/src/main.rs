#![windows_subsystem = "windows"]
use std::process::Command;
fn main() {
    println!("Hello, world!");
    if cfg!(target_os = "windows") {
            Command::new("cmd")
                .args(["/C", "./core"])
                .output()
                .expect("failed to execute process");
    }
}
