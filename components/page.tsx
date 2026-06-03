'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Background from '@/components/Background'
import HeadPhones from '@/assets/graphics/headphones.svg'

export default function AudioLoading() {
  const router = useRouter()
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const startAudio = async () => {
      // 擬似バック処理（3秒待機）
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // フェードアウト開始
      setFadeOut(true)

      // フェードアウトが終わるまで少し待ってから遷移
      setTimeout(() => router.push('/home'), 500)
    }
    startAudio()
  }, [router])

  return (
    <Background variant="night">
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center text-white-soft transition-opacity duration-500 ${
          fadeOut ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* ヘッドフォン */}
        <div className="relative w-50 h-50 md:w-20 md:h-20 animate-bounceSlow">
          <HeadPhones className="w-full h-full" />
        </div>

        {/* Loading テキスト＋ドット */}
        <div className="mt-6 text-center space-y-4 flex flex-col items-center">
          <span className="text-[26px] tracking-tight">Loading</span>
          <div className="flex gap-2">
            <span className="w-2 h-2 rounded-full bg-white-soft animate-dot1"></span>
            <span className="w-2 h-2 rounded-full bg-white-soft animate-dot2"></span>
            <span className="w-2 h-2 rounded-full bg-white-soft animate-dot3"></span>
          </div>
        </div>
      </div>
    </Background>
  )
}