use crate::data::get_questions;
use axum::{extract::Path, Json};

pub async fn questions_handler(
    Path(lang): Path<String>,
) -> Result<Json<Vec<crate::data::Question>>, axum::http::StatusCode> {
    match get_questions(&lang) {
        Ok(qs) => Ok(Json(qs)),
        Err(_) => Err(axum::http::StatusCode::NOT_FOUND),
    }
}
