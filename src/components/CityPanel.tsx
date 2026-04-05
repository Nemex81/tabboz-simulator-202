import React from 'react'
import { 
import { 
  MusicNotes, 
  Briefcase
import
interface Ci
  onCinema
  Briefcase
} from '@phosphor-icons/react'
import { ActionButton } from '@/components/ActionButton'

interface CityPanelProps {
  onDisco: () => void
  onCinema: () => void
  onShopping: () => void
  actionsRemaining,
  muscoli,
}: CityPanelProps) {
    <div className="space-
        <div cl
            <Buil
          </div>
 


        <C
           
          </h
            <
            
           
  actionsRemaining,
  soldi,
  muscoli,
  stanchezza
}: CityPanelProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6 border-2 border-primary bg-card">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Buildings size={48} weight="fill" className="text-primary" />
            <h2 className="text-3xl font-bold text-primary">ROMA, ITALIA</h2>
              on
              blockedReason={
                  ? 'Nessuna azione per questa fascia oraria'
              
            />
          <di


          <h3 className="text-xl font-bold mb-4 text-secondar
            LAVORO & MIGLIORAMENTO
          <div className="space-y-3">
              icon={<Barbell siz
              s
              disabled={actionsRemain
                actionsRe
                  : 'Sei troppo stanco per al
              ariaLabel="Vai in
            <ActionButton
              label="Lampada"
              onClick={onLampada}
              blockedReason={
                  ? 'Nessuna azione p
              }
            />
              i
              shortcut="Ctrl+3"
              
                actionsRe
                  : 'Servono almeno 40 Muscol
              ariaLabel="Lav
          </div>
            <p className="font-s
            <p className="mt-2 text-secondary font-semibold"
        </Card>

        <h3 className="text-lg font-bold mb-3 text-foreground
          Luoghi di Roma
        <div cl
            <div className="font-bold text-accent">🎵 Discoteca</div>
          </di
            <div classNam
          </div>
            <div className="font-bold te
          </div>
            <div className="font-b
          </div>
            <div className="f
          </div>
            <div className="font-bold text-secondary">🏢 Loca
          </div>
      </Card>
  )











































              onClick={onLavoro}

              blockedReason={



              }

            />



            <p>• Muscoli ≥ 40</p>


        </Card>



        <h3 className="text-lg font-bold mb-3 text-foreground flex items-center gap-2">


        </h3>



            <div className="text-xs text-muted-foreground">Via del Corso</div>

          <div className="p-3 bg-muted/30 rounded">



          <div className="p-3 bg-muted/30 rounded">





            <div className="text-xs text-muted-foreground">Quartiere Prati</div>






            <div className="font-bold text-secondary">🏢 Locale Notturno</div>
            <div className="text-xs text-muted-foreground">Testaccio</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
