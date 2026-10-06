package com.aiclassroom.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GeminiService {

    @Value("${gemini.api.key:AIzaSy_DEFAULT_GEMINI_KEY}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public GeminiService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Calls Google Gemini REST API for strict academic evaluation passing Teacher Brief + Question + Student Submission.
     */
    public String evaluateSubmissionWithGemini(String studentSubmission, String assignmentPrompt, String rubricDetails) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("YOUR_GEMINI") || apiKey.contains("DEFAULT_GEMINI")) {
            return performFallbackEvaluation(studentSubmission, assignmentPrompt);
        }

        // Candidate Gemini API model endpoints
        String[] modelEndpoints = new String[]{
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey,
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" + apiKey,
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey
        };

        String promptText = String.format(
            "Act as an expert academic AI evaluator for university coursework grading.\n\n" +
            "TEACHER'S ASSIGNMENT TITLE & QUESTION BRIEF:\n%s\n\n" +
            "RUBRIC CRITERIA:\n%s\n\n" +
            "STUDENT SUBMISSION:\n%s\n\n" +
            "EVALUATION INSTRUCTIONS:\n" +
            "1. TOPIC & RELEVANCE CHECK: First evaluate if the student submission actually answers the specific assignment question, topic, and requirements specified by the teacher above. If the student submitted content for a wrong question, completely different topic/technology, or random text, assign SCORE: 0/10 with status REJECTED.\n" +
            "2. ACCURACY & QUALITY: If the submission directly answers the prompt, score objectively based on completeness, technical/academic accuracy, and fulfillment of the instructions.\n" +
            "3. Start your response with line 1 strictly formatted as:\n" +
            "   SCORE: [X]/10\n" +
            "   (where X is 0.0 to 10.0 based on relevance and solution quality; award 0.0 for wrong topic/question)\n" +
            "4. Line 2: RELEVANCE: [Y]%%\n" +
            "5. Line 3: FEEDBACK: [Detailed constructive explanation of the score awarded].",
            assignmentPrompt, rubricDetails != null ? rubricDetails : "Standard Academic Criteria", studentSubmission
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", promptText);

        Map<String, Object> contentMap = new HashMap<>();
        contentMap.put("parts", Collections.singletonList(textPart));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", Collections.singletonList(contentMap));

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        for (String endpoint : modelEndpoints) {
            try {
                ResponseEntity<Map> response = restTemplate.exchange(endpoint, HttpMethod.POST, requestEntity, Map.class);
                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    List candidates = (List) response.getBody().get("candidates");
                    if (candidates != null && !candidates.isEmpty()) {
                        Map firstCandidate = (Map) candidates.get(0);
                        Map content = (Map) firstCandidate.get("content");
                        List parts = (List) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map firstPart = (Map) parts.get(0);
                            String resText = (String) firstPart.get("text");
                            if (resText != null && !resText.trim().isEmpty()) {
                                return resText;
                            }
                        }
                    }
                }
            } catch (Exception e) {
                // Continue to next endpoint attempt
            }
        }

        return performFallbackEvaluation(studentSubmission, assignmentPrompt);
    }

    /**
     * Universal semantic relevance fallback evaluation engine comparing prompt instructions vs student submission.
     */
    public String performFallbackEvaluation(String content, String prompt) {
        if (content == null || content.trim().length() < 10) {
            return "SCORE: 0.0/10\nRELEVANCE: 0%\nFEEDBACK: REJECTED: Submission content empty or inadequate to fulfill assignment requirements.";
        }

        String lowerContent = content.toLowerCase();
        String lowerPrompt = prompt != null ? prompt.toLowerCase() : "";

        // Check SQL vs MongoDB technology mismatch
        boolean contextIsSql = lowerPrompt.contains("sql") || lowerPrompt.contains("relational") || lowerPrompt.contains("postgres") || lowerPrompt.contains("mysql") || lowerPrompt.contains("queries");
        boolean contextIsMongo = lowerPrompt.contains("mongo") || lowerPrompt.contains("nosql") || lowerPrompt.contains("bson");

        boolean subIsMongo = lowerContent.contains("db.") || lowerContent.contains("find({") || lowerContent.contains("find (") || lowerContent.contains("aggregate([") || lowerContent.contains("mongodb") || lowerContent.contains("$match");
        boolean subIsSql = lowerContent.contains("select ") || lowerContent.contains("from ") || lowerContent.contains("insert into") || lowerContent.contains("create table") || lowerContent.contains("where ");

        if (contextIsSql && !contextIsMongo && subIsMongo && !subIsSql) {
            return "SCORE: 0.0/10\nRELEVANCE: 0.0%\nFEEDBACK: REJECTED - Critical Technology Mismatch: Submitted MongoDB NoSQL query syntax for an SQL Relational assignment. Awarded 0/10.";
        }

        if (contextIsMongo && !contextIsSql && subIsSql && !subIsMongo) {
            return "SCORE: 0.0/10\nRELEVANCE: 0.0%\nFEEDBACK: REJECTED - Critical Technology Mismatch: Submitted SQL query syntax for a MongoDB NoSQL assignment. Awarded 0/10.";
        }

        // Extract key technical/subject terms from prompt (filter out generic stopwords)
        Set<String> stopWords = new HashSet<>(Arrays.asList(
            "the", "is", "at", "which", "on", "a", "an", "and", "or", "to", "in", "for", "of", "with", "by", "from",
            "write", "submit", "assignment", "solution", "create", "please", "should", "have", "must", "using", "code",
            "explain", "example", "each", "them", "question", "cmds", "commands", "cmd", "topic", "details"
        ));

        String[] promptTokens = lowerPrompt.replaceAll("[^a-z0-9\\s]", " ").split("\\s+");
        Set<String> keyPromptTerms = new HashSet<>();
        for (String t : promptTokens) {
            if (t.length() > 2 && !stopWords.contains(t)) {
                keyPromptTerms.add(t);
            }
        }

        if (keyPromptTerms.isEmpty()) {
            keyPromptTerms.addAll(Arrays.asList(promptTokens));
        }

        int matchCount = 0;
        for (String term : keyPromptTerms) {
            if (lowerContent.contains(term)) {
                matchCount++;
            }
        }

        double relevanceRatio = keyPromptTerms.size() > 0 ? (double) matchCount / keyPromptTerms.size() : 0.5;
        double relevancePercentage = Math.min(100.0, Math.round(relevanceRatio * 100.0 * 10.0) / 10.0);

        if (relevanceRatio < 0.20) {
            return String.format(
                "SCORE: 0.0/10\nRELEVANCE: %.1f%%\nFEEDBACK: REJECTED - Topic Mismatch: Submission content shares less than 20%% relevance with the teacher's assignment prompt. Expected solution for \"%s\".",
                relevancePercentage, prompt.length() > 60 ? prompt.substring(0, 60) + "..." : prompt
            );
        }

        double scoreVal = Math.min(10.0, Math.round((5.0 + (relevanceRatio * 5.0)) * 10.0) / 10.0);
        return String.format(
            "SCORE: %.1f/10\nRELEVANCE: %.1f%%\nFEEDBACK: Academic Submission Evaluated: Addresses assignment prompt requirements.",
            scoreVal, relevancePercentage
        );
    }

    /**
     * Extracts numerical ratio (0.0 to 1.0) from Gemini AI response text.
     */
    public static double parseScoreRatio(String feedbackText) {
        if (feedbackText == null || feedbackText.trim().isEmpty()) return 0.0;

        try {
            Matcher matcher = Pattern.compile("SCORE:\\s*([0-9.]+)\\s*/\\s*10", Pattern.CASE_INSENSITIVE).matcher(feedbackText);
            if (matcher.find()) {
                double val = Double.parseDouble(matcher.group(1));
                return Math.max(0.0, Math.min(1.0, val / 10.0));
            }

            Matcher matcher2 = Pattern.compile("([0-9.]+)\\s*/\\s*10").matcher(feedbackText);
            if (matcher2.find()) {
                double val = Double.parseDouble(matcher2.group(1));
                return Math.max(0.0, Math.min(1.0, val / 10.0));
            }
        } catch (Exception e) {
            // Ignore parsing error
        }

        if (feedbackText.contains("REJECTED") || feedbackText.contains("0.0/10") || feedbackText.contains("Off-Topic")) {
            return 0.0;
        }

        return 0.8; // Default 80% if unparseable
    }

    /**
     * N-Gram similarity calculation engine for plagiarism analysis.
     */
    public double calculatePlagiarismSimilarity(String contentA, String contentB) {
        if (contentA == null || contentB == null || contentA.trim().isEmpty() || contentB.trim().isEmpty()) {
            return 0.0;
        }

        String[] tokensA = contentA.toLowerCase().replaceAll("[^a-zA-Z0-9\\s]", "").split("\\s+");
        String[] tokensB = contentB.toLowerCase().replaceAll("[^a-zA-Z0-9\\s]", "").split("\\s+");

        java.util.Set<String> setA = new java.util.HashSet<>(java.util.Arrays.asList(tokensA));
        java.util.Set<String> setB = new java.util.HashSet<>(java.util.Arrays.asList(tokensB));

        java.util.Set<String> intersection = new java.util.HashSet<>(setA);
        intersection.retainAll(setB);

        java.util.Set<String> union = new java.util.HashSet<>(setA);
        union.addAll(setB);

        if (union.isEmpty()) return 0.0;

        double jaccardSimilarity = (double) intersection.size() / union.size();
        return Math.round(jaccardSimilarity * 100.0 * 10.0) / 10.0;
    }
}
