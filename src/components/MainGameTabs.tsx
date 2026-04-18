import { useEffect, useRef } from 'react'
import type { ComponentProps } from 'react'
import { Buildings, ChartBar, Chats, GraduationCap, IdentificationCard } from '@phosphor-icons/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CharacterSheet } from '@/components/CharacterSheet'
import { CityTab } from '@/components/tabs/CityTab'
import { SchoolTab } from '@/components/tabs/SchoolTab'
import { SocialTab } from '@/components/tabs/SocialTab'
import { StatusTab } from '@/components/tabs/StatusTab'
import type { DayPhase } from '@/lib/types'

interface MainGameTabsProps {
  activeTab: string
  onValueChange: (value: string) => void
  currentPhase: DayPhase | null | undefined
  statusTab: ComponentProps<typeof StatusTab>
  schoolTab: ComponentProps<typeof SchoolTab>
  characterTab: ComponentProps<typeof CharacterSheet>
  socialTab: ComponentProps<typeof SocialTab>
  cityTab: ComponentProps<typeof CityTab>
}

export function MainGameTabs({
  activeTab,
  onValueChange,
  currentPhase,
  statusTab,
  schoolTab,
  characterTab,
  socialTab,
  cityTab,
}: MainGameTabsProps) {
  const previousTabRef = useRef(activeTab)
  const pendingFocusTargetRef = useRef<string | null>(null)
  const isSkippedSchoolMorning = currentPhase === 'mattina' && schoolTab.marinatoOggi

  const markConfirmedTabChange = (targetTab: string) => {
    pendingFocusTargetRef.current = targetTab
  }

  const handleTriggerKeyDown = (targetTab: string, event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      markConfirmedTabChange(targetTab)
    }
  }

  // DayPhase reale: 'mattina' | 'pomeriggio' | 'sera' | 'notte'
  const isSchoolAvailable = currentPhase === 'mattina'
  const isCityAvailable = isSkippedSchoolMorning || currentPhase === 'pomeriggio' || currentPhase === 'sera'
  const isSocialAvailable =
    isSkippedSchoolMorning ||
    currentPhase === 'pomeriggio' ||
    currentPhase === 'sera' ||
    currentPhase === 'notte'
  // character e status sempre disponibili

  // Redirect automatico se il tab attivo diventa non disponibile
  useEffect(() => {
    if (currentPhase == null) return
    if (activeTab === 'school' && !isSchoolAvailable) {
      onValueChange(isSocialAvailable ? 'social' : 'status')
    } else if (activeTab === 'city' && !isCityAvailable) {
      onValueChange(isSchoolAvailable ? 'school' : isSocialAvailable ? 'social' : 'status')
    } else if (activeTab === 'social' && !isSocialAvailable) {
      onValueChange(isSchoolAvailable ? 'school' : 'status')
    }
  }, [activeTab, currentPhase, isSchoolAvailable, isCityAvailable, isSocialAvailable, onValueChange])

  useEffect(() => {
    if (previousTabRef.current === activeTab) return
    previousTabRef.current = activeTab

    if (pendingFocusTargetRef.current !== activeTab) return
    pendingFocusTargetRef.current = null

    requestAnimationFrame(() => {
      const activePanel = document.querySelector(`[data-main-tab-panel="${activeTab}"]`) as HTMLElement | null
      activePanel?.focus()
    })
  }, [activeTab])

  return (
    <Tabs value={activeTab} onValueChange={onValueChange} className="w-full">
      <nav aria-label="Menu principale di gioco">
        <TabsList aria-label="Menu principale di gioco" className="grid w-full grid-cols-3 md:grid-cols-5 gap-2 bg-muted/50 p-1 h-auto">
          <TabsTrigger
            value="school"
            disabled={!isSchoolAvailable}
            aria-label={!isSchoolAvailable ? 'Scuola: disponibile solo al mattino' : 'Scuola'}
            onMouseDown={() => markConfirmedTabChange('school')}
            onKeyDown={(event) => handleTriggerKeyDown('school', event)}
            className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
          >
            <GraduationCap size={20} className="mr-2" weight="fill" />
            <span className="hidden sm:inline" aria-hidden="true">Scuola</span>
            <span className="sm:hidden" aria-hidden="true">Scuola</span>
          </TabsTrigger>
          <TabsTrigger
            value="city"
            disabled={!isCityAvailable}
            aria-label={!isCityAvailable ? 'Città: disponibile dal pomeriggio o se salti la scuola' : 'Città'}
            onMouseDown={() => markConfirmedTabChange('city')}
            onKeyDown={(event) => handleTriggerKeyDown('city', event)}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Buildings size={20} className="mr-2" weight="fill" />
            <span className="hidden sm:inline" aria-hidden="true">Città</span>
            <span className="sm:hidden" aria-hidden="true">Roma</span>
          </TabsTrigger>
          <TabsTrigger
            value="character"
            aria-label="Personaggio"
            onMouseDown={() => markConfirmedTabChange('character')}
            onKeyDown={(event) => handleTriggerKeyDown('character', event)}
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            <IdentificationCard size={20} className="mr-2" weight="fill" aria-hidden="true" />
            <span className="hidden sm:inline" aria-hidden="true">Personaggio</span>
            <span className="sm:hidden" aria-hidden="true">👤</span>
          </TabsTrigger>
          <TabsTrigger
            value="social"
            disabled={!isSocialAvailable}
            aria-label={!isSocialAvailable ? 'Azioni: non disponibili di mattina prima della scelta scuola o se vai a lezione' : 'Azioni'}
            onMouseDown={() => markConfirmedTabChange('social')}
            onKeyDown={(event) => handleTriggerKeyDown('social', event)}
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            <Chats size={20} className="mr-2" weight="fill" />
            <span className="hidden sm:inline" aria-hidden="true">Azioni</span>
            <span className="sm:hidden" aria-hidden="true">Azioni</span>
          </TabsTrigger>
          <TabsTrigger
            value="status"
            aria-label="Impostazioni"
            onMouseDown={() => markConfirmedTabChange('status')}
            onKeyDown={(event) => handleTriggerKeyDown('status', event)}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <ChartBar size={20} className="mr-2" weight="fill" aria-hidden="true" />
            <span className="hidden sm:inline" aria-hidden="true">Impostazioni</span>
            <span className="sm:hidden" aria-hidden="true">⚙️</span>
          </TabsTrigger>
        </TabsList>
      </nav>

      <TabsContent value="status" className="space-y-6 mt-6" tabIndex={-1} data-main-tab-panel="status">
        <StatusTab {...statusTab} />
      </TabsContent>

      <TabsContent value="school" className="space-y-6 mt-6" tabIndex={-1} data-main-tab-panel="school">
        <SchoolTab {...schoolTab} />
      </TabsContent>

      <TabsContent value="character" tabIndex={-1} data-main-tab-panel="character">
        <CharacterSheet {...characterTab} />
      </TabsContent>

      <TabsContent value="social" className="space-y-6 mt-6" tabIndex={-1} data-main-tab-panel="social">
        <SocialTab {...socialTab} />
      </TabsContent>

      <TabsContent value="city" className="space-y-6 mt-6" tabIndex={-1} data-main-tab-panel="city">
        <CityTab {...cityTab} />
      </TabsContent>
    </Tabs>
  )
}