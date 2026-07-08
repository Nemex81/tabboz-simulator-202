import { useMemo } from 'react'
import type { ComponentProps } from 'react'
import { StatusTab } from '@/components/tabs/StatusTab'
import type { CityDialogsProps, SchoolDialogsProps, SocialDialogsProps } from '@/components/dialogs/game-dialogs.types'
import type { ThemeVariant } from '@/lib/types'

interface UseAppViewModelsParams {
  currentTheme: ThemeVariant | null | undefined
  handleThemeChange: ComponentProps<typeof StatusTab>['onThemeChange']
  schoolYear: number
  playerProfile: ComponentProps<typeof StatusTab>['playerProfile']
  schoolType: ComponentProps<typeof StatusTab>['schoolType']
  age: number
  onResetRequest: () => void
  schoolTabInput: any
  characterTabInput: any
  socialTabInput: any
  cityTabInput: any
  schoolDialogsInput: SchoolDialogsProps
  cityDialogsInput: CityDialogsProps
  socialDialogsInput: SocialDialogsProps
}

export function useAppViewModels({
  currentTheme,
  handleThemeChange,
  schoolYear,
  playerProfile,
  schoolType,
  age,
  onResetRequest,
  schoolTabInput,
  characterTabInput,
  socialTabInput,
  cityTabInput,
  schoolDialogsInput,
  cityDialogsInput,
  socialDialogsInput,
}: UseAppViewModelsParams) {
  const statusTabProps: ComponentProps<typeof StatusTab> = {
    currentTheme: (currentTheme ?? 'default') as ThemeVariant,
    onThemeChange: handleThemeChange,
    schoolYear,
    playerProfile,
    schoolType,
    age,
    onResetRequest,
  }

  const schoolDialogProps = useMemo(() => schoolDialogsInput, [schoolDialogsInput])
  const cityDialogProps = useMemo(() => cityDialogsInput, [cityDialogsInput])
  const socialDialogProps = useMemo(() => socialDialogsInput, [socialDialogsInput])

  return {
    statusTabProps,
    schoolTabProps: schoolTabInput,
    characterTabProps: characterTabInput,
    socialTabProps: socialTabInput,
    cityTabProps: cityTabInput,
    schoolDialogProps,
    cityDialogProps,
    socialDialogProps,
  }
}