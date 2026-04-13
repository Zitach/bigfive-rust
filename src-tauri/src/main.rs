#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{collections::HashMap, net::TcpListener, sync::Mutex, time::Duration};
use tauri::Manager;
use tauri::api::process::{Command, CommandEvent};
use serde_json::json;

struct AppState {
  api_base: Mutex<String>,
}

#[tauri::command]
fn api_base(state: tauri::State<'_, AppState>) -> String {
  state.api_base.lock().unwrap().clone()
}

fn pick_free_port() -> u16 {
  let listener = TcpListener::bind(("127.0.0.1", 0)).expect("bind ephemeral port");
  listener.local_addr().unwrap().port()
}

fn main() {
  tauri::Builder::default()
    .manage(AppState {
      api_base: Mutex::new(String::new()),
    })
    .invoke_handler(tauri::generate_handler![api_base])
    .on_page_load(|window, _| {
      let app_handle = window.app_handle();
      let state = app_handle.state::<AppState>();
      let base = {
        let guard = state.api_base.lock().unwrap();
        guard.clone()
      };
      if !base.is_empty() {
        let _ = window.eval(&format!(
          "window.__B5_API_BASE__ = {};",
          json!(base).to_string()
        ));
      }
    })
    .setup(|app| {
      let port = pick_free_port();
      let api_base = format!("http://127.0.0.1:{port}");

      // Store API base for the frontend to query via invoke().
      {
        let state = app.state::<AppState>();
        *state.api_base.lock().unwrap() = api_base.clone();
      }

      // Put sqlite DB in app data dir (portable-friendly, avoids CWD surprises).
      let app_data_dir = app
        .path_resolver()
        .app_data_dir()
        .ok_or_else(|| tauri::Error::AssetNotFound("app_data_dir unavailable".into()))?;
      std::fs::create_dir_all(&app_data_dir)?;
      let db_path = app_data_dir.join("data.sqlite");
      // SQLx sqlite connections on Windows are much more reliable when opened in
      // read-write-create mode explicitly.
      let database_url = format!(
        "sqlite:{}?mode=rwc",
        db_path.to_string_lossy().replace('\\', "/")
      );

      // Start backend as a sidecar.
      let mut cmd = Command::new_sidecar("backend")?;
      let mut envs = HashMap::new();
      envs.insert("HOST".to_string(), "127.0.0.1".to_string());
      envs.insert("PORT".to_string(), port.to_string());
      envs.insert("DATABASE_URL".to_string(), database_url);
      cmd = cmd.envs(envs);

      let (mut rx, _child) = cmd.spawn()?;

      // Consume events in background so the sidecar doesn't block on a full pipe.
      tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
          if let CommandEvent::Error(e) = event {
            eprintln!("backend sidecar error: {e}");
          }
        }
      });

      // Give backend a short head start; frontend will also retry naturally.
      std::thread::sleep(Duration::from_millis(250));

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

