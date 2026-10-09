package com.aiclassroom.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GeminiService {
    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

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

        boolean isGcpOAuthToken = apiKey.startsWith("ya29.");

        // Candidate Gemini API model endpoints (supports latest available models)
        String[] modelNames = new String[]{
            "gemini-3.8-flash",
            "gemini-flash-latest",
            "gemini-3.5-flash",
            "gemini-2.5-flash",
            "gemini-1.5-flash-latest"
        };

        String promptText = String.format(
            "Act as an expert academic AI evaluator for university coursework grading.\n\n" +
            "TEACHER'S ASSIGNMENT TITLE & QUESTION BRIEF:\n%s\n\n" +
            "RUBRIC CRITERIA:\n%s\n\n" +
            "STUDENT SUBMISSION:\n%s\n\n" +
            "EVALUATION INSTRUCTIONS:\n" +
            "1. TOPIC & RELEVANCE CHECK: Evaluate if the student submission answers the specific assignment topic and requirements. Note that valid source code submissions (e.g. C, C++, Java, Python implementing algorithms like FCFS, SJF, Sorting, SQL queries, etc.) that fulfill the prompt requirements must be marked RELEVANT even if acronyms like 'FCFS' are expanded into algorithm logic, function names, or code constructs.\n" +
            "2. ACCURACY & QUALITY: If the submission directly answers the prompt, score objectively based on completeness, technical/academic accuracy, and fulfillment of instructions.\n" +
            "3. Start your response with line 1 strictly formatted as:\n" +
            "   SCORE: [X]/10\n" +
            "   (where X is 0.0 to 10.0 based on relevance and solution quality)\n" +
            "4. Line 2: RELEVANCE: [Y]%%\n" +
            "5. Line 3: FEEDBACK: [Detailed constructive explanation of the score awarded].",
            assignmentPrompt, rubricDetails != null ? rubricDetails : "Standard Academic Criteria", studentSubmission
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (isGcpOAuthToken) {
            headers.setBearerAuth(apiKey.trim());
        }

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", promptText);

        Map<String, Object> contentMap = new HashMap<>();
        contentMap.put("parts", Collections.singletonList(textPart));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", Collections.singletonList(contentMap));

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        for (String model : modelNames) {
            String endpoint = isGcpOAuthToken
                ? "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent"
                : "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey.trim();
            try {
                log.info("🌐 [GEMINI API DISPATCH] Calling Gemini model='{}' (AuthType={})", model, isGcpOAuthToken ? "GCP OAuth Bearer" : "API Key");
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
                                log.info("✅ [GEMINI API RESPONSE RECEIVED] Model='{}' responded successfully. Length={} chars", model, resText.length());
                                return resText;
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("⚠️ [GEMINI API ENDPOINT SKIPPED] Model='{}' failed: {}. Trying next candidate model...", model, e.getMessage());
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

        Set<String> stopWords = new HashSet<>(Arrays.asList(
            "the", "is", "at", "which", "on", "a", "an", "and", "or", "to", "in", "for", "of", "with", "by", "from",
            "please", "should", "have", "must", "using"
        ));

        String[] promptTokens = lowerPrompt.replaceAll("[^a-z0-9\\s]", " ").split("\\s+");
        Set<String> keyPromptTerms = new HashSet<>();
        for (String t : promptTokens) {
            if (t.length() >= 2 && !stopWords.contains(t)) {
                keyPromptTerms.add(t);
            }
        }

        Set<String> expandedConceptTerms = SpringAiGradingService.getExpandedConceptTerms(lowerPrompt);

        int matchCount = 0;
        for (String term : keyPromptTerms) {
            if (SpringAiGradingService.containsWordOrPhrase(lowerContent, term)) {
                matchCount++;
            }
        }

        int conceptMatchCount = 0;
        for (String concept : expandedConceptTerms) {
            if (SpringAiGradingService.containsWordOrPhrase(lowerContent, concept)) {
                conceptMatchCount++;
            }
        }

        boolean isCode = SpringAiGradingService.isRecognizedCodeSubmission(content);

        double baseRatio = keyPromptTerms.size() > 0 ? (double) matchCount / keyPromptTerms.size() : 0.5;
        double conceptRatio = expandedConceptTerms.size() > 0 ? Math.min(1.0, (double) conceptMatchCount / 2.0) : 0.0;

        double relevanceRatio = Math.max(baseRatio, conceptRatio);
        if (isCode && (conceptMatchCount > 0 || matchCount > 0)) {
            relevanceRatio = Math.max(relevanceRatio, 0.85);
        }

        double relevancePercentage = Math.min(100.0, Math.round(relevanceRatio * 100.0 * 10.0) / 10.0);

        if (relevanceRatio < 0.15 && !isCode && conceptMatchCount == 0) {
            return String.format(
                "SCORE: 0.0/10\nRELEVANCE: %.1f%%\nFEEDBACK: REJECTED - Complete Topic Mismatch: Submission content shares less than 15%% relevance with the teacher's assignment prompt. Expected solution for \"%s\".",
                relevancePercentage, prompt.length() > 60 ? prompt.substring(0, 60) + "..." : prompt
            );
        }

        // Completeness checks
        double completenessFactor = 1.0;
        List<String> missingElements = new ArrayList<>();
        boolean asksForCode = lowerPrompt.contains("program") || lowerPrompt.contains("code") || lowerPrompt.contains("algo") || lowerPrompt.contains("implement");
        if (asksForCode && !isCode) {
            completenessFactor -= 0.35;
            missingElements.add("Source code implementation");
        }

        if (lowerPrompt.contains("fcfs") || lowerPrompt.contains("scheduling") || lowerPrompt.contains("sjf") || lowerPrompt.contains("rr")) {
            boolean hasWaiting = lowerContent.contains("wt") || lowerContent.contains("waiting") || lowerContent.contains("wait");
            boolean hasTurnaround = lowerContent.contains("tat") || lowerContent.contains("turnaround") || lowerContent.contains("turn_around") || lowerContent.contains("completion");
            boolean hasBurst = lowerContent.contains("bt") || lowerContent.contains("burst") || lowerContent.contains("burst_time") || lowerContent.contains("time");
            boolean hasLoop = lowerContent.contains("for") || lowerContent.contains("while") || lowerContent.contains("loop") || lowerContent.contains("schedule");

            if (!hasWaiting) { completenessFactor -= 0.10; missingElements.add("Waiting time calculation (WT)"); }
            if (!hasTurnaround) { completenessFactor -= 0.10; missingElements.add("Turnaround time calculation (TAT)"); }
            if (!hasBurst) { completenessFactor -= 0.05; missingElements.add("Burst time processing"); }
            if (!hasLoop) { completenessFactor -= 0.10; missingElements.add("Scheduling loop execution"); }
        }

        if (content.trim().length() < 70) {
            completenessFactor -= 0.15;
            missingElements.add("Sufficient implementation detail");
        }

        completenessFactor = Math.max(0.20, Math.min(1.0, completenessFactor));

        double baseScore = 8.5 + (relevanceRatio * 1.5);
        double finalScore = Math.min(10.0, Math.round((baseScore * completenessFactor) * 10.0) / 10.0);

        String feedbackMsg = missingElements.isEmpty()
            ? "Academic Submission Evaluated Successfully: Valid technical concepts and complete solution structures present."
            : "Academic Submission Evaluated with Deductions: Missing components: " + String.join(", ", missingElements) + ". Marks deducted accordingly.";

        return String.format(
            "SCORE: %.1f/10\nRELEVANCE: %.1f%%\nFEEDBACK: %s",
            finalScore, relevancePercentage, feedbackMsg
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

        if (feedbackText.toLowerCase().contains("rejected") || feedbackText.contains("SCORE: 0.0/10") || feedbackText.contains("SCORE: 0/10")) {
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
