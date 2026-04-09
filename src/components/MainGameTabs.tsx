import type { ComponentProps } from 'react'
import { Buildings, ChartBar, Chats, GraduationCap, IdentificationCard } from '@phosphor-icons/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CharacterSheet } from '@/components/CharacterSheet'
import { CityTab } from '@/components/tabs/CityTab'
import { SchoolTab } from '@/components/tabs/SchoolTab'
import { SocialTab } from '@/components/tabs/SocialTab'
import { StatusTab } from '@/components/tabs/StatusTab'

interface MainGameTabsProps {
  activeTab: string
  onValueChange: (value: string) => void
  statusTab: ComponentProps<typeof StatusTab>
  schoolTab: ComponentProps<typeof SchoolTab>
  characterTab: ComponentProps<typeof CharacterSheet>
  socialTab: ComponentProps<typeof SocialTab>
  cityTab: ComponentProps<typeof CityTab>
}

export function MainGameTabs({
  activeTab,
  onValueChange,
  statusTab,
  schoolTab,
  characterTab,
  socialTab,
  cityTab,
}: MainGameTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onValueChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 gap-2 bg-muted/50 p-1 h-auto">
        <TabsTrigger value="school" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
          <GraduationCap size={20} className="mr-2" weight="fill" />
          <span className="hidden sm:inline">Scuola</span>
          <span className="sm:hidden">Scuola</span>
        </TabsTrigger>
        <TabsTrigger value="city" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Buildings size={20} className="mr-2" weight="fill" />
          <span className="hidden sm:inline">Città</span>
          <span className="sm:hidden">Roma</span>
        </TabsTrigger>
        <TabsTrigger value="character" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
          <IdentificationCard size={20} className="mr-2" weight="fill" />
          <span className="hidden sm:inline">Personaggio</span>
          <span className="sm:hidden">👤</span>
        </TabsTrigger>
        <TabsTrigger value="social" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
          <Chats size={20} className="mr-2" weight="fill" />
          <span className="hidden sm:inline">Attività</span>
          <span className="sm:hidden">Attività</span>
        </TabsTrigger>
        <TabsTrigger value="status" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <ChartBar size={20} className="mr-2" weight="fill" />
          <span className="hidden sm:inline">Controllo</span>
          <span className="sm:hidden">⚙️</span>
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