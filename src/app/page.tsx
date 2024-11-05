'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ChevronDown, ChevronUp, Calculator, Clock, Eye, EyeOff } from 'lucide-react'

const days = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

type DayState = {
  presenza: boolean;
  guida: boolean;
  extraFF: string;
  reperibilita: boolean;
  ffCena: boolean;
  straordinarioDiurno: { ore: number; minuti: number };
  straordinarioNotturno: { ore: number; minuti: number };
  straordinarioFestivo: { ore: number; minuti: number };
  showDetails: boolean;
}

const initialDayState: DayState = {
  presenza: false,
  guida: false,
  extraFF: '0',
  reperibilita: false,
  ffCena: false,
  straordinarioDiurno: { ore: 0, minuti: 0 },
  straordinarioNotturno: { ore: 0, minuti: 0 },
  straordinarioFestivo: { ore: 0, minuti: 0 },
  showDetails: false,
}

export default function SalaryCalculator() {
  const [parameters, setParameters] = useState({
    stipendioBase: 0,
    indennitaGuida: 0,
    extraMensa: 0,
    ff: 0,
    ffCena: 0,
    reperibilitaFeriale: 0,
    reperibilitaSabato: 0,
    reperibilitaFestivo: 0,
  })

  const [weeks, setWeeks] = useState<DayState[][]>(() => 
    Array.from({ length: 4 }, () => 
      Array.from({ length: 7 }, () => ({ ...initialDayState }))
    )
  )

  const [showParameters, setShowParameters] = useState(false)
  const [totalSalary, setTotalSalary] = useState(0)

  useEffect(() => {
    const savedData = localStorage.getItem('salaryCalculatorData')
    if (savedData) {
      const { parameters: savedParameters, weeks: savedWeeks } = JSON.parse(savedData)
      setParameters(savedParameters)
      setWeeks(savedWeeks)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('salaryCalculatorData', JSON.stringify({ parameters, weeks }))
  }, [parameters, weeks])

  const handleParameterChange = (key: string, value: string) => {
    setParameters(prev => ({ ...prev, [key]: parseFloat(value) || 0 }))
  }

  const handleDayChange = (weekIndex: number, dayIndex: number, key: keyof DayState, value: boolean | string) => {
    setWeeks(prev => {
      const newWeeks = [...prev];
      newWeeks[weekIndex] = [...newWeeks[weekIndex]];
      newWeeks[weekIndex][dayIndex] = { ...newWeeks[weekIndex][dayIndex], [key]: value };
      return newWeeks;
    });
  };

  const handleStraordinarioChange = (weekIndex: number, dayIndex: number, type: keyof DayState, field: 'ore' | 'minuti', value: string) => {
    setWeeks(prev => {
      const newWeeks = [...prev]
      newWeeks[weekIndex] = [...newWeeks[weekIndex]]
      newWeeks[weekIndex][dayIndex] = {
        ...newWeeks[weekIndex][dayIndex],
        [type]: {
          ...newWeeks[weekIndex][dayIndex][type as keyof Pick<DayState, 'straordinarioDiurno' | 'straordinarioNotturno' | 'straordinarioFestivo'>],
          [field]: parseInt(value) || 0
        }
      }
      return newWeeks
    })
  }

  const toggleReperibilita = (weekIndex: number, dayIndex: number) => {
    handleDayChange(weekIndex, dayIndex, 'reperibilita', !weeks[weekIndex][dayIndex].reperibilita)
  }

  const toggleDayDetails = (weekIndex: number, dayIndex: number) => {
    handleDayChange(weekIndex, dayIndex, 'showDetails', !weeks[weekIndex][dayIndex].showDetails)
  }

  const calculateSalary = () => {
    let total = 0
    weeks.flat().forEach((day, index) => {
      if (day.presenza) total += parameters.stipendioBase * 7.6
      if (day.guida) total += parameters.indennitaGuida
      if (day.extraFF === 'extraMensa') total += parameters.extraMensa
      if (day.extraFF === 'ff') total += parameters.ff
      if (day.ffCena) total += parameters.ffCena
      if (day.reperibilita) {
        if (index % 7 === 5) total += parameters.reperibilitaSabato
        else if (index % 7 === 6) total += parameters.reperibilitaFestivo
        else total += parameters.reperibilitaFeriale
      }
      const straordinarioDiurno = day.straordinarioDiurno.ore + (day.straordinarioDiurno.minuti / 60)
      const straordinarioNotturno = day.straordinarioNotturno.ore + (day.straordinarioNotturno.minuti / 60)
      const straordinarioFestivo = day.straordinarioFestivo.ore + (day.straordinarioFestivo.minuti / 60)
      total += straordinarioDiurno * parameters.stipendioBase * 1.22
      total += straordinarioNotturno * parameters.stipendioBase * 1.5
      total += straordinarioFestivo * parameters.stipendioBase * 1.4
    })
    setTotalSalary(total)
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center text-primary">Calcolatrice Stipendio</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Parametri Base</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowParameters(!showParameters)}>
            {showParameters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardHeader>
        {showParameters && (
          <CardContent className="space-y-2">
            {Object.entries(parameters).map(([key, value]) => (
              <div key={key} className="grid grid-cols-2 items-center gap-2">
                <Label htmlFor={key}>{key}</Label>
                <Input
                  id={key}
                  type="number"
                  value={value}
                  onChange={(e) => handleParameterChange(key, e.target.value)}
                  className="w-full"
                />
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="1">
        <TabsList className="grid w-full grid-cols-4">
          {[1, 2, 3, 4].map((week) => (
            <TabsTrigger key={week} value={week.toString()}>Settimana {week}</TabsTrigger>
          ))}
        </TabsList>
        {weeks.map((week, weekIndex) => (
          <TabsContent key={weekIndex} value={(weekIndex + 1).toString()}>
            <Card>
              <CardHeader>
                <CardTitle>Settimana {weekIndex + 1}</CardTitle>
                <CardDescription>Inserisci i dettagli per ogni giorno</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {week.map((day, dayIndex) => (
                  <div key={dayIndex} className="space-y-2 border-b pb-2 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{days[dayIndex]}</span>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`presenza-${weekIndex}-${dayIndex}`}>Presenza</Label>
                        <Switch
                          id={`presenza-${weekIndex}-${dayIndex}`}
                          checked={day.presenza}
                          onCheckedChange={(checked) => handleDayChange(weekIndex, dayIndex, 'presenza', checked)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDayDetails(weekIndex, dayIndex)}
                        >
                          {day.showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    {day.presenza && day.showDetails && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`guida-${weekIndex}-${dayIndex}`}>Guida</Label>
                          <Switch
                            id={`guida-${weekIndex}-${dayIndex}`}
                            checked={day.guida}
                            onCheckedChange={(checked) => handleDayChange(weekIndex, dayIndex, 'guida', checked)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`reperibilita-${weekIndex}-${dayIndex}`}>Reperibilità</Label>
                          <Switch
                            id={`reperibilita-${weekIndex}-${dayIndex}`}
                            checked={day.reperibilita}
                            onCheckedChange={() => toggleReperibilita(weekIndex, dayIndex)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`ffCena-${weekIndex}-${dayIndex}`}>FF Cena</Label>
                          <Switch
                            id={`ffCena-${weekIndex}-${dayIndex}`}
                            checked={day.ffCena}
                            onCheckedChange={(checked) => handleDayChange(weekIndex, dayIndex, 'ffCena', checked)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`extraFF-${weekIndex}-${dayIndex}`}>E/F</Label>
                          <select
                            id={`extraFF-${weekIndex}-${dayIndex}`}
                            value={day.extraFF}
                            onChange={(e) => handleDayChange(weekIndex, dayIndex, 'extraFF', e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          >
                            <option value="0">-</option>
                            <option value="extraMensa">EM</option>
                            <option value="ff">FF</option>
                          </select>
                        </div>
                        {['Diurno', 'Notturno', 'Festivo'].map((tipo) => (
                          <div key={tipo} className="col-span-2 flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <Label>Str. {tipo}</Label>
                            <Input
                              type="number"
                              placeholder="Ore"
                              value={day[`straordinario${tipo}` as keyof Pick<DayState, 'straordinarioDiurno' | 'straordinarioNotturno' | 'straordinarioFestivo'>].ore}
                              onChange={(e) => handleStraordinarioChange(weekIndex, dayIndex, `straordinario${tipo}` as keyof DayState, 'ore', e.target.value)}
                              className="w-16"
                            />
                            <Input
                              type="number"
                              placeholder="Min"
                              value={day[`straordinario${tipo}` as keyof Pick<DayState, 'straordinarioDiurno' | 'straordinarioNotturno' | 'straordinarioFestivo'>].minuti}
                              onChange={(e) => handleStraordinarioChange(weekIndex, dayIndex, `straordinario${tipo}` as keyof DayState, 'minuti', e.target.value)}
                              className="w-16"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Button onClick={calculateSalary} className="w-full">
        <Calculator className="mr-2 h-4 w-4" /> Calcola Stipendio
      </Button>

      {totalSalary > 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-2xl font-bold">
              Stipendio Totale: €{totalSalary.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}