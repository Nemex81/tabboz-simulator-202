import { useEffect, useRef } from 'react'
import type { ComponentProps } from 'react'
import { House, MapPin, MapTrifold, IdentificationCard, UserGear } from '@phosphor-icons/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CharacterSheet } from '@/components/CharacterSheet'
import { CityTab } from '@/components/tabs/CityTab'
import { StatusTab } from '@/components/tabs/StatusTab'
import { DashboardTab } from '@/components/tabs/DashboardTab'
import { LocationTab } from '@/components/tabs/LocationTab'
import { announce } from '@/lib/a11y-announce'
import type { DayPhase } from '@/lib/types'

const TAB_ANNOUNCE_MESSAGES: Record<string, string> = {
  home: 'Sommario rapido aperto',
  location: 'Pannello luogo attuale aperto',
  city: 'Mappa della città aperta',
  character: 'Scheda personaggio aperta',
  status: 'Impostazioni aperte',
}

interface MainGameTabsProps {
  activeTab: string
  onValueChange: (value: string) => void
  currentPhase: DayPhase | null | undefined
  statusTab: ComponentProps<typeof StatusTab>
  characterTab: ComponentProps<typeof CharacterSheet>
  cityTab: ComponentProps<typeof CityTab>
  dashboardTabProps: ComponentProps<typeof DashboardTab>
  locationTabProps: ComponentProps<typeof LocationTab>
}

export function MainGameTabs({
  activeTab,
  onValueChange,
  currentPhase,
  statusTab,
  characterTab,
  cityTab,
  dashboardTabProps,
  locationTabProps,
}: MainGameTabsProps) {
  const previousTabRef = useRef(activeTab)
  const pendingFocusTargetRef = useRef<string | null>(null)

  const markConfirmedTabChange = (targetTab: string) => {
    pendingFocusTargetRef.current = targetTab
  }

  const handleTriggerKeyDown = (targetTab: string, event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      markConfirmedTabChange(targetTab)
    }
  }

  // Tutti i tab sono sempre disponibili, tranne che in base alle specifiche restrizioni orarie se applicabili.
  // Home, Personaggio e Impostazioni sono sempre attivi.
  const isCityAvailable = currentPhase !== 'notte'
  const isLocationAvailable = true

  // Redirect se il tab diventa improvvisamente non disponibile
  useEffect(() => {
    if (currentPhase == null) return
    if (activeTab === 'city' && !isCityAvailable) {
      onValueChange('home')
    }
  }, [activeTab, currentPhase, isCityAvailable, onValueChange])

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
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        onValueChange(value)
        const message = TAB_ANNOUNCE_MESSAGES[value]
        if (message) announce(message)
      }}
      className="w-full"
    >
      <nav aria-label="Menu principale di gioco">
        <TabsList 
          aria-label="Menu principale di gioco" 
          className="flex w-full items-center justify-start gap-2 p-1 h-auto overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth
                     bg-muted/50 border-b border-border md:relative md:flex-row md:bg-muted/50 md:border-b-0
                     fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border p-2 justify-around"
        >
          {/* HOME */}
          <TabsTrigger
            value="home"
            aria-label="Home e sommario"
            onMouseDown={() => markConfirmedTabChange('home')}
            onKeyDown={(event) => handleTriggerKeyDown('home', event)}
            className="flex-1 min-w-[70px] md:min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <House size={20} className="md:mr-2" weight="fill" />
            <span className="hidden md:inline">Home</span>
          </TabsTrigger>

          {/* LUOGO */}
          <TabsTrigger
            value="location"
            disabled={!isLocationAvailable}
            aria-label="Luogo attuale"
            onMouseDown={() => markConfirmedTabChange('location')}
            onKeyDown={(event) => handleTriggerKeyDown('location', event)}
            className="flex-1 min-w-[70px] md:min-w-[120px] data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
          >
            <MapPin size={20} className="md:mr-2" weight="fill" />
            <span className="hidden md:inline">Luogo</span>
          </TabsTrigger>

          {/* CITTA */}
          <TabsTrigger
            value="city"
            disabled={!isCityAvailable}
            aria-label={!isCityAvailable ? 'Città: chiusa di notte' : 'Mappa città'}
            onMouseDown={() => markConfirmedTabChange('city')}
            onKeyDown={(event) => handleTriggerKeyDown('city', event)}
            className="flex-1 min-w-[70px] md:min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <MapTrifold size={20} className="md:mr-2" weight="fill" />
            <span className="hidden md:inline">Città</span>
          </TabsTrigger>

          {/* PERSONAGGIO */}
          <TabsTrigger
            value="character"
            aria-label="Personaggio e Social"
            onMouseDown={() => markConfirmedTabChange('character')}
            onKeyDown={(event) => handleTriggerKeyDown('character', event)}
            className="flex-1 min-w-[70px] md:min-w-[120px] data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            <IdentificationCard size={20} className="md:mr-2" weight="fill" />
            <span className="hidden md:inline">Personaggio</span>
          </TabsTrigger>

          {/* IMPOSTAZIONI */}
          <TabsTrigger
            value="status"
            aria-label="Impostazioni"
            onMouseDown={() => markConfirmedTabChange('status')}
            onKeyDown={(event) => handleTriggerKeyDown('status', event)}
            className="flex-1 min-w-[70px] md:min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <UserGear size={20} className="md:mr-2" weight="fill" />
            <span className="hidden md:inline">Impostazioni</span>
          </TabsTrigger>
        </TabsList>
      </nav>

      <TabsContent value="home" className="space-y-6 mt-6 focus-visible:outline-none" tabIndex={-1} data-main-tab-panel="home">
        <DashboardTab {...dashboardTabProps} />
      </TabsContent>

      <TabsContent value="location" className="space-y-6 mt-6 focus-visible:outline-none" tabIndex={-1} data-main-tab-panel="location">
        <LocationTab {...locationTabProps} />
      </TabsContent>

      <TabsContent value="city" className="space-y-6 mt-6 focus-visible:outline-none" tabIndex={-1} data-main-tab-panel="city">
        <CityTab {...cityTab} />
      </TabsContent>

      <TabsContent value="character" className="focus-visible:outline-none" tabIndex={-1} data-main-tab-panel="character">
        <CharacterSheet {...characterTab} />
      </TabsContent>

      <TabsContent value="status" className="space-y-6 mt-6 focus-visible:outline-none" tabIndex={-1} data-main-tab-panel="status">
        <StatusTab {...statusTab} />
      </TabsContent>
    </Tabs>
  )
}