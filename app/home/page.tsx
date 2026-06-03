"use client";
import "../globals.css";
import {
  ChevronRightIcon,
} from "@icons/index";
import { useEffect, useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import NavigationHeader from "@/components/NavigationHeader";
import VoiceNewsCard from "@/components/NewsCard";
import VerticalNewsCard from "@/components/VerticalNewsCard";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import { Characters } from "@/app/ai-character/config"; // キャラクター情報をインポート
import { playAudio } from "@/app/lib/audio";
import { HatenaNewsItem, getHatenaNewsSubject } from "@/app/lib/news";

export default function HomePage() {
  const [popularNews, setPopularNews] = useState<HatenaNewsItem[]>([]);
  const [newTopics, setNewTopics] = useState<HatenaNewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/hatena?type=popular")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.error) setError(data.error);
        else setPopularNews(data);
      })
      .catch(() => setError("Failed to load data"));
  }, []);

  useEffect(() => {
    fetch("/api/hatena?type=new")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.error) setError(data.error);
        else setNewTopics(data);
      })
      .catch(() => setError("Failed to load data"));
  }, []);

  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col overflow-y-auto bg-background-light no-scrollbar">

      {/* bottom navigation bar */}
      <BottomNavigationBar />
      <div className="mx-auto flex w-full max-w-[30rem] flex-1 flex-col pb-28 pt-2">
        <div className="shrink-0">
          <NavigationHeader title="今日の Nemura" showBack={false} className="px-0" />
        </div>

        {error && (
          <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mt-4 flex justify-center">
          <div className="relative aspect-[3/1] w-full max-w-[25rem]">
            <SafeImage
              src="/graphic-nemura.png"
              alt="Nemura graphic"
              fill
              sizes="(max-width: 640px) 92vw, 25rem"
              className="object-contain"
            />
          </div>
        </div>

        <div className="mt-6">
          <section className="mb-8">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <h2 className="title mb-1 text-white-soft">おすすめ</h2>
                <p className="desc">選択されたトピック</p>
              </div>
              <Link href="/topic" className="flex items-center gap-1 self-center text-[#3A86FF]">
                <p>すべて見る</p>
                <ChevronRightIcon className="scale-[0.8] cursor-pointer text-[#3A86FF]" />
              </Link>
            </div>

            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:-mx-6 sm:px-6">
              {newTopics.slice(0, 5).map((news) => (
                <div key={news.link} className="flex-shrink-0">
                  <VerticalNewsCard
                    item={{
                      title: news.title,
                      imageUrl: news["hatena:imageurl"],
                      subject: getHatenaNewsSubject(news),
                      body: news.body,
                      link: news.link
                    }}
                    onPlayClick={() => playAudio(news.title, Characters[18].value)}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="title">最新ニュース</h2>
              <Link href="/latest" className="flex items-center gap-1 text-[#3A86FF]">
                <p>すべて見る</p>
                <ChevronRightIcon className="scale-[0.8] cursor-pointer text-[#3A86FF]" />
              </Link>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {popularNews.slice(0, 10).map((news) => (
                <VoiceNewsCard
                  key={news.link}
                  item={{
                    title: news.title,
                    imageUrl: news["hatena:imageurl"],
                    subject: getHatenaNewsSubject(news),
                    body: news.body,
                    link: news.link
                  }}
                  onPlayClick={() => playAudio(news.title, Characters[18].value)}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
