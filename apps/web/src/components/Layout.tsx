import { type ReactNode } from 'react'
import NavBar from './NavBar'
import AchievementToast from './AchievementToast'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <NavBar />
      <AchievementToast />
      <main className="page">
        {children}
      </main>
    </div>
  )
}
