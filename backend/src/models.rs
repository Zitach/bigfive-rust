use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuestionChoice {
    pub text: String,
    pub score: i32,
    pub color: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Question {
    pub id: String,
    pub text: String,
    pub keyed: String,
    pub domain: String,
    pub facet: i32,
    pub ipip_id: Option<Vec<String>>,
    pub choices: Vec<QuestionChoice>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Answer {
    pub id: String,
    pub score: i32,
    pub domain: String,
    pub facet: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestPayload {
    pub test_id: String,
    pub lang: String,
    pub invalid: bool,
    pub time_elapsed: i64,
    pub date_stamp: DateTime<Utc>,
    pub answers: Vec<Answer>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateTestResponse {
    pub id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FacetResult {
    pub facet: i32,
    pub title: String,
    pub text: String,
    pub score: i32,
    pub count: i32,
    pub score_text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DomainResult {
    pub domain: String,
    pub title: String,
    pub short_description: String,
    pub description: String,
    pub score_text: String,
    pub count: i32,
    pub score: i32,
    pub facets: Vec<FacetResult>,
    pub text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportResponse {
    pub id: String,
    pub timestamp: i64,
    pub available_languages: Vec<Language>,
    pub language: String,
    pub results: Vec<DomainResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Language {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeedbackPayload {
    pub name: String,
    pub email: String,
    pub message: String,
}
