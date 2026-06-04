// src/types/db.ts
// Auto-derived from migration 0001 (SQLite / D1)

/* --------------------------------------------------
 * Common helpers
 * -------------------------------------------------- */

export type SQLiteBoolean = 0 | 1;
export type SQLiteTimestamp = string;

/* --------------------------------------------------
 * USERS
 * -------------------------------------------------- */

export interface User {
  id: number;
  email: string;
  name: string;
  google_id: string | null;
  plan_id: number;
  created_at: SQLiteTimestamp;
}

/* --------------------------------------------------
 * PLANS
 * -------------------------------------------------- */

export interface Plan {
  id: number;
  name: string;
  max_tests: number | null;
  max_questions_per_test: number | null;
  can_export_results: SQLiteBoolean;
  can_ai_generate: SQLiteBoolean;
  price_monthly: number;
}

/* --------------------------------------------------
 * TESTS
 * -------------------------------------------------- */

export interface Test {
  id: number;
  owner_id: number;
  title: string;
  description: string | null;
  duration_minutes: number;
  public_link: string;
  is_active: SQLiteBoolean;
  created_at: SQLiteTimestamp;
}

/* --------------------------------------------------
 * QUESTIONS
 * -------------------------------------------------- */

export interface Question {
  id: number;
  test_id: number;
  question_text: string;
  created_at: SQLiteTimestamp;
}

/* --------------------------------------------------
 * ANSWERS (answer options)
 * -------------------------------------------------- */

export interface Answer {
  id: number;
  question_id: number;
  answer_text: string;
  is_correct: SQLiteBoolean;
}

/* --------------------------------------------------
 * TEST SUBMISSIONS
 * -------------------------------------------------- */

export type SubmissionStatus = "started" | "submitted" | "expired";

export interface TestSubmission {
  id: number;
  test_id: number;
  user_email: string;
  status: SubmissionStatus;
  started_at: SQLiteTimestamp;
  submitted_at: SQLiteTimestamp | null;
}

/* --------------------------------------------------
 * SUBMISSION ANSWERS
 * -------------------------------------------------- */

export interface SubmissionAnswer {
  id: number;
  submission_id: number;
  question_id: number;
  answer_text: string;
  is_correct: SQLiteBoolean | null;
}

/* --------------------------------------------------
 * Derived / helper types (JOINs, API usage)
 * -------------------------------------------------- */

export interface UserWithPlan extends User {
  plan: Plan;
}

export interface TestWithQuestions extends Test {
  questions: (Question & {
    answers: Answer[];
  })[];
}

export interface SubmissionWithAnswers extends TestSubmission {
  answers: SubmissionAnswer[];
}