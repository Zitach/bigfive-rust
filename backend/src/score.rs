use crate::models::Answer;
use serde::Serialize;
use std::collections::HashMap;

#[derive(Debug, Clone, Default, Serialize)]
pub struct FacetScore {
    pub score: i32,
    pub count: i32,
    pub result: String,
}

#[derive(Debug, Clone, Default, Serialize)]
pub struct DomainScore {
    pub score: i32,
    pub count: i32,
    pub result: String,
    pub facet: HashMap<String, FacetScore>,
}

fn classify(score: i32, count: i32) -> String {
    if count == 0 {
        return "neutral".to_string();
    }
    let avg = score as f64 / count as f64;
    if avg > 3.0 {
        "high".to_string()
    } else if avg < 3.0 {
        "low".to_string()
    } else {
        "neutral".to_string()
    }
}

pub fn calculate_scores(answers: &[Answer]) -> HashMap<String, DomainScore> {
    let mut result: HashMap<String, DomainScore> = HashMap::new();
    for answer in answers {
        let domain = result.entry(answer.domain.clone()).or_default();
        domain.score += answer.score;
        domain.count += 1;

        let facet_key = answer.facet.to_string();
        let facet = domain.facet.entry(facet_key).or_default();
        facet.score += answer.score;
        facet.count += 1;
    }
    for domain in result.values_mut() {
        domain.result = classify(domain.score, domain.count);
        for facet in domain.facet.values_mut() {
            facet.result = classify(facet.score, facet.count);
        }
    }
    result
}
