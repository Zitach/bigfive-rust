#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use backend::db::DbPool;
use backend::models::{
    CreateTestResponse, FeedbackPayload, ReportResponse, TestPayload,
};
use backend::results::generate_report;
use sqlx::{query, Row};
use tauri::Manager;
use uuid::Uuid;

struct AppState {
    db: DbPool,
}

#[tauri::command]
fn get_languages() -> Vec<backend::models::Language> {
    backend::data::list_languages()
}

#[tauri::command]
fn get_questions(lang: String) -> Result<Vec<backend::data::Question>, String> {
    backend::data::get_questions(&lang).map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_test(
    payload: TestPayload,
    state: tauri::State<'_, AppState>,
) -> Result<CreateTestResponse, String> {
    let id = Uuid::new_v4().to_string();
    let answers_json =
        serde_json::to_string(&payload.answers).map_err(|e| e.to_string())?;
    query(
        "INSERT INTO tests (id, test_id, lang, invalid, time_elapsed, date_stamp, answers) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&payload.test_id)
    .bind(&payload.lang)
    .bind(payload.invalid as i32)
    .bind(payload.time_elapsed)
    .bind(payload.date_stamp.to_rfc3339())
    .bind(&answers_json)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(CreateTestResponse { id })
}

#[tauri::command]
async fn get_test(
    id: String,
    lang: Option<String>,
    state: tauri::State<'_, AppState>,
) -> Result<ReportResponse, String> {
    let row = query("SELECT lang, date_stamp, answers FROM tests WHERE id = ?")
        .bind(&id)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Test not found".to_string())?;

    let db_lang: String = row.try_get("lang").map_err(|e| e.to_string())?;
    let date_stamp: String = row.try_get("date_stamp").map_err(|e| e.to_string())?;
    let answers_json: String = row.try_get("answers").map_err(|e| e.to_string())?;

    let answers: Vec<backend::models::Answer> =
        serde_json::from_str(&answers_json).map_err(|e| e.to_string())?;

    let selected_lang = lang.unwrap_or(db_lang);
    let mut report =
        generate_report(&answers, &selected_lang).map_err(|e| e.to_string())?;

    report.id = id;
    report.timestamp = chrono::DateTime::parse_from_rfc3339(&date_stamp)
        .map(|dt| dt.timestamp_millis())
        .unwrap_or(0);
    report.language = selected_lang;

    Ok(report)
}

#[tauri::command]
async fn submit_feedback(
    payload: FeedbackPayload,
    state: tauri::State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    query(
        "INSERT INTO feedback (name, email, message, created_at) VALUES (?, ?, ?, datetime('now'))",
    )
    .bind(&payload.name)
    .bind(&payload.email)
    .bind(&payload.message)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(serde_json::json!({"message": "Sent successfully!"}))
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app_data_dir");
            std::fs::create_dir_all(&app_data_dir).expect("failed to create app_data_dir");
            let db_path = app_data_dir.join("data.sqlite");

            let pool = tauri::async_runtime::block_on(
                backend::db::init_db(&db_path.to_string_lossy()),
            )
            .expect("failed to initialize database");

            app.manage(AppState { db: pool });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_languages,
            get_questions,
            create_test,
            get_test,
            submit_feedback,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
