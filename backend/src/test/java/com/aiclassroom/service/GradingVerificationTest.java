package com.aiclassroom.service;

import org.junit.jupiter.api.Test;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

public class GradingVerificationTest {

    @Test
    public void testFcfsAlgorithmEvaluation() {
        GeminiService geminiService = new GeminiService();
        SpringAiGradingService gradingService = new SpringAiGradingService(null, geminiService);

        String assignmentTitle = "write program for fcfs algo";
        String assignmentDescription = "write program for fcfs algo in c";
        String requiredTopic = "Operating Systems";
        double maxMarks = 10.0;

        Map<String, String> rubric = new LinkedHashMap<>();
        rubric.put("rub-1", "Understanding & Concepts (Max 3.0)");
        rubric.put("rub-2", "Correctness & Accuracy (Max 4.0)");
        rubric.put("rub-3", "Structure & Execution (Max 1.5)");
        rubric.put("rub-4", "Completeness (Max 1.5)");

        String studentCode = 
            "#include<stdio.h>\n" +
            "int main() {\n" +
            "    int n = 3, bt[20] = {5, 4, 3}, wt[20], tat[20];\n" +
            "    wt[0] = 0;\n" +
            "    for(int i = 1; i < n; i++) {\n" +
            "        wt[i] = wt[i-1] + bt[i-1];\n" +
            "    }\n" +
            "    for(int i = 0; i < n; i++) {\n" +
            "        tat[i] = bt[i] + wt[i];\n" +
            "    }\n" +
            "    printf(\"FCFS Scheduling Execution Completed.\\n\");\n" +
            "    return 0;\n" +
            "}";

        SpringAiGradingService.GradingEvaluationResult result = gradingService.gradeSubmission(
            studentCode,
            assignmentTitle,
            assignmentDescription,
            requiredTopic,
            maxMarks,
            rubric
        );

        System.out.println("=================================================");
        System.out.println("TEST 1: RAW CODE SUBMISSION VERIFICATION");
        System.out.println("RAW SCORE: " + result.getRawScore() + " / " + maxMarks);
        System.out.println("RELEVANCE: " + result.getRelevanceScore() + "%");
        System.out.println("IS OFF TOPIC: " + result.isOffTopic());
        System.out.println("FEEDBACK:\n" + result.getFeedback());
        System.out.println("RUBRIC BREAKDOWN: " + result.getRubricBreakdown());
        System.out.println("=================================================");

        assertFalse(result.isOffTopic(), "Submission should NOT be rejected as off-topic");
        assertTrue(result.getRawScore() >= 8.5, "Raw score should be at least 8.5/10 for correct FCFS implementation");
        assertTrue(result.getRelevanceScore() >= 80.0, "Relevance score should be at least 80%");
    }

    @Test
    public void testPdfExtractedContentEvaluation() {
        GeminiService geminiService = new GeminiService();
        SpringAiGradingService gradingService = new SpringAiGradingService(null, geminiService);

        String assignmentTitle = "write program for fcfs algo";
        String assignmentDescription = "write program for fcfs algo in c";
        String requiredTopic = "Operating Systems";
        double maxMarks = 10.0;

        Map<String, String> rubric = new LinkedHashMap<>();
        rubric.put("rub-1", "Understanding & Concepts (Max 3.0)");
        rubric.put("rub-2", "Correctness & Accuracy (Max 4.0)");
        rubric.put("rub-3", "Structure & Execution (Max 1.5)");
        rubric.put("rub-4", "Completeness (Max 1.5)");

        String pdfExtractedSubmission = 
            "[PDF Document Extracted Content from student_fcfs_assignment.pdf]\n\n" +
            "#include<stdio.h>\n" +
            "int main() {\n" +
            "    int n = 3, bt[] = {4, 3, 1}, wt[3], tat[3];\n" +
            "    wt[0] = 0;\n" +
            "    for(int i = 1; i < n; i++) wt[i] = wt[i-1] + bt[i-1];\n" +
            "    for(int i = 0; i < n; i++) tat[i] = bt[i] + wt[i];\n" +
            "    printf(\"Turnaround time and waiting time calculated.\\n\");\n" +
            "    return 0;\n" +
            "}";

        SpringAiGradingService.GradingEvaluationResult result = gradingService.gradeSubmission(
            pdfExtractedSubmission,
            assignmentTitle,
            assignmentDescription,
            requiredTopic,
            maxMarks,
            rubric
        );

        System.out.println("=================================================");
        System.out.println("TEST 2: PDF EXTRACTED CONTENT VERIFICATION");
        System.out.println("RAW SCORE: " + result.getRawScore() + " / " + maxMarks);
        System.out.println("RELEVANCE: " + result.getRelevanceScore() + "%");
        System.out.println("IS OFF TOPIC: " + result.isOffTopic());
        System.out.println("FEEDBACK:\n" + result.getFeedback());
        System.out.println("RUBRIC BREAKDOWN: " + result.getRubricBreakdown());
        System.out.println("=================================================");

        assertFalse(result.isOffTopic(), "PDF extracted content should NOT be rejected");
        assertTrue(result.getRawScore() >= 8.5, "Raw score should be at least 8.5/10");
    }

    @Test
    public void testIncompleteSubmissionReducedScore() {
        GeminiService geminiService = new GeminiService();
        SpringAiGradingService gradingService = new SpringAiGradingService(null, geminiService);

        String assignmentTitle = "write program for fcfs algo";
        String assignmentDescription = "write program for fcfs algo in c";
        String requiredTopic = "Operating Systems";
        double maxMarks = 10.0;

        Map<String, String> rubric = new LinkedHashMap<>();
        rubric.put("rub-1", "Understanding & Concepts (Max 3.0)");
        rubric.put("rub-2", "Correctness & Accuracy (Max 4.0)");
        rubric.put("rub-3", "Structure & Execution (Max 1.5)");
        rubric.put("rub-4", "Completeness (Max 1.5)");

        // Incomplete code: missing Turnaround time and Waiting time calculation
        String incompleteStudentCode = 
            "#include<stdio.h>\n" +
            "int main() {\n" +
            "    int n = 3, bt[] = {5, 4, 3};\n" +
            "    printf(\"Burst times are entered.\\n\");\n" +
            "    return 0;\n" +
            "}";

        SpringAiGradingService.GradingEvaluationResult result = gradingService.gradeSubmission(
            incompleteStudentCode,
            assignmentTitle,
            assignmentDescription,
            requiredTopic,
            maxMarks,
            rubric
        );

        System.out.println("=================================================");
        System.out.println("TEST 3: INCOMPLETE SUBMISSION (REDUCED MARKS)");
        System.out.println("RAW SCORE: " + result.getRawScore() + " / " + maxMarks);
        System.out.println("RELEVANCE: " + result.getRelevanceScore() + "%");
        System.out.println("IS OFF TOPIC: " + result.isOffTopic());
        System.out.println("FEEDBACK:\n" + result.getFeedback());
        System.out.println("=================================================");

        assertFalse(result.isOffTopic(), "Should not be off-topic since it is related code");
        assertTrue(result.getRawScore() < 8.5, "Score should be REDUCED due to missing calculations (expected < 8.5)");
        assertTrue(result.getRawScore() >= 3.0, "Score should be greater than 0 for partial attempt");
    }

    @Test
    public void testCompletelyMismatchedSubmissionZeroScore() {
        GeminiService geminiService = new GeminiService();
        SpringAiGradingService gradingService = new SpringAiGradingService(null, geminiService);

        String assignmentTitle = "write program for fcfs algo";
        String assignmentDescription = "write program for fcfs algo in c";
        String requiredTopic = "Operating Systems";
        double maxMarks = 10.0;

        Map<String, String> rubric = new LinkedHashMap<>();
        rubric.put("rub-1", "Understanding & Concepts (Max 3.0)");
        rubric.put("rub-2", "Correctness & Accuracy (Max 4.0)");
        rubric.put("rub-3", "Structure & Execution (Max 1.5)");
        rubric.put("rub-4", "Completeness (Max 1.5)");

        // Completely mismatched submission: Chocolate cake recipe
        String offTopicSubmission = 
            "Chocolate Cake Recipe:\n" +
            "1. Preheat oven to 350 degrees F (175 degrees C).\n" +
            "2. Mix flour, sugar, cocoa powder, baking powder and salt.\n" +
            "3. Add eggs, milk, vegetable oil and vanilla extract.\n" +
            "4. Bake for 30 to 35 minutes until toothpick comes out clean.";

        SpringAiGradingService.GradingEvaluationResult result = gradingService.gradeSubmission(
            offTopicSubmission,
            assignmentTitle,
            assignmentDescription,
            requiredTopic,
            maxMarks,
            rubric
        );

        System.out.println("=================================================");
        System.out.println("TEST 4: COMPLETELY MISMATCHED SUBMISSION (ZERO SCORE)");
        System.out.println("RAW SCORE: " + result.getRawScore() + " / " + maxMarks);
        System.out.println("RELEVANCE: " + result.getRelevanceScore() + "%");
        System.out.println("IS OFF TOPIC: " + result.isOffTopic());
        System.out.println("FEEDBACK:\n" + result.getFeedback());
        System.out.println("=================================================");

        assertTrue(result.isOffTopic(), "Complete mismatch should be flagged as off-topic");
        assertEquals(0.0, result.getRawScore(), "Complete mismatch MUST receive 0.0 marks");
    }
}
