import { memo } from 'react'
import type { GameDialogsProps } from '@/components/dialogs/game-dialogs.types'
import { CityDialogsGroup } from '@/components/dialogs/CityDialogsGroup'
import { SchoolDialogsGroup } from '@/components/dialogs/SchoolDialogsGroup'
import { SocialDialogsGroup } from '@/components/dialogs/SocialDialogsGroup'

export type { GameDialogsProps }

export const GameDialogs = memo(function GameDialogs({ school, city, social }: GameDialogsProps) {
  return (
    <>
      <SchoolDialogsGroup school={school} />
      <CityDialogsGroup city={city} />
      <SocialDialogsGroup social={social} currentEvent={city.currentEvent} />
    </>
  )
})
