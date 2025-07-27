from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Tuple

# Simple skill match engine using TF-IDF

def rank_skill_matches(query: str, skills: List[str]) -> List[Tuple[str, float]]:
    corpus = [query] + skills
    vectorizer = TfidfVectorizer().fit_transform(corpus)
    vectors = vectorizer.toarray()
    cosine_sim = cosine_similarity([vectors[0]], vectors[1:])[0]
    ranked = list(zip(skills, cosine_sim))
    return sorted(ranked, key=lambda x: x[1], reverse=True)
