use crate::{
    db::DbPool,
    models::{CreateTestResponse, TestPayload},
    results::generate_report,
};
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use serde::Deserialize;
use sqlx::{query, Row};
use uuid::Uuid;

#[derive(Deserialize)]
pub struct ReportQuery {
    lang: Option<String>,
}

pub async fn create_test_handler(
    State(pool): State<DbPool>,
    Json(payload): Json<TestPayload>,
) -> Result<Json<CreateTestResponse>, StatusCode> {
    let id = Uuid::new_v4().to_string();
    let answers_json = serde_json::to_string(&payload.answers).map_err(|_| StatusCode::BAD_REQUEST)?;
    query(
        "INSERT INTO tests (id, test_id, lang, invalid, time_elapsed, date_stamp, answers) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&payload.test_id)
    .bind(&payload.lang)
    .bind(payload.invalid as i32)
    .bind(payload.time_elapsed)
    .bind(payload.date_stamp.to_rfc3339())
    .bind(&answers_json)
    .execute(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(CreateTestResponse { id }))
}

pub async fn get_test_handler(
    State(pool): State<DbPool>,
    Path(id): Path<String>,
    Query(params): Query<ReportQuery>,
) -> Result<Json<crate::models::ReportResponse>, StatusCode> {
    let row = query("SELECT lang, date_stamp, answers FROM tests WHERE id = ?")
        .bind(&id)
        .fetch_optional(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let lang: String = row.try_get("lang").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let date_stamp: String = row.try_get("date_stamp").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let answers_json: String = row.try_get("answers").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let answers: Vec<crate::models::Answer> =
        serde_json::from_str(&answers_json).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let selected_lang = params.lang.unwrap_or(lang);
    let mut report = generate_report(&answers, &selected_lang)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    report.id = id;
    report.timestamp = chrono::DateTime::parse_from_rfc3339(&date_stamp)
        .map(|dt| dt.timestamp_millis())
        .unwrap_or(0);
    report.language = selected_lang;

    Ok(Json(report))
}
