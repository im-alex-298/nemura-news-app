"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signInAnonymously } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import Background from "@/components/Background";
import LottiePlayer from "@/components/LottiePlayer";

import {
  ArrowRightIcon,
  AddCircleIcon,
  RemoveCircleIcon,
  RefreshIcon,
} from "@/assets/icons";

import smileJson from "@/assets/animations/smile-nemura.json";
import { auth, db } from "@/app/lib/config/firebase";

const DISPLAY_COUNT = 6;

function normalize(s: string) {
  return s.replace(/\s+/g, "").toLowerCase();
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function pickDisplayTopics(pool: string[], selected: string[], count: number) {
  const remaining = pool.filter((t) => !selected.includes(t));
  const fillers = shuffle(remaining).slice(
    0,
    Math.max(0, count - selected.length),
  );
  return [...selected, ...fillers].slice(0, count);
}

export default function TopicSelectionPage() {
  const router = useRouter();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [displayedTopics, setDisplayedTopics] = useState<string[]>([]);
  const [allTopics, setAllTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const extractUniqueTopics = useCallback((data: unknown[]) => {
    return Array.from(
      new Map(
        data
          .flatMap((item) => {
            const subject = (item as { "dc:subject"?: string | string[] })[
              "dc:subject"
            ];
            const subjects = Array.isArray(subject) ? subject : [subject];
            return subjects
              .filter(
                (s): s is string => typeof s === "string" && s.trim().length > 0,
              )
              .map((s) => [normalize(s), s] as const);
          }),
      ).values(),
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/hatena?type=popular");
        const data = await res.json();
        if (cancelled) return;

        if (data.error) {
          setError(data.error);
          return;
        }

        const unique = extractUniqueTopics(data);
        setAllTopics(unique);
        setDisplayedTopics(pickDisplayTopics(unique, [], DISPLAY_COUNT));
      } catch {
        if (!cancelled) setError("トピックの読み込みに失敗しました");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [extractUniqueTopics]);

  const handleRefresh = () => {
    if (allTopics.length === 0 || refreshing) return;
    setRefreshing(true);
    setDisplayedTopics(
      pickDisplayTopics(allTopics, selectedTopics, DISPLAY_COUNT),
    );
    window.setTimeout(() => setRefreshing(false), 300);
  };

  const handleNext = async () => {
    if (selectedTopics.length === 0) {
      setError("最低1つ選んでください");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        onboardingCompleted: true,
        topics: selectedTopics,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.replace("/welcome/choose-voice");
    } catch (e) {
      console.error("Error:", e);
      setError("保存に失敗しました");
      setSubmitting(false);
    }
  };

  const visibleTopics = useMemo(() => {
    const missingSelected = selectedTopics.filter(
      (t) => !displayedTopics.includes(t),
    );
    return [...missingSelected, ...displayedTopics].filter(
      (t, i, arr) => arr.indexOf(t) === i,
    );
  }, [displayedTopics, selectedTopics]);

  return (
    <Background>
      <div className="relative w-full h-[100dvh] flex flex-col items-center overflow-hidden">
        <div className="mt-[18%] w-full px-8 z-10 flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <h1 className="text-white-soft text-[20px] font-bold tracking-tight leading-snug text-left drop-shadow-white-glow-str">
              あなたが気になる話題はなんですか？
            </h1>
            <p className="text-white-soft text-[15px] text-left">
              あとから設定で変えられます
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || refreshing || allTopics.length === 0}
            aria-label="トピックを入れ替える"
            className="shrink-0 flex items-center gap-1.5 text-white-soft bg-button/80 backdrop-blur-md px-3.5 py-2 rounded-full font-bold transition-all active:scale-95 drop-shadow-white-glow disabled:opacity-50"
          >
            <RefreshIcon
              className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="text-[13px]">いれかえ</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 px-6 w-full max-w-[420px] z-10">
            <p className="text-red-300 text-sm text-center bg-red-900/30 py-2 px-4 rounded-xl">
              {error}
            </p>
          </div>
        )}

        <div className="mt-6 w-full px-6 max-w-[420px] z-10 flex-1 min-h-0 overflow-y-auto pb-36">
          {loading ? (
            <p className="text-white-soft text-center py-8">読み込み中...</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {visibleTopics.map((topic) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <li key={topic}>
                    <button
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      disabled={submitting}
                      className={`
                        w-full flex items-start gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98]
                        ${
                          isSelected
                            ? "bg-button text-white-soft border-transparent drop-shadow-white-glow"
                            : "bg-white-soft text-gray-soft border-transparent"
                        }
                        ${submitting ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      {isSelected ? (
                        <RemoveCircleIcon className="shrink-0 mt-0.5" />
                      ) : (
                        <AddCircleIcon className="shrink-0 mt-0.5 text-gray-soft" />
                      )}
                      <span className="text-[16px] font-bold leading-relaxed break-words whitespace-normal">
                        {topic}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="absolute bottom-28 w-full px-8 flex justify-between items-center z-20">
          <button
            type="button"
            onClick={() => router.push("/welcome?index=4")}
            disabled={submitting}
            className={`
              flex items-center gap-1 text-white-soft bg-button backdrop-blur-md border border-white/0 px-6 py-2.5 rounded-full font-bold transition-all active:scale-95 drop-shadow-white-glow
              ${submitting ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <ArrowRightIcon className="rotate-180" />
            <span className="text-[16px]">もどる</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={selectedTopics.length === 0 || submitting}
            className={`
              flex items-center gap-1 px-6 py-2.5 rounded-full font-bold transition-all
              ${
                selectedTopics.length === 0 || submitting
                  ? "opacity-50 cursor-not-allowed bg-button"
                  : "text-white-soft bg-button active:scale-95 drop-shadow-white-glow"
              }
            `}
          >
            <span className="text-[16px]">
              {submitting ? "保存中..." : "次へ"}
            </span>
            {!submitting && <ArrowRightIcon />}
          </button>
        </div>

        <div className="absolute bottom-[-100px] w-full flex justify-center pointer-events-none z-0">
          <LottiePlayer data={smileJson} width={360} height={360} />
        </div>
      </div>
    </Background>
  );
}
