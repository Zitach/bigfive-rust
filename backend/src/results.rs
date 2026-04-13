use crate::data::{get_results, TemplateFacet};
use crate::models::{DomainResult, FacetResult, ReportResponse};
use crate::score::calculate_scores;
use crate::{data::list_languages, models::Answer};

pub fn generate_report(answers: &[Answer], lang: &str) -> anyhow::Result<ReportResponse> {
    let scores = calculate_scores(answers);
    let templates = get_results(lang)?;
    let available_languages = list_languages();

    let mut results = Vec::new();
    for (key, domain_score) in &scores {
        let template = templates
            .iter()
            .find(|t| &t.domain == key)
            .ok_or_else(|| anyhow::anyhow!("Template not found for domain {}", key))?;

        let result_text = template
            .results
            .iter()
            .find(|r| r.score == domain_score.result)
            .map(|r| r.text.clone())
            .unwrap_or_default();

        let facets: Vec<FacetResult> = template
            .facets
            .iter()
            .filter_map(|tf: &TemplateFacet| {
                let facet_key = tf.facet.to_string();
                let fs = domain_score.facet.get(&facet_key)?;
                Some(FacetResult {
                    facet: tf.facet,
                    title: tf.title.clone(),
                    text: tf.text.clone(),
                    score: fs.score,
                    count: fs.count,
                    score_text: fs.result.clone(),
                })
            })
            .collect();

        results.push(DomainResult {
            domain: template.domain.clone(),
            title: template.title.clone(),
            short_description: template.short_description.clone(),
            description: template.description.clone(),
            score_text: domain_score.result.clone(),
            count: domain_score.count,
            score: domain_score.score,
            facets,
            text: result_text,
        });
    }

    let order = ["O", "C", "E", "A", "N"];
    results.sort_by_key(|r| {
        order
            .iter()
            .position(|&o| o == r.domain)
            .unwrap_or(usize::MAX)
    });

    Ok(ReportResponse {
        id: "".to_string(),
        timestamp: 0,
        available_languages,
        language: lang.to_string(),
        results,
    })
}
