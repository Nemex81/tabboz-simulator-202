import React from 'react'
import { Button } from '@/components/ui/but
import { Sun, Moon, Plant, Palette } from '@pho
interface ThemeSelectorProps {
  onThemeChange: (theme: ThemeVariant) => void

interface ThemeSelectorProps {
    label: string
  onThemeChange: (theme: ThemeVariant) => void
 

      icon: <Sun size={32} weight="fill" />
  const themes: Array<{
      label: 'Dark N
    label: string
    {
    icon: React.ReactNode
  }> = [
    {
      id: 'default',
      label: 'Default Neon Blu',
      description: 'Tema classico con tonalità blu/teal neon',
      icon: <Sun size={32} weight="fill" />
    },
    {
      id: 'dark',
      label: 'Dark Nero Viola',
      description: 'Tema scuro con accenti viola e rosa',
      icon: <Moon size={32} weight="fill" />
    },
    {
      id: 'green',
      label: 'Green Ganja Style',
              <div>
                  {theme.label}
     
   

          
              )}
          </button>
      </div>
  )





















                {theme.icon}
              </div>
              <div>
                <h4 className={`font-bold text-lg mb-1 ${currentTheme === theme.id ? 'text-primary' : 'text-foreground'}`}>
                  {theme.label}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {theme.description}
                </p>
              </div>
              {currentTheme === theme.id && (
                <div className="text-xs text-primary font-bold">
                  ✓ Attivo
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </Card>
  )
}
