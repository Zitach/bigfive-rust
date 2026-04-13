use crate::{db::DbPool, models::FeedbackPayload};
use axum::{extract::State, http::StatusCode, Json};
use serde_json::json;
use sqlx::query;

pub async fn feedback_handler(
    State(pool): State<DbPool>,
    Json(payload): Json<FeedbackPayload>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    query("INSERT INTO feedback (name, email, message, created_at) VALUES (?, ?, ?, datetime('now'))")
        .bind(&payload.name)
        .bind(&payload.email)
        .bind(&payload.message)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(json!({"message": "Sent successfully!"})))
}
