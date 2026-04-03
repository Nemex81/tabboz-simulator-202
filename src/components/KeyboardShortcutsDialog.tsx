import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Keyboard, X } from '@phosphor-icons/react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const shortcuts = [
    { category: 'Miglioramento Fisico', shortcuts: [
      { keys: 'Ctrl + 1', action: 'Palestra' },
      { keys: 'Ctrl + 2', action: 'Lampada abbronzante' },
      { keys: 'Ctrl + 4', action: 'Trucca motorino' }
    ]},
    { category: 'Scuola', shortcuts: [
      { keys: 'Ctrl + 5', action: 'Studia' },
      { keys: 'Ctrl + 6', action: 'Corrompi professore' },
      { keys: 'Ctrl + 7', action: 'Minaccia professore' }
    ]},
    { category: 'Vita Sociale', shortcuts: [
      { keys: 'Ctrl + 9', action: 'Prova a rimorchiare' },
      { keys: 'Ctrl + D', action: 'Vai in discoteca' },
      { keys: 'Ctrl + C', action: 'Vai al cinema' },
      { keys: 'Ctrl + S', action: 'Vai allo shopping' }
    ]},
    { category: 'Lavoro & Riposo', shortcuts: [
      { keys: 'Ctrl + 3', action: 'Lavora da buttadifuori' },
      { keys: 'Ctrl + 8', action: 'Riposa' }
    ]},
    { category: 'Generale', shortcuts: [
      { keys: 'Ctrl + R', action: 'Reset gioco' },
      { keys: 'Alt + H', action: 'Mostra questo aiuto' }
    ]}
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-2 border-primary max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary flex items-center gap-2">
            <Keyboard size={32} weight="fill" />
            SCORCIATOIE DA TASTIERA
          </DialogTitle>
          <DialogDescription>
            Usa queste combinazioni per giocare più velocemente!
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[50vh] pr-4">
          <div className="space-y-6">
            {shortcuts.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-lg font-bold text-accent border-b border-border pb-2">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.shortcuts.map((shortcut, sidx) => (
                    <div key={sidx} className="flex items-center justify-between p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors">
                      <span className="text-sm text-foreground">{shortcut.action}</span>
                      <kbd className="px-3 py-1 bg-card border-2 border-primary rounded text-primary font-bold text-sm">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-border">
          <div className="bg-accent/10 border border-accent rounded-lg p-3 mb-3">
            <p className="text-xs text-muted-foreground">
              <strong className="text-accent">💡 SUGGERIMENTO:</strong> Le scorciatoie funzionano solo quando NON sei in un dialogo di evento.
              Premi <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Alt + H</kbd> in qualsiasi momento per aprire questo aiuto!
            </p>
          </div>
          
          <Button 
            onClick={() => onOpenChange(false)} 
            className="w-full"
            variant="default"
          >
            <X size={20} className="mr-2" />
            Chiudi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
