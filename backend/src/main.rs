use backend::{db::init_db, server::create_app};
use std::env;
use tracing_subscriber::{fmt, EnvFilter};

#[tokio::main]
async fn main() {
    // Enable logs (required for TraceLayer to actually emit anything).
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info,tower_http=info"));
    fmt().with_env_filter(filter).init();

    let pool = match init_db().await {
        Ok(p) => p,
        Err(e) => {
            tracing::error!(error = %e, "Failed to initialize database");
            std::process::exit(1);
        }
    };
    let app = create_app(pool);

    let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let addr = format!("{host}:{port}");
    let listener = match tokio::net::TcpListener::bind(&addr).await {
        Ok(l) => l,
        Err(e) => {
            tracing::error!(error = %e, addr = %addr, "Failed to bind listener");
            std::process::exit(1);
        }
    };
    tracing::info!(addr = %addr, "Backend listening");
    if let Err(e) = axum::serve(listener, app).await {
        tracing::error!(error = %e, "Server error");
        std::process::exit(1);
    }
}
