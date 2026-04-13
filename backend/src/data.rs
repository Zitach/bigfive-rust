use rust_embed::RustEmbed;
use serde::{Deserialize, Serialize};

#[derive(RustEmbed)]
#[folder = "src/data/questions/"]
struct QuestionsAsset;

#[derive(RustEmbed)]
#[folder = "src/data/results/"]
struct ResultsAsset;

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
    #[serde(rename = "ipipId")]
    pub ipip_id: Option<Vec<String>>,
    pub choices: Vec<QuestionChoice>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct TemplateResult {
    pub score: String,
    pub text: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct TemplateFacet {
    pub facet: i32,
    pub title: String,
    pub text: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DomainTemplate {
    pub domain: String,
    pub title: String,
    pub short_description: String,
    pub description: String,
    pub results: Vec<TemplateResult>,
    pub facets: Vec<TemplateFacet>,
}

pub fn list_languages() -> Vec<crate::models::Language> {
    let mut langs = Vec::new();
    for file in QuestionsAsset::iter() {
        let name = file.as_ref();
        if let Some(id) = name.strip_suffix(".json") {
            let result_file = format!("{}.json", id);
            if ResultsAsset::get(&result_file).is_none() {
                continue;
            }
            let display = match id {
                "en" => "English",
                "zh" => "Chinese",
                "zh-cn" => "Chinese (Simplified)",
                "zh-hk" => "Chinese (Hong Kong)",
                "es" => "Spanish",
                "fr" => "French",
                "de" => "German",
                "ja" => "Japanese",
                "ru" => "Russian",
                "pt-br" => "Portuguese (Brazil)",
                "it" => "Italian",
                "nl" => "Dutch",
                "ar" => "Arabic",
                "ko" => "Korean",
                "sv" => "Swedish",
                "no" => "Norwegian",
                "da" => "Danish",
                "fi" => "Finnish",
                "pl" => "Polish",
                "tr" => "Turkish",
                "he" => "Hebrew",
                "id" => "Indonesian",
                "hi" => "Hindi",
                "uk" => "Ukrainian",
                "ro" => "Romanian",
                "el" => "Greek",
                "cs" => "Czech",
                "hu" => "Hungarian",
                "th" => "Thai",
                "vi" => "Vietnamese",
                "ms" => "Malay",
                "bn" => "Bengali",
                "is" => "Icelandic",
                _ => id,
            };
            langs.push(crate::models::Language {
                id: id.to_string(),
                name: display.to_string(),
            });
        }
    }
    langs.sort_by(|a, b| a.id.cmp(&b.id));
    langs
}

pub fn get_questions(lang: &str) -> anyhow::Result<Vec<Question>> {
    let file = format!("{}.json", lang);
    let asset = QuestionsAsset::get(&file)
        .ok_or_else(|| anyhow::anyhow!("Questions not found for language {}", lang))?;
    let data = serde_json::from_slice(&asset.data)?;
    Ok(data)
}

pub fn get_results(lang: &str) -> anyhow::Result<Vec<DomainTemplate>> {
    let file = format!("{}.json", lang);
    let asset = ResultsAsset::get(&file)
        .ok_or_else(|| anyhow::anyhow!("Results not found for language {}", lang))?;
    let data = serde_json::from_slice(&asset.data)?;
    Ok(data)
}
