"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Award,
  Sparkles,
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ChevronRight,
  Loader2,
  Brain,
  Zap,
  Plus,
  Trash2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { QuizItem, QuizQuestionItem, QuizAttemptItem, CourseItem } from "@/lib/types";
import { getDifficultyColor } from "@/lib/utils";

function QuizzesContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic");

  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Active Test Player State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [attemptResult, setAttemptResult] = useState<any>(null);
  const [submittingAttempt, setSubmittingAttempt] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // New Quiz Modal
  const [newQuizModalOpen, setNewQuizModalOpen] = useState(false);
  const [quizTopic, setQuizTopic] = useState(initialTopic || "");
  const [quizDifficulty, setQuizDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState("5");
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Timer while quiz is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeQuiz && !testCompleted) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeQuiz, testCompleted]);

  async function fetchData() {
    try {
      setLoading(true);
      const [quizzesRes, coursesRes] = await Promise.all([
        fetch("/api/quizzes"),
        fetch("/api/courses"),
      ]);
      const quizzesData = await quizzesRes.json();
      const coursesData = await coursesRes.json();

      setQuizzes(quizzesData.quizzes || []);
      setCourses(coursesData.courses || []);
    } catch (err) {
      console.error("Failed to load quizzes:", err);
    } finally {
      setLoading(false);
    }
  }

  const startQuiz = (quiz: QuizItem) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setTestCompleted(false);
    setAttemptResult(null);
    setSecondsElapsed(0);
  };

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const deleteQuiz = async (quizId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`/api/quizzes/${quizId}`, { method: "DELETE" });
      const updated = quizzes.filter((q) => q.id !== quizId);
      setQuizzes(updated);
      if (activeQuiz?.id === quizId) {
        setActiveQuiz(null);
      }
    } catch (err) {
      console.error("Error deleting quiz:", err);
    }
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTopic.trim() || generatingQuiz) return;

    try {
      setGeneratingQuiz(true);
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: quizTopic,
          difficulty: quizDifficulty,
          questionCount: Number(questionCount),
        }),
      });

      const data = await res.json();
      if (data.quiz) {
        setQuizzes([data.quiz, ...quizzes]);
        setNewQuizModalOpen(false);
        setQuizTopic("");
        startQuiz(data.quiz);
      }
    } catch (err) {
      console.error("Error creating quiz:", err);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || submittingAttempt) return;

    try {
      setSubmittingAttempt(true);
      const res = await fetch(`/api/quizzes/${activeQuiz.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: userAnswers }),
      });

      const data = await res.json();
      if (data.attempt) {
        setAttemptResult(data.attempt);
        setTestCompleted(true);

        if (data.attempt.percentage >= 70) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err) {
      console.error("Error submitting test:", err);
    } finally {
      setSubmittingAttempt(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading your quizzes & revision decks...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Quiz & Revision Hub
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Test yourself with AI-generated exam MCQs, True/False, and conceptual questions tailored to your syllabus.
          </p>
        </div>

        <Button
          onClick={() => setNewQuizModalOpen(true)}
          className="rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs md:text-sm gap-1.5 shadow-md shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" />
          Generate New Quiz
        </Button>
      </div>

      {/* Active Quiz Player View OR Quiz Deck Listing */}
      {activeQuiz ? (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Top Bar of Active Quiz */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div>
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                {activeQuiz.topic}
              </span>
              <h2 className="text-base font-bold text-white truncate">
                {activeQuiz.title}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {formatTimer(secondsElapsed)}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setActiveQuiz(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Exit Quiz
              </Button>
            </div>
          </div>

          {!testCompleted ? (
            /* Question Stepper & Choices */
            <div className="space-y-6">
              {/* Stepper Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}
                  </span>
                  <span>
                    {Object.keys(userAnswers).length}/{activeQuiz.questions.length} Answered
                  </span>
                </div>
                <Progress
                  value={((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100}
                  className="h-1.5 bg-slate-800"
                />
              </div>

              {/* Question Card */}
              {activeQuiz.questions[currentQuestionIdx] && (
                <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-6">
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {activeQuiz.questions[currentQuestionIdx].type.replace("_", " ")}
                    </Badge>
                    <h3 className="text-base md:text-lg font-semibold text-white leading-relaxed">
                      {activeQuiz.questions[currentQuestionIdx].question}
                    </h3>
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {activeQuiz.questions[currentQuestionIdx].options &&
                    activeQuiz.questions[currentQuestionIdx].options!.length > 0 ? (
                      activeQuiz.questions[currentQuestionIdx].options!.map((option, oIdx) => {
                        const currentQId = activeQuiz.questions[currentQuestionIdx].id;
                        const isSelected = userAnswers[currentQId] === option;

                        return (
                          <div
                            key={oIdx}
                            onClick={() => handleSelectAnswer(currentQId, option)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-amber-500/10 border-amber-500 text-white font-medium ring-1 ring-amber-500/40"
                                : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900/80 hover:text-white"
                            }`}
                          >
                            <span className="text-xs md:text-sm">{option}</span>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? "border-amber-400 bg-amber-400"
                                  : "border-slate-600"
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-medium">
                          Your Short Answer:
                        </label>
                        <input
                          type="text"
                          value={userAnswers[activeQuiz.questions[currentQuestionIdx].id] || ""}
                          onChange={(e) =>
                            handleSelectAnswer(
                              activeQuiz.questions[currentQuestionIdx].id,
                              e.target.value
                            )
                          }
                          placeholder="Type your answer here..."
                          className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <Button
                      variant="outline"
                      disabled={currentQuestionIdx === 0}
                      onClick={() => setCurrentQuestionIdx((prev) => prev - 1)}
                      className="rounded-xl border-slate-800 text-xs"
                    >
                      Previous
                    </Button>

                    {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
                      <Button
                        onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                        className="rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs gap-1"
                      >
                        Next Question <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmitQuiz}
                        disabled={submittingAttempt}
                        className="rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs gap-1.5 font-semibold shadow-md shadow-amber-600/20"
                      >
                        {submittingAttempt ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                          </>
                        ) : (
                          "Submit Test & Grade"
                        )}
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </div>
          ) : (
            /* Results Screen */
            <div className="space-y-6 animate-in zoom-in-95">
              <Card className="border-slate-800 bg-slate-900/90 text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Award className="w-8 h-8 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Score: {attemptResult?.score}/{attemptResult?.maxScore} ({attemptResult?.percentage}%)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Completed in {formatTimer(secondsElapsed)}
                  </p>
                </div>

                {attemptResult?.feedback && (
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-3">
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      💡 {attemptResult.feedback.suggestedRevision}
                    </p>
                    {attemptResult.feedback.weakTopics?.length > 0 && (
                      <div className="text-[11px] text-rose-400">
                        Areas to Review: {attemptResult.feedback.weakTopics.join(", ")}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    onClick={() => startQuiz(activeQuiz)}
                    variant="outline"
                    className="rounded-xl border-slate-700 text-xs gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
                  </Button>
                  <Button
                    onClick={() => setActiveQuiz(null)}
                    className="rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs"
                  >
                    Back to All Quizzes
                  </Button>
                </div>
              </Card>

              {/* Explanations Breakdown */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white px-1">
                  Answers & Explanations Breakdown
                </h4>
                {activeQuiz.questions.map((q, idx) => {
                  const userAns = userAnswers[q.id];
                  const isCorrect =
                    userAns &&
                    (userAns.toLowerCase() === q.correctAnswer.toLowerCase() ||
                      q.correctAnswer.toLowerCase().includes(userAns.toLowerCase()));

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 font-semibold text-white">
                          <span className="text-slate-500">Q{idx + 1}.</span>
                          <span>{q.question}</span>
                        </div>
                        {isCorrect ? (
                          <Badge variant="emerald" className="text-[10px] shrink-0">
                            Correct (+{q.points})
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px] shrink-0">
                            Incorrect (0/{q.points})
                          </Badge>
                        )}
                      </div>

                      <div className="pl-5 space-y-1">
                        <div className="text-slate-400">
                          Your Answer:{" "}
                          <span className={isCorrect ? "text-emerald-400" : "text-rose-400"}>
                            {userAns || "No answer"}
                          </span>
                        </div>
                        <div className="text-slate-300">
                          Correct Answer:{" "}
                          <span className="text-emerald-400 font-medium">
                            {q.correctAnswer}
                          </span>
                        </div>
                        {q.explanation && (
                          <p className="text-[11px] text-slate-400 italic bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/40 mt-1">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="border-slate-800 bg-slate-950/60 hover:bg-slate-900/60 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`text-[10px] ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {quiz.questions?.length || 5} Questions
                  </span>
                </div>
                <CardTitle className="text-base font-semibold text-white mt-2 group-hover:text-amber-300 transition-colors">
                  {quiz.title}
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Topic: {quiz.topic}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 flex items-center gap-2">
                <Button
                  onClick={() => startQuiz(quiz)}
                  className="flex-1 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-semibold gap-1.5 transition-all"
                >
                  <Zap className="w-3.5 h-3.5" /> Start Quiz
                </Button>
                <Button
                  variant="outline"
                  size="iconSm"
                  onClick={(e) => deleteQuiz(quiz.id, e)}
                  className="rounded-xl border-slate-800 hover:border-rose-500/30 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete quiz"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Generate Quiz Modal */}
      <Dialog open={newQuizModalOpen} onOpenChange={setNewQuizModalOpen}>
        <DialogContent className="max-w-md bg-slate-950 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Generate Custom Study Quiz</DialogTitle>
            <DialogDescription>
              Create practice questions from your course topics or any concept.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleGenerateQuiz} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Topic / Concept *</label>
              <input
                type="text"
                required
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                placeholder="e.g. Process Scheduling & CPU Queues"
                className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Difficulty</label>
                <select
                  value={quizDifficulty}
                  onChange={(e) => setQuizDifficulty(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="easy">Easy (Fundamentals)</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="hard">Hard (Tricky)</option>
                  <option value="exam">Exam-Level (University)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Question Count</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="3">3 Questions</option>
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewQuizModalOpen(false)}
                className="rounded-xl border-slate-800 text-slate-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={generatingQuiz}
                className="rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold"
              >
                {generatingQuiz ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Generating...
                  </>
                ) : (
                  "Generate Quiz"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function QuizzesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-sm text-slate-400">Loading quizzes...</p>
        </div>
      }
    >
      <QuizzesContent />
    </Suspense>
  );
}
