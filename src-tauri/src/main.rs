// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rusqlite::{Connection, Result};
use tauri::command;
use reqwest::{Client};
use reqwest::header::{HeaderMap, HeaderValue, REFERER, USER_AGENT,CACHE_CONTROL, ACCEPT, ACCEPT_ENCODING, ACCEPT_LANGUAGE, CONNECTION};
use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use tokio;
use std::collections::HashMap;
use std::path::Path;
use std::process::Command;
use std::str;

#[tokio::main]
async fn main() {
    if let Err(e) = initialize_db("./database.db").await {
        eprintln!("Failed to initialize database: {}", e);
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, select_directory, execute_query, ouo_bypass, ouo_bypass_exe])
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
    let client = Client::builder()
        .cookie_store(true)
        .build()
        .map_err(|e| format!("Error creating client: {}", e))?;

    println!("Requesting URL: {}", url.replace("ouo.press", "ouo.io"));
    let temp_url = url.replace("ouo.press", "ouo.io");

    let mut headers = HeaderMap::new();
    headers.insert(REFERER, HeaderValue::from_static("http://www.google.com/ig/adde?moduleurl="));
    headers.insert(USER_AGENT, HeaderValue::from_static("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36"));
    headers.insert(ACCEPT, HeaderValue::from_static("text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"));
    headers.insert(ACCEPT_LANGUAGE, HeaderValue::from_static("en-US,en;q=0.5"));
    headers.insert(ACCEPT_ENCODING, HeaderValue::from_static("gzip, deflate, br"));
    headers.insert(CONNECTION, HeaderValue::from_static("keep-alive"));
    headers.insert("Upgrade-Insecure-Requests", HeaderValue::from_static("1"));
    headers.insert(CACHE_CONTROL, HeaderValue::from_static("max-age=0"));

    let res = client.get(&temp_url)
        .headers(headers.clone())
        .send()
        .await
        .map_err(|e| format!("Error sending initial request: {}", e))?;

    println!("Initial response status: {}", res.status());
    if res.status() != reqwest::StatusCode::OK {
        return Err(format!("Unexpected response status: {}", res.status()));
    }
    
    let res_headers = res.headers().clone();
    let text = res.text().await.map_err(|e| format!("Failed to read response text: {}", e))?;
    println!("Parsing HTML to extract form data.");
    let (action_url, mut form_data) = extract_form_data(&text)?;

    // 사용자 입력 URL을 폼 데이터에 추가
    form_data.insert("url".to_string(), url.clone());

    println!("Submitting form data to {}", action_url);
    println!("Data being submitted: {:?}", form_data);

    let final_url = submit_form_data(&client, &action_url, &form_data, &res_headers)
        .await
        .map_err(|e| format!("Error submitting form: {}", e))?;

    println!("Redirection URL: {}", final_url);
    Ok(BypassOutput {
        original_link: url,
        bypassed_link: Some(final_url),
    })
}


// HTML parsing and form data extraction function
fn extract_form_data(html: &str) -> Result<(String, HashMap<String, String>), String> {
    let document = Html::parse_document(html);
    let form_selector = Selector::parse("form").unwrap();
    let form = document.select(&form_selector).next().ok_or("Form not found")?;

    let action = form.value().attr("action").ok_or("Action URL not found")?.to_string();
    let mut data = HashMap::new();
    let input_selector = Selector::parse("input[name]").unwrap();
    for input in form.select(&input_selector) {
        let name = input.value().attr("name").ok_or("Missing input name")?.to_string();
        let value = input.value().attr("value").unwrap_or_default().to_string();
        data.insert(name.clone(), value.clone());
        println!("Extracted input: {} = {}", name, value);
    }
    Ok((action, data))
}

// Function to submit form data and log the server response
async fn submit_form_data(client: &Client, action_url: &str, data: &HashMap<String, String>, headers: &HeaderMap) -> Result<String, String> {
    println!("Submitting to URL: {}", action_url);
    println!("Data being submitted: {:?}", data);
    let response = client.post(action_url)
        .headers(headers.clone())
        .form(data)
        .send()
        .await
        .map_err(|e| format!("Error submitting form: {}", e))?;
    // 헤더를 먼저 복사하여 저장합니다.
    let headers = response.headers().clone();

    // Log the status and the headers of the response to diagnose issues.
    println!("Response status: {}", response.status());
    println!("Response headers: {:?}", response.headers());

    let body = response.text().await.unwrap_or_default();
    println!("Response body: {}", body);

    // Parse the response body to JSON and log it if it's JSON
    let json: serde_json::Result<serde_json::Value> = serde_json::from_str(&body);
    if let Ok(parsed_json) = json {
        println!("Parsed JSON response: {}", parsed_json);
    }

    match headers.get("Location") {
        Some(location) => location.to_str()
            .map(|s| s.to_string())
            .map_err(|e| format!("Error converting location header to string: {}", e)),
        None => Err("Location header not found".to_string()),
    }
}

#[tauri::command]
async fn ouo_bypass_exe(url: String) -> Result<String, String> {
    let path = Path::new("src/python/dist/ouo-bypass.exe");
    if !path.exists() {
        return Err("Executable path does not exist.".into());
    }

    let output = Command::new(path)
        .arg(&url)
        .output();

    match output {
        Ok(output) => {
            if output.status.success() {
                let result = str::from_utf8(&output.stdout).unwrap_or_default().to_string();
                Ok(result)
            } else {
                let error_message = str::from_utf8(&output.stderr).unwrap_or_default().to_string();
                Err(format!("Failed to execute the Python application: {}", error_message))
            }
        },
        Err(e) => Err(format!("Error executing Python application: {}", e))
    }
}