import { useEffect } from 'react'
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
  // DayPhase reale: 'mattina' | 'pomeriggio' | 'sera' | 'notte'
  const isSchoolAvailable = currentPhase === 'mattina'
  const isCityAvailable = currentPhase === 'pomeriggio' || currentPhase === 'sera'
  const isSocialAvailable =
    currentPhase === 'pomeriggio' ||
    currentPhase === 'sera' ||
    currentPhase === 'notte'
  // character e status sempre disponibili

  // Redirect automatico se il tab attivo diventa non disponibile
  useEffect(() => {
    if (currentPhase == null) return
    if (activeTab === 'school' && !isSchoolAvailable) {
      onValueChange('social')
    } else if (activeTab === 'city' && !isCityAvailable) {
      onValueChange('social')
    }
  }, [activeTab, currentPhase, isSchoolAvailable, isCityAvailable, onValueChange])

  return (
    <Tabs value={activeTab} onValueChange={onValueChange} className="w-full">
      <TabsList aria-label="Menu principale di gioco" className="grid w-full grid-cols-3 md:grid-cols-5 gap-2 bg-muted/50 p-1 h-auto">
        <TabsTrigger
          value="school"
          disabled={!isSchoolAvailable}
          aria-label={!isSchoolAvailable ? 'Scuola: disponibile solo al mattino' : 'Scuola'}
          className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
        >
          <GraduationCap size={20} className="mr-2" weight="fill" />
          <span className="hidden sm:inline" aria-hidden="true">Scuola</span>
          <span className="sm:hidden" aria-hidden="true">Scuola</span>
        </TabsTrigger>
        <TabsTrigger
          value="city"
          disabled={!isCityAvailable}
          aria-label={!isCityAvailable ? 'Città: disponibile dal pomeriggio' : 'Città'}
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Buildings size={20} className="mr-2" weight="fill" />
          <span className="hidden sm:inline" aria-hidden="true">Città</span>
          <span className="sm:hidden" aria-hidden="true">Roma</span>
        </TabsTrigger>
        <TabsTrigger
          value="character"
          aria-label="Personaggio"
          className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
        >
          <IdentificationCard size={20} className="mr-2" weight="fill" aria-hidden="true" />
          <span className="hidden sm:inline" aria-hidden="true">Personaggio</span>
          <span className="sm:hidden" aria-hidden="true">👤</span>
        </TabsTrigger>
        <TabsTrigger
          value="social"
          disabled={!isSocialAvailable}
          aria-label={!isSocialAvailable ? 'Azioni: non disponibili di mattina' : 'Azioni'}
          className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
        >
          <Chats size={20} className="mr-2" weight="fill" />
          <span className="hidden sm:inline" aria-hidden="true">Azioni</span>
          <span className="sm:hidden" aria-hidden="true">Azioni</span>
        </TabsTrigger>
        <TabsTrigger
          value="status"
          aria-label="Impostazioni"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <ChartBar size={20} className="mr-2" weight="fill" aria-hidden="true" />
          <span className="hidden sm:inline" aria-hidden="true">Impostazioni</span>
          <span className="sm:hidden" aria-hidden="true">⚙️</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="status" className="space-y-6 mt-6">
        <StatusTab {...statusTab} />
      </TabsContent>

      <TabsContent value="school" className="space-y-6 mt-6">
        <SchoolTab {...schoolTab} />
      </TabsContent>

      <TabsContent value="character">
        <CharacterSheet {...characterTab} />
      </TabsContent>

      <TabsContent value="social" className="space-y-6 mt-6">
        <SocialTab {...socialTab} />
      </TabsContent>

      <TabsContent value="city" className="space-y-6 mt-6">
        <CityTab {...cityTab} />
      </TabsContent>
    </Tabs>
  )
}