use axum::body::Body;
use axum::http::{Request, StatusCode};
use backend::db::DbPool;
use backend::server::create_app;
use serde_json::json;
use sqlx::sqlite::SqlitePoolOptions;
use tower::ServiceExt;

async fn setup_pool() -> DbPool {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .unwrap();
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .unwrap();
    pool
}

#[tokio::test]
async fn health_check() {
    let pool = setup_pool().await;
    let app = create_app(pool);

    let response = app
        .oneshot(Request::builder().uri("/health").body(Body::empty()).unwrap())
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body_bytes = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let body: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    assert_eq!(body, json!({"status": "ok"}));
}

#[tokio::test]
async fn list_languages() {
    let pool = setup_pool().await;
    let app = create_app(pool);

    let response = app
        .oneshot(Request::builder().uri("/api/languages").body(Body::empty()).unwrap())
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body_bytes = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let body: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    assert!(body.is_array());
    let langs = body.as_array().unwrap();
    assert!(!langs.is_empty());
    let has_en = langs.iter().any(|l| l.get("id") == Some(&json!("en")));
    assert!(has_en);
}

#[tokio::test]
async fn get_questions_en() {
    let pool = setup_pool().await;
    let app = create_app(pool);

    let response = app
        .oneshot(Request::builder().uri("/api/questions/en").body(Body::empty()).unwrap())
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body_bytes = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let body: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    assert!(body.is_array());
    let questions = body.as_array().unwrap();
    assert!(!questions.is_empty());
}

#[tokio::test]
async fn create_and_get_test_roundtrip() {
    let pool = setup_pool().await;
    let app = create_app(pool);

    let payload = json!({
        "test_id": "b5-120",
        "lang": "en",
        "invalid": false,
        "time_elapsed": 120,
        "date_stamp": "2024-01-01T00:00:00Z",
        "answers": [
            {"id":"q1","score":3,"domain":"O","facet":1},
            {"id":"q2","score":4,"domain":"C","facet":1}
        ]
    });

    let create_response = app.clone().oneshot(
        Request::builder()
            .uri("/api/tests")
            .method("POST")
            .header("content-type", "application/json")
            .body(Body::from(payload.to_string()))
            .unwrap()
    ).await.unwrap();

    assert_eq!(create_response.status(), StatusCode::OK);
    let body_bytes = axum::body::to_bytes(create_response.into_body(), usize::MAX).await.unwrap();
    let create_body: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    let id = create_body["id"].as_str().unwrap();

    let get_response = app.oneshot(
        Request::builder()
            .uri(format!("/api/tests/{}", id))
            .body(Body::empty())
            .unwrap()
    ).await.unwrap();

    assert_eq!(get_response.status(), StatusCode::OK);

    let get_body_bytes = axum::body::to_bytes(get_response.into_body(), usize::MAX).await.unwrap();
    let get_body: serde_json::Value = serde_json::from_slice(&get_body_bytes).unwrap();
    assert_eq!(get_body["id"], json!(id));
    assert!(get_body["results"].is_array());
}
