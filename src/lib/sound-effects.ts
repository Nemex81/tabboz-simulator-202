type AudioContextType = AudioContext | null

let audioContext: AudioContextType = null

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

export const playSound = {
  statIncrease: () => {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.frequency.setValueAtTime(400, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15)
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.15)
  },
  
  statDecrease: () => {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.frequency.setValueAtTime(600, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2)
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)
  },
  
  bigWin: () => {
    const ctx = getAudioContext()
    
    const playNote = (freq: number, delay: number, duration: number) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + delay)
      oscillator.type = 'square'
      
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime + delay)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration)
      
      oscillator.start(ctx.currentTime + delay)
      oscillator.stop(ctx.currentTime + delay + duration)
    }
    
    playNote(523.25, 0, 0.15)
    playNote(659.25, 0.1, 0.15)
    playNote(783.99, 0.2, 0.25)
  },
  
  bigLoss: () => {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.frequency.setValueAtTime(400, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4)
    oscillator.type = 'sawtooth'
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.4)
  },
  
  moneySpent: () => {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.frequency.setValueAtTime(800, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1)
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.1)
  },
  
  moneyEarned: () => {
    const ctx = getAudioContext()
    
    const playNote = (freq: number, delay: number) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + delay)
      oscillator.type = 'triangle'
      
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime + delay)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.1)
      
      oscillator.start(ctx.currentTime + delay)
      oscillator.stop(ctx.currentTime + delay + 0.1)
    }
    
    playNote(800, 0)
    playNote(1000, 0.05)
  },
  
  eventTrigger: () => {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.frequency.setValueAtTime(300, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1)
    oscillator.type = 'square'
    
    gainNode.gain.setValueAtTime(0.25, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)
  },
  
  dangerAlert: () => {
    const ctx = getAudioContext()
    
    const beep = (delay: number) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.frequency.setValueAtTime(880, ctx.currentTime + delay)
      oscillator.type = 'square'
      
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime + delay)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.08)
      
      oscillator.start(ctx.currentTime + delay)
      oscillator.stop(ctx.currentTime + delay + 0.08)
    }
    
    beep(0)
    beep(0.12)
  },
  
  success: () => {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.frequency.setValueAtTime(600, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.15)
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.15)
  },
  
  failure: () => {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.frequency.setValueAtTime(300, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3)
    oscillator.type = 'sawtooth'
    
    gainNode.gain.setValueAtTime(0.25, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  },
  
  reputationUp: () => {
    const ctx = getAudioContext()
    
    const playChord = (freqs: number[], delay: number, duration: number) => {
      freqs.forEach(freq => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)
        
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + delay)
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime + delay)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration)
        
        oscillator.start(ctx.currentTime + delay)
        oscillator.stop(ctx.currentTime + delay + duration)
      })
    }
    
    playChord([523.25, 659.25, 783.99], 0, 0.3)
  },
  
  gameOver: () => {
    const ctx = getAudioContext()
    
    const playNote = (freq: number, delay: number, duration: number) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + delay)
      oscillator.type = 'triangle'
      
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime + delay)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration)
      
      oscillator.start(ctx.currentTime + delay)
      oscillator.stop(ctx.currentTime + delay + duration)
    }
    
    playNote(400, 0, 0.25)
    playNote(350, 0.2, 0.25)
    playNote(300, 0.4, 0.4)
  },
  
  buttonClick: () => {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.frequency.setValueAtTime(800, ctx.currentTime)
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.05)
  },
  
  reset: () => {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.frequency.setValueAtTime(600, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3)
    oscillator.type = 'sawtooth'
    
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime + 0.3)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.35)
  },
  
  motorinoRev: () => {
    const ctx = getAudioContext()
    const playRev = (startTime: number, duration: number, baseFreq: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(baseFreq, startTime)
      osc.frequency.linearRampToValueAtTime(baseFreq * 2.8, startTime + duration * 0.4)
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, startTime + duration)
      gain.gain.setValueAtTime(0.15, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
      osc.start(startTime)
      osc.stop(startTime + duration)
    }
    playRev(ctx.currentTime, 0.25, 80)
    playRev(ctx.currentTime + 0.3, 0.45, 85)
  }
}
