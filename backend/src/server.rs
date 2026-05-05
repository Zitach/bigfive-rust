use crate::db::DbPool;
use axum::{
    routing::{get, post},
    Router,
};
use tower_http::{
    services::{ServeDir, ServeFile},
    trace::TraceLayer,
};

pub fn create_app(pool: DbPool) -> Router {
    let serve_dir = ServeDir::new("frontend/dist")
        .not_found_service(ServeFile::new("frontend/dist/index.html"));

    Router::new()
        .route("/health", get(crate::routes::health::health_handler))
        .route(
            "/api/languages",
            get(crate::routes::languages::languages_handler),
        )
        .route(
            "/api/questions/:lang",
            get(crate::routes::questions::questions_handler),
        )
        .route(
            "/api/tests",
            post(crate::routes::tests::create_test_handler),
        )
        .route(
            "/api/tests/:id",
            get(crate::routes::tests::get_test_handler),
        )
        .route(
            "/api/feedback",
            post(crate::routes::feedback::feedback_handler),
        )
        .nest_service("/", serve_dir)
        .layer(TraceLayer::new_for_http())
        .with_state(pool)
}
