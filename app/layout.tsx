// layout.tsx

import '../app/globals.css'
import type { Metadata } from 'next'
import { Zen_Maru_Gothic } from 'next/font/google'
import { Providers } from './provider'
import { VoicePlayerProvider } from '@/app/context/VoicePlayerContext'

// const zenMaru = Zen_Maru_Gothic({
//   subsets: ['latin'],
//   weight: ['400', '500'],
//   variable: '--font-zen-maru'
// })

export const metadata: Metadata = {
  title: 'Nemura',
  description: '今日の世界を、Nemuraとともに。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css"
        />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/iconsax-react@0.0.8/dist/cjs/index.min.js" />
      </head>
      <body>
        <Providers>
          <VoicePlayerProvider>
            {children}
          </VoicePlayerProvider>
        </Providers>
      </body>
    </html>
  )
}