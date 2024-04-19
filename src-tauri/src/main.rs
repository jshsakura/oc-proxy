// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  tauri::Builder::default()
  .invoke_handler(tauri::generate_handler![greet, select_directory]) /* 필요한 커스텀 커맨드 추가 */
  .run(tauri::generate_context!())
  .expect("error while running tauri application");
}

// 커맨드 실행 예제
#[tauri::command]
fn greet(name: &str) -> String {
   format!("Hello, {}!", name)
}

#[tauri::command]
fn select_directory(window: tauri::Window) -> Result<String, String> {
    tauri::api::dialog::blocking::FileDialogBuilder::new()
        .pick_folder()
        .map(|path| path.to_string_lossy().to_string())
        .ok_or_else(|| "No directory selected".to_string())
}