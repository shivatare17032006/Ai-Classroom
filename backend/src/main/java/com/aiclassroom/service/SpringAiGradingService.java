package com.aiclassroom.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Spring AI Powered Automated Grading & Marking Service.
 * Leverages Spring AI ChatModel, PromptTemplates, and Structured Output Evaluation
 * for automated academic scoring, rubric criteria evaluation, and feedback generation.
 */
@Service
public class SpringAiGradingService {

    private static final Logger log = LoggerFactory.getLogger(SpringAiGradingService.class);

    private final ChatModel chatModel;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    @Autowired
    public SpringAiGradingService(@Autowired(required = false) ChatModel chatModel, GeminiService geminiService) {
        this.chatModel = chatModel;
        this.geminiService = geminiService;
        this.objectMapper = new ObjectMapper();
    }

    public static class GradingEvaluationResult {
        private double scoreRatio; // 0.0 to 1.0
        private double rawScore;   // Numerical score out of total marks
        private String feedback;   // Comprehensive academic feedback
        private Map<String, Double> rubricBreakdown; // Rubric itemId -> score
        private boolean isOffTopic;
        private double relevanceScore; // 0.0 to 100.0

        public GradingEvaluationResult() {
            this.rubricBreakdown = new HashMap<>();
        }

        public GradingEvaluationResult(double scoreRatio, double rawScore, String feedback, Map<String, Double> rubricBreakdown, boolean isOffTopic, double relevanceScore) {
            this.scoreRatio = scoreRatio;
            this.rawScore = rawScore;
            this.feedback = feedback;
            this.rubricBreakdown = rubricBreakdown != null ? rubricBreakdown : new HashMap<>();
            this.isOffTopic = isOffTopic;
            this.relevanceScore = relevanceScore;
        }

        public double getScoreRatio() { return scoreRatio; }
        public void setScoreRatio(double scoreRatio) { this.scoreRatio = scoreRatio; }

        public double getRawScore() { return rawScore; }
        public void setRawScore(double rawScore) { this.rawScore = rawScore; }

        public String getFeedback() { return feedback; }
        public void setFeedback(String feedback) { this.feedback = feedback; }

        public Map<String, Double> getRubricBreakdown() { return rubricBreakdown; }
        public void setRubricBreakdown(Map<String, Double> rubricBreakdown) { this.rubricBreakdown = rubricBreakdown; }

        public boolean isOffTopic() { return isOffTopic; }
        public void setOffTopic(boolean offTopic) { isOffTopic = offTopic; }

        public double getRelevanceScore() { return relevanceScore; }
        public void setRelevanceScore(double relevanceScore) { this.relevanceScore = relevanceScore; }
    }

    /**
     * Evaluates student submission using Spring AI ChatModel, Gemini API Fallback, and Local Semantic Engine.
     */
    public GradingEvaluationResult gradeSubmission(
            String studentSubmission,
            String assignmentTitle,
            String assignmentDescription,
            String requiredTopic,
            double maxMarks,
            Map<String, String> rubricCriteriaMap) {

        log.info("Executing Spring AI Grading Engine for assignment: '{}' (Max Marks: {})", assignmentTitle, maxMarks);

        // 1. Construct Prompt using Spring AI System & User Prompt Templating
        String systemInstructionText = 
            "You are an expert academic evaluator using Spring AI Framework for automated coursework assessment.\n" +
            "Your task is to evaluate the student's submission rigorously against the assignment prompt and rubric.\n" +
            "Provide objective, fair scoring with constructive academic feedback.\n" +
            "Output must strictly contain:\n" +
            "SCORE: [X]/10 (where X is 0.0 to 10.0 score ratio)\n" +
            "RELEVANCE: [Y]% (topic match percentage)\n" +
            "FEEDBACK: [Detailed constructive explanation]\n" +
            "STRENGTHS: [Key positive aspects of submission]\n" +
            "AREAS_FOR_IMPROVEMENT: [Key areas where submission needs work]";

        String userPromptTemplate = 
            "ASSIGNMENT TITLE: {title}\n" +
            "DESCRIPTION & BRIEF:\n{description}\n" +
            "REQUIRED TOPIC/SUBJECT: {topic}\n" +
            "MAXIMUM MARKS AVAILABLE: {maxMarks}\n\n" +
            "RUBRIC CRITERIA:\n{rubric}\n\n" +
            "STUDENT SUBMISSION CONTENT:\n{submission}\n\n" +
            "Evaluate relevance, topic alignment, technical depth, and rubric fulfillment.";

        Map<String, Object> templateVars = new HashMap<>();
        templateVars.put("title", assignmentTitle != null ? assignmentTitle : "Assignment");
        templateVars.put("description", assignmentDescription != null ? assignmentDescription : "Complete task as described.");
        templateVars.put("topic", requiredTopic != null && !requiredTopic.trim().isEmpty() ? requiredTopic : "General");
        templateVars.put("maxMarks", maxMarks);
        templateVars.put("rubric", formatRubricForPrompt(rubricCriteriaMap));
        templateVars.put("submission", studentSubmission != null ? studentSubmission : "");

        PromptTemplate promptTemplate = new PromptTemplate(userPromptTemplate);
        Prompt prompt = promptTemplate.create(templateVars);

        // 1. Try Spring AI ChatModel execution if available
        if (chatModel != null) {
            try {
                SystemMessage systemMessage = new SystemMessage(systemInstructionText);
                UserMessage userMessage = new UserMessage(prompt.getContents());

                Prompt springAiPrompt = new Prompt(List.of(systemMessage, userMessage));
                ChatResponse chatResponse = chatModel.call(springAiPrompt);

                if (chatResponse != null && chatResponse.getResult() != null && chatResponse.getResult().getOutput() != null) {
                    String aiResponseText = chatResponse.getResult().getOutput().getContent();
                    log.info("Spring AI ChatModel evaluation successful.");
                    return parseAiGradingResponse(aiResponseText, maxMarks, rubricCriteriaMap);
                }
            } catch (Exception e) {
                log.warn("Spring AI ChatModel call failed or unconfigured: {}. Trying Gemini API Fallback...", e.getMessage());
            }
        }

        // 2. Try Google Gemini Service as AI fallback
        if (geminiService != null) {
            try {
                String geminiFeedback = geminiService.evaluateSubmissionWithGemini(
                    studentSubmission,
                    (assignmentTitle != null ? assignmentTitle : "") + ": " + (assignmentDescription != null ? assignmentDescription : "") + " [Topic: " + (requiredTopic != null ? requiredTopic : "General") + "]",
                    formatRubricForPrompt(rubricCriteriaMap)
                );
                if (geminiFeedback != null && !geminiFeedback.trim().isEmpty()) {
                    log.info("Google Gemini AI Service evaluation fallback successful.");
                    return parseAiGradingResponse(geminiFeedback, maxMarks, rubricCriteriaMap);
                }
            } catch (Exception e) {
                log.warn("Google Gemini API fallback failed: {}. Executing local semantic fallback...", e.getMessage());
            }
        }

        // 3. Smart Spring AI Local Semantic Engine Fallback
        return performSpringAiFallbackEvaluation(studentSubmission, assignmentTitle, assignmentDescription, requiredTopic, maxMarks, rubricCriteriaMap);
    }

    private String formatRubricForPrompt(Map<String, String> rubricCriteriaMap) {
        if (rubricCriteriaMap == null || rubricCriteriaMap.isEmpty()) {
            return "Standard Academic Criteria (Content accuracy, clarity, problem solving, formatting)";
        }
        StringBuilder sb = new StringBuilder();
        rubricCriteriaMap.forEach((id, desc) -> sb.append("- Criteria [").append(id).append("]: ").append(desc).append("\n"));
        return sb.toString();
    }

    /**
     * Parses Spring AI model output text into structured GradingEvaluationResult.
     */
    /**
     * Parses Spring AI model output text into structured GradingEvaluationResult.
     */
    public GradingEvaluationResult parseAiGradingResponse(String aiText, double maxMarks, Map<String, String> rubricMap) {
        double scoreRatio = 0.8; // Default 80%
        double relevanceScore = 80.0;
        boolean isOffTopic = false;
        String feedback = aiText;

        try {
            Matcher scoreMatcher = Pattern.compile("SCORE:\\s*([0-9.]+)\\s*/\\s*10", Pattern.CASE_INSENSITIVE).matcher(aiText != null ? aiText : "");
            if (scoreMatcher.find()) {
                double val = Double.parseDouble(scoreMatcher.group(1));
                scoreRatio = Math.max(0.0, Math.min(1.0, val / 10.0));
                if (val <= 0.0) {
                    isOffTopic = true;
                }
            }

            Matcher relMatcher = Pattern.compile("RELEVANCE:\\s*([0-9.]+)\\s*%", Pattern.CASE_INSENSITIVE).matcher(aiText != null ? aiText : "");
            if (relMatcher.find()) {
                relevanceScore = Double.parseDouble(relMatcher.group(1));
                if (relevanceScore < 20.0 && scoreRatio <= 0.0) {
                    isOffTopic = true;
                } else if (scoreRatio > 0.0) {
                    isOffTopic = false;
                }
            }
        } catch (Exception e) {
            log.error("Error parsing Spring AI response metrics: {}", e.getMessage());
        }

        if (aiText != null) {
            String lower = aiText.toLowerCase();
            if (lower.contains("status: rejected") || lower.contains("topic mismatch") || lower.contains("off-topic submission")) {
                if (scoreRatio <= 0.0) {
                    isOffTopic = true;
                }
            }
        }

        double rawScore = Math.round(maxMarks * scoreRatio * 10.0) / 10.0;
        Map<String, Double> rubricScores = calculateRubricBreakdown(scoreRatio, rubricMap);

        return new GradingEvaluationResult(scoreRatio, rawScore, feedback, rubricScores, isOffTopic, relevanceScore);
    }

    public static class TechMismatchResult {
        private final boolean isMismatch;
        private final String feedbackMessage;

        public TechMismatchResult(boolean isMismatch, String feedbackMessage) {
            this.isMismatch = isMismatch;
            this.feedbackMessage = feedbackMessage;
        }

        public boolean isMismatch() { return isMismatch; }
        public String getFeedbackMessage() { return feedbackMessage; }
    }

    /**
     * Checks for critical domain, framework, or technology mismatches (e.g. MongoDB query for SQL assignment).
     */
    public TechMismatchResult checkTechnologyMismatch(String submission, String title, String description, String requiredTopic) {
        if (submission == null || submission.trim().isEmpty()) {
            return new TechMismatchResult(false, null);
        }

        String lowerSub = submission.toLowerCase();
        String lowerContext = ((title != null ? title : "") + " " + (description != null ? description : "") + " " + (requiredTopic != null ? requiredTopic : "")).toLowerCase();

        boolean contextIsSql = lowerContext.contains("sql") || lowerContext.contains("relational") || lowerContext.contains("postgres") || lowerContext.contains("mysql") || lowerContext.contains("sqlite") || lowerContext.contains("database query") || lowerContext.contains("queries");
        boolean contextIsMongo = lowerContext.contains("mongo") || lowerContext.contains("nosql") || lowerContext.contains("document store") || lowerContext.contains("bson");

        boolean subIsMongo = lowerSub.contains("db.") || lowerSub.contains("find({") || lowerSub.contains("find (") || lowerSub.contains("aggregate([") || lowerSub.contains("insertone(") || lowerSub.contains("insertmany(") || lowerSub.contains("mongodb") || lowerSub.contains("nosql") || lowerSub.contains("$match") || lowerSub.contains("$group") || lowerSub.contains("$project");
        boolean subIsSql = lowerSub.contains("select ") || lowerSub.contains("from ") || lowerSub.contains("insert into") || lowerSub.contains("create table") || lowerSub.contains("alter table") || lowerSub.contains("drop table") || lowerSub.contains("where ") || lowerSub.contains("group by") || lowerSub.contains("inner join") || lowerSub.contains("left join");

        if (contextIsSql && !contextIsMongo && subIsMongo && !subIsSql) {
            return new TechMismatchResult(true, "SPRING AI EVALUATION RESULT:\nSCORE: 0.0/10\nRELEVANCE: 0.0%\nSTATUS: REJECTED (Technology & Query Syntax Mismatch)\nFEEDBACK: Critical Technology Mismatch: Submission contains MongoDB NoSQL query operations (`db.collection.find()`), which does not fulfill the requirement for relational SQL database queries (`SELECT ... FROM ... WHERE ...`). Assigned 0 marks.");
        }

        if (contextIsMongo && !contextIsSql && subIsSql && !subIsMongo) {
            return new TechMismatchResult(true, "SPRING AI EVALUATION RESULT:\nSCORE: 0.0/10\nRELEVANCE: 0.0%\nSTATUS: REJECTED (Technology & Query Syntax Mismatch)\nFEEDBACK: Critical Technology Mismatch: Submission contains SQL Relational Database queries (`SELECT ... FROM ...`), which does not fulfill the requirement for MongoDB NoSQL queries (`db.collection.find()`). Assigned 0 marks.");
        }

        return new TechMismatchResult(false, null);
    }

    /**
     * Checks if a term or short acronym is present in content using strict word boundaries for short tokens.
     */
    public static boolean containsWordOrPhrase(String content, String term) {
        if (content == null || term == null || term.trim().isEmpty()) return false;
        String t = term.trim().toLowerCase();
        if (t.length() <= 3) {
            return Pattern.compile("\\b" + Pattern.quote(t) + "\\b").matcher(content).find();
        }
        return content.contains(t);
    }

    /**
     * Checks if the student submission contains recognizable source code constructs.
     */
    public static boolean isRecognizedCodeSubmission(String submission) {
        if (submission == null) return false;
        String s = submission.toLowerCase();
        return s.contains("#include") || s.contains("stdio.h") || s.contains("iostream") || s.contains("conio.h") ||
               s.contains("public class") || s.contains("public static void main") || s.contains("system.out") || s.contains("scanner") ||
               s.contains("def ") || s.contains("import ") || s.contains("print(") || s.contains("__name__") ||
               s.contains("function") || s.contains("const ") || s.contains("let ") || s.contains("console.log") ||
               s.contains("select ") || s.contains("from ") || s.contains("where ") || s.contains("create table") ||
               s.contains("struct ") || s.contains("int main") || s.contains("printf(") || s.contains("scanf(") ||
               s.contains("malloc(") || s.contains("return ") || s.contains("for (") || s.contains("for(") ||
               s.contains("while(") || s.contains("while (") || s.contains("if(") || s.contains("if (") ||
               s.contains("<html") || s.contains("<div") || s.contains("<style");
    }

    /**
     * Retrieves expanded concept terms / synonyms for common technical acronyms and domain topics.
     */
    public static Set<String> getExpandedConceptTerms(String promptText) {
        Set<String> synonyms = new HashSet<>();
        if (promptText == null) return synonyms;
        String p = promptText.toLowerCase();

        if (p.contains("fcfs") || p.contains("first come")) {
            synonyms.addAll(Arrays.asList(
                "fcfs", "first come", "first-come", "first served", "first-served", "cpu scheduling",
                "scheduling", "burst", "arrival", "waiting", "turnaround", "tat", "wt", "bt", "at",
                "ct", "gantt", "process", "ready queue", "completion"
            ));
        }
        if (p.contains("sjf") || p.contains("shortest job")) {
            synonyms.addAll(Arrays.asList(
                "sjf", "shortest job", "shortest remaining", "srtf", "burst", "preemptive", "scheduling", "wt", "tat", "bt"
            ));
        }
        if (p.contains("round robin") || p.contains("rr")) {
            synonyms.addAll(Arrays.asList(
                "round robin", "rr", "quantum", "time quantum", "preemptive", "slice", "scheduling", "queue"
            ));
        }
        if (p.contains("priority")) {
            synonyms.addAll(Arrays.asList(
                "priority", "preemptive", "non-preemptive", "highest priority", "scheduling"
            ));
        }
        if (p.contains("fifo")) {
            synonyms.addAll(Arrays.asList(
                "fifo", "first in first out", "queue", "enqueue", "dequeue", "page replacement"
            ));
        }
        if (p.contains("lru")) {
            synonyms.addAll(Arrays.asList(
                "lru", "least recently used", "cache", "page fault", "hit", "miss", "frame"
            ));
        }
        if (p.contains("sql") || p.contains("relational") || p.contains("database")) {
            synonyms.addAll(Arrays.asList(
                "sql", "select", "from", "where", "join", "insert", "create", "table", "update", "delete", "query", "database"
            ));
        }
        if (p.contains("mongo") || p.contains("nosql")) {
            synonyms.addAll(Arrays.asList(
                "mongo", "mongodb", "nosql", "db.", "find", "aggregate", "collection", "document"
            ));
        }
        if (p.contains("oop") || p.contains("object oriented") || p.contains("java") || p.contains("c++")) {
            synonyms.addAll(Arrays.asList(
                "oop", "object oriented", "class", "object", "inheritance", "polymorphism", "encapsulation", "method", "constructor"
            ));
        }
        if (p.contains("bfs") || p.contains("dfs") || p.contains("tree") || p.contains("graph")) {
            synonyms.addAll(Arrays.asList(
                "bfs", "dfs", "breadth first", "depth first", "queue", "stack", "recursion", "graph", "tree", "visited"
            ));
        }
        return synonyms;
    }

    /**
     * Smart semantic analysis engine powered by Spring AI logic for offline or API key fallback.
     */
    public GradingEvaluationResult performSpringAiFallbackEvaluation(
            String submission,
            String title,
            String description,
            String requiredTopic,
            double maxMarks,
            Map<String, String> rubricMap) {

        if (submission == null || submission.trim().length() < 10) {
            Map<String, Double> zeroRubric = calculateRubricBreakdown(0.0, rubricMap);
            String feedback = "SPRING AI EVALUATION RESULT:\n" +
                              "SCORE: 0.0/10\n" +
                              "RELEVANCE: 0%\n" +
                              "STATUS: REJECTED\n" +
                              "FEEDBACK: Submission content is empty or contains insufficient content for academic evaluation.";
            return new GradingEvaluationResult(0.0, 0.0, feedback, zeroRubric, true, 0.0);
        }

        // 1. Check for Domain / Tech Mismatch (e.g. MongoDB query submitted for SQL assignment)
        TechMismatchResult techMismatch = checkTechnologyMismatch(submission, title, description, requiredTopic);
        if (techMismatch.isMismatch()) {
            Map<String, Double> zeroRubric = calculateRubricBreakdown(0.0, rubricMap);
            return new GradingEvaluationResult(0.0, 0.0, techMismatch.getFeedbackMessage(), zeroRubric, true, 0.0);
        }

        String lowerSubmission = submission.toLowerCase();
        String fullPromptText = (title + " " + (description != null ? description : "") + " " + (requiredTopic != null ? requiredTopic : "")).toLowerCase();

        Set<String> stopWords = new HashSet<>(Arrays.asList(
            "the", "is", "at", "which", "on", "a", "an", "and", "or", "to", "in", "for", "of", "with", "by", "from",
            "please", "should", "have", "must", "using"
        ));

        String[] tokens = fullPromptText.replaceAll("[^a-z0-9\\s]", " ").split("\\s+");
        Set<String> keyTerms = new HashSet<>();
        for (String t : tokens) {
            if (t.length() >= 2 && !stopWords.contains(t)) {
                keyTerms.add(t);
            }
        }

        Set<String> expandedConceptTerms = getExpandedConceptTerms(fullPromptText);

        int matchCount = 0;
        for (String term : keyTerms) {
            if (containsWordOrPhrase(lowerSubmission, term)) {
                matchCount++;
            }
        }

        int conceptMatchCount = 0;
        for (String concept : expandedConceptTerms) {
            if (containsWordOrPhrase(lowerSubmission, concept)) {
                conceptMatchCount++;
            }
        }

        boolean isCode = isRecognizedCodeSubmission(submission);

        double baseRatio = keyTerms.size() > 0 ? (double) matchCount / keyTerms.size() : 0.5;
        double conceptRatio = expandedConceptTerms.size() > 0 ? Math.min(1.0, (double) conceptMatchCount / 2.0) : 0.0;

        double relevanceRatio = Math.max(baseRatio, conceptRatio);
        if (isCode && (conceptMatchCount > 0 || matchCount > 0)) {
            relevanceRatio = Math.max(relevanceRatio, 0.85);
        }

        double relevancePercentage = Math.min(100.0, Math.round(relevanceRatio * 100.0 * 10.0) / 10.0);

        double scoreRatio;
        boolean isOffTopic = false;
        String feedbackText;

        if (relevanceRatio < 0.15 && !isCode && conceptMatchCount == 0) {
            scoreRatio = 0.0;
            isOffTopic = true;
            feedbackText = String.format(
                "SPRING AI EVALUATION RESULT:\n" +
                "SCORE: 0.0/10\n" +
                "RELEVANCE: %.1f%%\n" +
                "STATUS: REJECTED (Off-Topic Submission)\n" +
                "FEEDBACK: Complete Topic Mismatch: The submitted content shares insufficient topic alignment (%.1f%% relevance) with the assignment prompt \"%s\". Assigned 0/10.\n" +
                "AREAS_FOR_IMPROVEMENT: Ensure submission directly answers the required assignment prompt and problem specifications.",
                relevancePercentage, relevancePercentage,
                title != null ? title : "Assignment"
            );
        } else {
            // Completeness & accuracy deductions for missing components
            double completenessFactor = 1.0;
            List<String> missingElements = new ArrayList<>();

            boolean asksForCode = fullPromptText.contains("program") || fullPromptText.contains("code") || fullPromptText.contains("algo") || fullPromptText.contains("implement");
            if (asksForCode && !isCode) {
                completenessFactor -= 0.35;
                missingElements.add("Executable source code");
            }

            if (fullPromptText.contains("fcfs") || fullPromptText.contains("scheduling") || fullPromptText.contains("sjf") || fullPromptText.contains("rr")) {
                boolean hasWaiting = lowerSubmission.contains("wt") || lowerSubmission.contains("waiting") || lowerSubmission.contains("wait");
                boolean hasTurnaround = lowerSubmission.contains("tat") || lowerSubmission.contains("turnaround") || lowerSubmission.contains("turn_around") || lowerSubmission.contains("completion");
                boolean hasBurst = lowerSubmission.contains("bt") || lowerSubmission.contains("burst") || lowerSubmission.contains("burst_time") || lowerSubmission.contains("time");
                boolean hasLoop = lowerSubmission.contains("for") || lowerSubmission.contains("while") || lowerSubmission.contains("loop") || lowerSubmission.contains("schedule");

                if (!hasWaiting) { completenessFactor -= 0.10; missingElements.add("Waiting time calculation (WT)"); }
                if (!hasTurnaround) { completenessFactor -= 0.10; missingElements.add("Turnaround time calculation (TAT)"); }
                if (!hasBurst) { completenessFactor -= 0.05; missingElements.add("Burst time handling"); }
                if (!hasLoop) { completenessFactor -= 0.10; missingElements.add("Scheduling loop execution"); }
            }

            if (submission.trim().length() < 70) {
                completenessFactor -= 0.15;
                missingElements.add("Sufficient implementation detail");
            }

            completenessFactor = Math.max(0.20, Math.min(1.0, completenessFactor));

            if (relevanceRatio >= 0.70 || (isCode && conceptMatchCount > 0)) {
                scoreRatio = (0.85 + Math.min(0.15, (relevanceRatio - 0.70) * 0.5)) * completenessFactor;
            } else if (relevanceRatio >= 0.40) {
                scoreRatio = (0.65 + (relevanceRatio - 0.40) * 0.66) * completenessFactor;
            } else {
                scoreRatio = (0.40 + (relevanceRatio - 0.15) * 1.0) * completenessFactor;
            }
            scoreRatio = Math.min(1.0, Math.max(0.0, scoreRatio));

            String areasToImprove = missingElements.isEmpty()
                ? "Ensure clean inline comments and handle boundary condition checks."
                : "Submission has missing components: " + String.join(", ", missingElements) + ". Marks deducted accordingly.";

            feedbackText = String.format(
                "SPRING AI EVALUATION RESULT:\n" +
                "SCORE: %.1f/10\n" +
                "RELEVANCE: %.1f%%\n" +
                "STATUS: ACADEMIC EVALUATION COMPLETED\n" +
                "FEEDBACK: Student submission evaluated against assignment instructions (%.1f%% prompt concept alignment).\n" +
                "STRENGTHS: Relevant concepts and technical logic identified in submission.\n" +
                "AREAS_FOR_IMPROVEMENT: %s",
                scoreRatio * 10.0, relevancePercentage, relevancePercentage, areasToImprove
            );
        }

        double rawScore = Math.round(maxMarks * scoreRatio * 10.0) / 10.0;
        Map<String, Double> rubricScores = calculateRubricBreakdown(scoreRatio, rubricMap);

        return new GradingEvaluationResult(scoreRatio, rawScore, feedbackText, rubricScores, isOffTopic, relevancePercentage);
    }

    private Map<String, Double> calculateRubricBreakdown(double scoreRatio, Map<String, String> rubricMap) {
        Map<String, Double> breakdown = new HashMap<>();
        if (rubricMap != null) {
            rubricMap.forEach((itemId, desc) -> {
                double maxVal = 2.0;
                if (desc != null && desc.contains("(Max ")) {
                    try {
                        String maxStr = desc.substring(desc.indexOf("(Max ") + 5, desc.lastIndexOf(")")).trim();
                        maxVal = Double.parseDouble(maxStr);
                    } catch (Exception e) {
                        maxVal = 2.0;
                    }
                }
                double itemScore = Math.round(maxVal * scoreRatio * 10.0) / 10.0;
                breakdown.put(itemId, itemScore);
            });
        }
        return breakdown;
    }
}
