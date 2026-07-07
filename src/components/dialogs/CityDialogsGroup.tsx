import { JobSelectionDialog } from '@/components/JobSelectionDialog'
import { MetallariDialog } from '@/components/dialogs/MetallariDialog'
import { PoliceDialog } from '@/components/dialogs/PoliceDialog'
import { StreetRaceDialog } from '@/components/dialogs/StreetRaceDialog'
import type { CityDialogsProps } from '@/components/dialogs/game-dialogs.types'

interface CityDialogsGroupProps {
  city: CityDialogsProps
}

export function CityDialogsGroup({ city }: CityDialogsGroupProps) {
  return (
    <>
      <MetallariDialog
        open={city.showMetallariEvent}
        onOpenChange={city.setShowMetallariEvent}
        currentEvent={city.currentEvent}
        onScappa={city.handleMetallariScappa}
        onCombatti={city.handleMetallariCombatti}
      />
      <PoliceDialog
        open={city.showPoliceEvent}
        onOpenChange={city.setShowPoliceEvent}
        currentEvent={city.currentEvent}
        playerSoldi={city.playerStats.soldi}
        bribeCost={city.policeBribeCost}
        hasMotorino={city.playerStats.hasMotorino}
        onScappa={city.handlePoliceScappa}
        onMazzetta={city.handlePoliceMazzetta}
        onCarisma={city.handlePoliceCarisma}
        onCollabora={city.handlePoliceCollabora}
      />
      <StreetRaceDialog
        open={city.showStreetRaceEvent}
        onOpenChange={city.setShowStreetRaceEvent}
        raceWinChance={city.raceWinChance}
        onRifiuta={city.handleStreetRaceRifiuta}
        onAccetta={city.handleStreetRaceAccetta}
        betInfo={city.betInfo ?? undefined}
      />
      {city.showJobSelectionDialog && (
        <JobSelectionDialog
          open={city.showJobSelectionDialog}
          onOpenChange={city.setShowJobSelectionDialog}
          availableJobs={city.availableJobsForDialog}
          stats={city.playerStats}
          schoolYear={city.playerSchoolYear}
          onSelectJob={city.onSelectJob}
        />
      )}
    </>
  )
}