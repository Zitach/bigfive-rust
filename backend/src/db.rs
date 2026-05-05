use sqlx::{sqlite::{SqlitePoolOptions, SqliteConnectOptions}, SqlitePool};
use std::str::FromStr;

pub type DbPool = SqlitePool;

pub async fn init_db(db_path: &str) -> Result<DbPool, sqlx::Error> {
    let options = SqliteConnectOptions::from_str(&format!("sqlite:{}", db_path))?
        .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal)
        .create_if_missing(true);
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(options)
        .await?;
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await?;
    Ok(pool)
}
