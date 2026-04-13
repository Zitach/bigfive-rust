use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};
use std::env;

pub type DbPool = SqlitePool;

pub async fn init_db() -> Result<DbPool, sqlx::Error> {
    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite:data.sqlite".to_string());
    let pool = SqlitePoolOptions::new()
        .connect(&database_url)
        .await?;
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await?;
    Ok(pool)
}
