// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rusqlite::{Connection, Result};
use tauri::command;
use cf_reqwest::{Client, header::{HeaderMap, HeaderValue, REFERER, USER_AGENT}};
use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio;

#[tokio::main]
async fn main() {
    if let Err(e) = initialize_db("./database.db").await {
        eprintln!("Failed to initialize database: {}", e);
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, select_directory, execute_query, ouo_bypass])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[command]
fn greet(name: &str) -> String {
   format!("Hello, {}!", name)
}

#[command]
async fn select_directory() -> Result<String, String> {
    tauri::api::dialog::blocking::FileDialogBuilder::new()
        .pick_folder()
        .map(|path| path.to_string_lossy().to_string())
        .ok_or_else(|| "No directory selected".to_string())
}

async fn initialize_db(db_path: &str) -> Result<()> {
    let conn = Connection::open(db_path)?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS TB_DOWNLOAD_LIST
        (
            FILE_ID                   INTEGER PRIMARY KEY AUTOINCREMENT,
            FILE_NAME                 TEXT,
            FILE_ORIGIN_DOWNLOAD_URL  TEXT NOT NULL,
            FILE_DOWNLOAD_URL         TEXT,
            FILE_PASSWORD             TEXT,
            FILE_STATUS               TEXT,
            FILE_SIZE                 INTEGER DEFAULT 0,
            NOW_PROGRESS              INTEGER,
            NOW_PROXY                 TEXT,
            CREATED_AT                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            COMPLETED_AT              TIMESTAMP DEFAULT NULL
        )", [])?;

    Ok(())
}

#[command]
async fn execute_query(db_path: String, query: String) -> Result<Vec<String>, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
    let rows = stmt.query_map([], |row| {
        row.get(0)
    }).map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for value in rows {
        results.push(value.map_err(|e| e.to_string())?);
    }
    Ok(results)
}

#[derive(Serialize, Deserialize)]
struct BypassOutput {
    original_link: String,
    bypassed_link: Option<String>,
}

#[command]
async fn ouo_bypass(url: String) -> Result<BypassOutput, String> {
    let temp_url = url.replace("ouo.press", "ouo.io");
    let _id = temp_url.split('/').last().ok_or("Invalid URL")?;

    let mut headers = HeaderMap::new();

    let res = cf_reqwest::blocking::get(&temp_url)
        .send()
        .await
        .map_err(|e| format!("Error sending initial request: {}", e))?;

    println!("Initial response status: {}", res.status());
    println!("Response headers: {:?}", res.headers());

    if let Some(location) = res.headers().get("Location") {
        let location_str = location.to_str().map_err(|e| e.to_string())?;
        return Ok(BypassOutput {
            original_link: url,
            bypassed_link: Some(location_str.to_string()),
        });
    }

    let text = res.text().await.map_err(|e| format!("Failed to read response text: {}", e))?;
    println!("Response body: {}", text);

    let html = Html::parse_document(&text);
    let form_selector = Selector::parse("form").unwrap();
    let input_selector = Selector::parse("input[name]").unwrap();

    let form = html.select(&form_selector).next().ok_or("Form not found")?;
    let mut data = HashMap::new();
    for input in form.select(&input_selector) {
        let name = input.value().attr("name").ok_or("Missing input name")?.to_string();
        let value = input.value().attr("value").unwrap_or_default().to_string();
        data.insert(name, value);
    }

    Err("No redirection found. Unable to fetch the bypassed link.".to_string())
}
