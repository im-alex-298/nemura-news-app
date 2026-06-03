'use client';

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation';

import sample from '@/public/sample.jpg';
import SafeImage from '@/components/SafeImage';
import { playAudio } from '@/app/lib/audio';
import {
    getHatenaBookmarkCount,
    getHatenaNewsAuthor,
    getHatenaNewsDescription,
    getHatenaNewsTags,
    getHatenaNewsSubject,
    getHatenaSourceIconUrl,
    getHatenaSourceName,
    HatenaNewsItem,
    getHatenaNewsDate,
} from '@/app/lib/news';
import { useCurrentUserVoice } from '@/app/lib/useCurrentUserVoice';
import { ArrowRightIcon } from '@/app/assets/icons';

export default function NewsDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { selectedSpeaker } = useCurrentUserVoice();

    const [newsItem, setNewsItem] = useState<HatenaNewsItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        // Fetch news data
        const fetchNews = async () => {
            try {
                const response = await fetch("/api/hatena?type=new");
                const data = await response.json();

                if (Array.isArray(data)) {
                    const foundNews = data.find((news: HatenaNewsItem) => news.title === decodeURIComponent(id));
                    setNewsItem(foundNews);
                }
            } catch (err) {
                console.error("Error fetching news:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNews();
    }, [id]);

    const handlePlayAudio = async () => {
        if (!newsItem) return;

        setIsPlaying(true);
        try {
            await playAudio(getHatenaNewsDescription(newsItem), selectedSpeaker);
        } catch (err) {
            console.error("Error playing audio:", err);
        } finally {
            setIsPlaying(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-background-light min-h-screen flex items-center justify-center">
                <p className="text-white">読み込み中...</p>
            </div>
        );
    }
    if (!newsItem) {
        return (
            <div className="bg-background-light min-h-screen flex items-center justify-center">
                {/* Back button */}
                <button
                    onClick={() => router.back()}
                    className="text-blue-400 bg-white-soft left-4  rotate-180 rounded-full p-1 absolute top-8 text-sm font-semibold"
                >
                    <ArrowRightIcon />
                </button>
                <p className="text-white">ニュースが見つかりません</p>
            </div>
        );
    }

    const imageUrl = newsItem["hatena:imageurl"] || sample;
    const category = getHatenaNewsSubject(newsItem);
    const author = getHatenaNewsAuthor(newsItem);
    const bookmarkCount = getHatenaBookmarkCount(newsItem);
    const sourceName = getHatenaSourceName(newsItem);
    const sourceIconUrl = getHatenaSourceIconUrl(newsItem);
    const tags = getHatenaNewsTags(newsItem);
    const date = getHatenaNewsDate(newsItem);

    const visibleTags = [category, ...tags.filter((tag) => tag !== category)];

    return (
        <div className="bg-background-light min-h-screen h-full pb-8">

            {/* Hero image */}
            <div className="w-full h-[320px] relative overflow-hidden z-10">

                <SafeImage
                    alt={newsItem.title}
                    fill
                    src={imageUrl}
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Back button */}
                <button
                    onClick={() => router.back()}
                    className="text-blue-400 bg-white-soft left-4  rotate-180 rounded-full p-1 absolute top-8 text-sm font-semibold"
                >
                    <ArrowRightIcon />
                </button>

                {/* Title */}
                <div className='absolute bottom-4 left-4 right-4 z-20'>
                    <div className="mb-4">
                        {bookmarkCount !== null && (
                            <span className="rounded-xl bg-white/25 px-3 py-1 caption text-white">
                                <i className="fa-solid fa-bookmark"></i> {bookmarkCount}
                            </span>
                        )}
                    </div>
                    <h1 className="news-header">
                        {newsItem.title}
                    </h1>

                </div>
            </div>

            {/* Content */}
            <div className="px-4 pt-4 space-y-4">
                {/* Category and Play Button */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-full bg-white/12 ring-1 ring-white/15">
                                {sourceIconUrl ? (
                                    <SafeImage
                                        src={sourceIconUrl}
                                        fill
                                        sizes="44px"
                                        alt={sourceName}
                                        className="bg-white object-cover p-1"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white/80">
                                        {sourceName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white-soft">
                                    {sourceName}
                                </p>
                                {author && (
                                    <p className="truncate text-xs text-white/65">
                                        {author}
                                    </p>
                                )}
                                {
                                    date && (
                                        <p className="truncate text-xs text-white/80 mt-1">
                                            {date.toLocaleDateString()}
                                        </p>
                                    )
                                }
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handlePlayAudio}
                        disabled={isPlaying}
                        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-4 py-2 rounded-lg font-semibold text-sm transition-all active:scale-95 flex items-center gap-2 shrink-0"
                    >
                        <span>{isPlaying ? "再生中..." : "再生"}</span>
                        <i className={`fa-regular fa-circle-play ${isPlaying ? 'animate-spin' : ''}`}></i>
                    </button>
                </div>

                {/* Description/Summary */}
                <div className="py-2">
                    <p className="news-desc">
                        {getHatenaNewsDescription(newsItem) || "ニュース詳細"}
                    </p>
                </div>

                {/* tags */}
                {visibleTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {visibleTags.slice(0, 4).map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white-soft"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Source link */}
                {newsItem.link && (
                    <div className="pt-4">
                        <a
                            href={newsItem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline"
                        >
                            詳細を読む →
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}
