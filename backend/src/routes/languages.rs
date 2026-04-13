use crate::data::list_languages;
use axum::Json;

pub async fn languages_handler() -> Json<Vec<crate::models::Language>> {
    Json(list_languages())
}
