// ============================================================
// FILE: app/mini-game/page.tsx
// ============================================================

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Timer,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { getAllOutfits, Outfit } from '../../lib/data-loader';
import {
  getMiniGameHighScore,
  saveMiniGameHighScore,
} from '../../lib/storage';
import { showToast } from '../../components/cultural-decorations';

interface QuizQuestion {
  correctOutfit: Outfit;
  options: Outfit[];
}

const TOTAL_QUESTIONS = 5;
const TIME_PER_QUESTION = 10;

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateQuizQuestions(): QuizQuestion[] {
  const all = getAllOutfits();
  const picked = shuffleArray(all).slice(0, TOTAL_QUESTIONS);

  return picked.map((correctOutfit) => {
    const distractors = shuffleArray(
      all.filter((item) => item.id !== correctOutfit.id)
    ).slice(0, 3);
    const options = shuffleArray([correctOutfit, ...distractors]);
    return {
      correctOutfit,
      options,
    };
  });
}

export default function MiniGamePage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'answered' | 'finished'>('ready');

  useEffect(() => {
    setHighScore(getMiniGameHighScore());
    setQuestions(generateQuizQuestions());
  }, []);

  const startNewGame = useCallback(() => {
    setQuestions(generateQuizQuestions());
    setCurrentIdx(0);
    setScore(0);
    setTimeLeft(TIME_PER_QUESTION);
    setSelectedOptionId(null);
    setGameState('playing');
  }, []);

  const handleTimeUp = useCallback(() => {
    setSelectedOptionId('TIMEOUT');
    setScore((prev) => prev - 5);
    setGameState('answered');
    showToast('Hết giờ! -5 điểm', 'warning');
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameState, timeLeft, handleTimeUp]);

  const handleSelectOption = (optionId: string) => {
    if (gameState !== 'playing') return;
    const currentQ = questions[currentIdx];
    setSelectedOptionId(optionId);
    setGameState('answered');

    if (optionId === currentQ.correctOutfit.id) {
      const gained = 10 + timeLeft;
      setScore((prev) => prev + gained);
      showToast(`Chính xác! +${gained} điểm`, 'success');
    } else {
      setScore((prev) => prev - 2);
      showToast('Chưa chính xác! -2 điểm', 'error');
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 >= TOTAL_QUESTIONS) {
      const best = saveMiniGameHighScore(score);
      setHighScore(best);
      setGameState('finished');
    } else {
      setCurrentIdx((prev) => prev + 1);
      setTimeLeft(TIME_PER_QUESTION);
      setSelectedOptionId(null);
      setGameState('playing');
    }
  };

  const currentQuestion = questions[currentIdx];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
      {/* Header + High Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5DED0]">
        <div>
          <span className="page-eyebrow">THỬ TÀI NHẬN DIỆN CỔ PHỤC</span>
          <h1 className="page-title mt-1">Mini-game Đoán Tên Việt Phục</h1>
          <p className="text-sm text-[#615F5A] mt-1">
            5 câu hỏi · 10 giây mỗi câu · Đúng +(10 + giây còn lại) điểm · Sai -2 điểm · Hết giờ -5 điểm
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-[#D4AF37] self-start sm:self-auto shrink-0">
          <Trophy className="w-6 h-6 text-[#D4AF37]" />
          <div>
            <span className="block text-xs text-[#615F5A]">Kỷ lục điểm cao</span>
            <span className="font-serif text-2xl font-bold text-[#1A1A1A] tabular-nums">
              {highScore} điểm
            </span>
          </div>
        </div>
      </div>

      {/* STATE 1: READY */}
      {gameState === 'ready' && (
        <div className="card-elegant p-8 sm:p-12 text-center space-y-6 animate-fade-in">
          <div className="text-5xl select-none">🏮</div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
            Bạn nhận diện được bao nhiêu trang phục Việt Nam?
          </h2>
          <p className="text-sm sm:text-base text-[#615F5A] max-w-lg mx-auto leading-relaxed">
            Quan sát hình ảnh và gợi ý vùng miền để chọn đúng tên gọi của 5 bộ Việt phục truyền thống trong vòng 10 giây mỗi câu.
          </p>
          <button
            type="button"
            onClick={startNewGame}
            className="btn-primary text-base px-8 py-4 min-h-[48px] inline-flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>Bắt đầu thử thách ngay</span>
          </button>
        </div>
      )}

      {/* STATE 2: PLAYING / ANSWERED */}
      {(gameState === 'playing' || gameState === 'answered') && currentQuestion && (
        <div className="card p-6 sm:p-8 space-y-6 animate-fade-in">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E5DED0]">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#2D3561]">
              Câu hỏi {currentIdx + 1} / {TOTAL_QUESTIONS}
            </span>

            <div
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold tabular-nums ${
                timeLeft <= 3
                  ? 'bg-red-100 text-[#F44336]'
                  : 'bg-[#FAF6F0] text-[#1A1A1A] border border-[#E5DED0]'
              }`}
            >
              <Timer className="w-4 h-4 text-[#C8102E]" />
              <span>{timeLeft}s</span>
            </div>

            <span className="font-serif text-lg font-bold text-[#C8102E] tabular-nums">
              Điểm: {score}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Image Preview (5 cols) */}
            <div className="md:col-span-5">
              <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden border border-[#E5DED0] bg-[#EAE2D3]">
                <img
                  src={currentQuestion.correctOutfit.thumbnail}
                  alt="Đoán tên trang phục truyền thống"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Question & 4 Options (7 cols) */}
            <div className="md:col-span-7 space-y-5">
              <div>
                <span className="text-xs font-semibold text-[#615F5A]">
                  Gợi ý: Vùng {currentQuestion.correctOutfit.region} · Thời kỳ{' '}
                  {currentQuestion.correctOutfit.dynasty}
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A] mt-1">
                  Đây là trang phục truyền thống nào của Việt Nam?
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((opt) => {
                  const isCorrect = opt.id === currentQuestion.correctOutfit.id;
                  const isChosen = selectedOptionId === opt.id;

                  let btnStyle =
                    'bg-white border border-[#E5DED0] hover:border-[#D4AF37] text-[#1A1A1A]';
                  if (gameState === 'answered') {
                    if (isCorrect) {
                      btnStyle =
                        'bg-emerald-50 border-2 border-[#4CAF50] text-emerald-950 font-bold';
                    } else if (isChosen && !isCorrect) {
                      btnStyle =
                        'bg-red-50 border-2 border-[#F44336] text-red-950';
                    } else {
                      btnStyle = 'bg-white/60 border border-[#E5DED0] text-[#615F5A] opacity-65';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={gameState === 'answered'}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full p-4 rounded-2xl text-left flex items-center justify-between gap-3 transition-all min-h-[52px] cursor-pointer ${btnStyle}`}
                    >
                      <span className="text-sm sm:text-base font-medium">
                        {opt.name}
                      </span>
                      {gameState === 'answered' && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-[#4CAF50] shrink-0" />
                      )}
                      {gameState === 'answered' && isChosen && !isCorrect && (
                        <XCircle className="w-5 h-5 text-[#F44336] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next Button when answered */}
              {gameState === 'answered' && (
                <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#D4AF37]/50 space-y-3 animate-fade-in">
                  <p className="text-xs sm:text-sm text-[#1A1A1A] leading-relaxed">
                    <strong className="text-[#C8102E]">
                      {currentQuestion.correctOutfit.name}:{' '}
                    </strong>
                    {currentQuestion.correctOutfit.description}
                  </p>
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="btn-primary text-sm px-6 py-2.5 min-h-[44px] inline-flex items-center gap-2"
                  >
                    <span>
                      {currentIdx + 1 >= TOTAL_QUESTIONS
                        ? 'Xem tổng kết điểm'
                        : 'Câu tiếp theo'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: FINISHED */}
      {gameState === 'finished' && (
        <div className="card-elegant p-8 sm:p-12 text-center space-y-6 animate-fade-in">
          <div className="text-5xl select-none">🎉</div>
          <span className="page-eyebrow">HOÀN THÀNH THỬ THÁCH</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
            Tổng điểm của bạn: <span className="text-[#C8102E] tabular-nums">{score}</span>
          </h2>
          <p className="text-sm sm:text-base text-[#615F5A] max-w-md mx-auto">
            Kỷ lục cao nhất hiện tại: <strong className="text-[#1A1A1A] tabular-nums">{highScore} điểm</strong>. Bạn đã nắm thêm nhiều kiến thức thú vị về di sản trang phục Việt Nam!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={startNewGame}
              className="btn-primary inline-flex items-center gap-2 min-h-[48px]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chơi lại lượt mới</span>
            </button>
            <Link
              href="/studio"
              className="btn-secondary inline-flex items-center gap-2 min-h-[48px]"
            >
              <Sparkles className="w-4 h-4 text-[#C8102E]" />
              <span>Vào Studio phối đồ</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
