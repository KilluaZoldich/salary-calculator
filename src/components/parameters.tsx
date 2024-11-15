import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings2, Euro, ChevronUp, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ParametersProps {
  parameters: {
    stipendioBase: string;
    indennitaGuida: string;
    extraMensa: string;
    ff: string;
    ffCena: string;
    reperibilitaFeriale: string;
    reperibilitaSabato: string;
    reperibilitaFestivo: string;
  };
  setParameters: (params: any) => void;
}

export function Parameters({ parameters, setParameters }: ParametersProps) {
  const [showSettings, setShowSettings] = useState(true);

  const handleParameterChange = (key: keyof typeof parameters, value: string) => {
    setParameters({ ...parameters, [key]: value });
  };

  return (
    <Card className="modern-card hover-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Settings2 className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-primary">Parametri Base</span>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1 sm:gap-2 hover:bg-secondary/50 rounded-xl text-xs sm:text-sm"
        >
          {showSettings ? <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />}
          {showSettings ? 'Nascondi' : 'Mostra'}
        </Button>
      </CardHeader>
      <AnimatePresence initial={false}>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm">Stipendio Base</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={parameters.stipendioBase}
                    onChange={(e) => handleParameterChange('stipendioBase', e.target.value)}
                    className="pl-8 modern-input"
                  />
                  <Euro className="absolute left-2 top-2.5 h-4 w-4 text-primary" />
                </div>
              </div>
              {[
                { label: 'Indennità Guida', key: 'indennitaGuida' as const },
                { label: 'Extra Mensa', key: 'extraMensa' as const },
                { label: 'FF', key: 'ff' as const },
                { label: 'FF Cena', key: 'ffCena' as const },
                { label: 'Reperibilità Feriale', key: 'reperibilitaFeriale' as const },
                { label: 'Reperibilità Sabato', key: 'reperibilitaSabato' as const },
                { label: 'Reperibilità Festivo', key: 'reperibilitaFestivo' as const }
              ].map(({ label, key }) => (
                <div key={key} className="space-y-2">
                  <Label className="text-muted-foreground text-sm">{label}</Label>
                  <Input
                    type="number"
                    value={parameters[key]}
                    onChange={(e) => handleParameterChange(key, e.target.value)}
                    className="modern-input"
                  />
                </div>
              ))}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
