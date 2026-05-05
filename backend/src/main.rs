use backend::{db::init_db, server::create_app};
use std::env;

#[tokio::main]
async fn main() {
    let db_path = env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite:data.sqlite".to_string());
    let pool = init_db(&db_path).await.expect("Failed to initialize database");
    let app = create_app(pool);

    let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let addr = format!("{host}:{port}");
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
