'use client'

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Sun, Moon, Euro, Calculator, Calendar, Clock, Settings, ChevronRight, ChevronUp, ChevronDown, RotateCcw, Settings2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocalStorage } from "@/components/client-wrapper"

type DayState = {
  presenza: boolean;
  guida: boolean;
  extraFF: 'none' | 'extraMensa' | 'ff';
  reperibilita: boolean;
  ffCena: boolean;
  straordinarioDiurno: { ore: string; minuti: string };
  straordinarioNotturno: { ore: string; minuti: string };
  straordinarioFestivo: { ore: string; minuti: string };
}

type Parameters = {
  stipendioBase: string;
  indennitaGuida: string;
  extraMensa: string;
  ff: string;
  ffCena: string;
  reperibilitaFeriale: string;
  reperibilitaSabato: string;
  reperibilitaFestivo: string;
}

const days = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']

const emptyDay: DayState = {
  presenza: false,
  guida: false,
  extraFF: 'none',
  reperibilita: false,
  ffCena: false,
  straordinarioDiurno: { ore: '', minuti: '' },
  straordinarioNotturno: { ore: '', minuti: '' },
  straordinarioFestivo: { ore: '', minuti: '' }
}

const initialParameters: Parameters = {
  stipendioBase: '',
  indennitaGuida: '',
  extraMensa: '',
  ff: '',
  ffCena: '',
  reperibilitaFeriale: '',
  reperibilitaSabato: '',
  reperibilitaFestivo: ''
}

export default function SalaryCalculator() {
  const [parameters, setParameters] = useLocalStorage<Parameters>('salaryParameters', initialParameters)
  const [weeks, setWeeks] = useLocalStorage('salaryWeeks', 
    Array(4).fill(null).map(() => Array(7).fill(null).map(() => ({ ...emptyDay })))
  )
  const [activeWeek, setActiveWeek] = useLocalStorage('activeWeek', 0)
  const [showSettings, setShowSettings] = useLocalStorage('showSettings', true)
  const [totalSalary, setTotalSalary] = useState(0)
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false)
  const [expandedDays, setExpandedDays] = useState<{ [key: number]: boolean }>({})

  const toggleDay = (dayIndex: number) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayIndex]: !prev[dayIndex]
    }))
  }

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleParameterChange = (key: keyof Parameters, value: string) => {
    setParameters((prev: Parameters) => ({ ...prev, [key]: value }));
  }

  const handleDayChange = (weekIndex: number, dayIndex: number, field: keyof DayState, value: any) => {
    setWeeks((prev: DayState[][]) => {
      const newWeeks = [...prev];
      if (field === 'straordinarioDiurno' || field === 'straordinarioNotturno' || field === 'straordinarioFestivo') {
        newWeeks[weekIndex][dayIndex] = {
          ...newWeeks[weekIndex][dayIndex],
          [field]: { ...newWeeks[weekIndex][dayIndex][field], ...value }
        };
      } else {
        newWeeks[weekIndex][dayIndex] = {
          ...newWeeks[weekIndex][dayIndex],
          [field]: value
        };
      }
      return newWeeks;
    });
  };

  const calculateTotalSalary = useMemo(() => {
    let total = 0;
    weeks.forEach((week) => {
      week.forEach((day, dayIndex) => {
        if (day.presenza) {
          const baseHourlyRate = parseFloat(parameters.stipendioBase) || 0;
          total += baseHourlyRate * 7.6;

          if (day.guida) total += parseFloat(parameters.indennitaGuida) || 0;
          if (day.extraFF === 'extraMensa') total += parseFloat(parameters.extraMensa) || 0;
          if (day.extraFF === 'ff') total += parseFloat(parameters.ff) || 0;
          if (day.ffCena) total += parseFloat(parameters.ffCena) || 0;

          if (day.reperibilita) {
            total += parseFloat(
              dayIndex === 5 ? parameters.reperibilitaSabato :
              dayIndex === 6 ? parameters.reperibilitaFestivo :
              parameters.reperibilitaFeriale
            ) || 0;
          }

          const calculateOvertime = (hours: string, minutes: string) => 
            (parseFloat(hours) || 0) + ((parseFloat(minutes) || 0) / 60);

          const regularOT = calculateOvertime(day.straordinarioDiurno.ore, day.straordinarioDiurno.minuti);
          const nightOT = calculateOvertime(day.straordinarioNotturno.ore, day.straordinarioNotturno.minuti);
          const holidayOT = calculateOvertime(day.straordinarioFestivo.ore, day.straordinarioFestivo.minuti);

          total += regularOT * baseHourlyRate * 1.15;
          total += nightOT * baseHourlyRate * 1.3;
          total += holidayOT * baseHourlyRate * 1.4;
        }
      });
    });
    return total;
  }, [weeks, parameters]);

  useEffect(() => {
    setTotalSalary(calculateTotalSalary);
  }, [calculateTotalSalary]);

  return (
    <div className="min-h-screen w-full bg-background text-foreground overflow-x-hidden">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 sticky top-0 z-50 glass-morphism px-4 sm:px-6 py-4 rounded-2xl animate-slow gap-4">
          <h1 className="text-2xl font-semibold text-primary order-1 sm:order-2">
            Calcolatore Stipendio
          </h1>
          <div className="flex items-center gap-2 order-2 sm:order-1 w-full sm:w-auto justify-center sm:justify-start">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newWeeks = [...weeks];
                newWeeks[activeWeek] = newWeeks[activeWeek].map(() => ({ ...emptyDay }));
                setWeeks(newWeeks);
              }}
              className="flex items-center gap-2 hover:bg-secondary/50 rounded-xl text-xs sm:text-sm"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Resetta Settimana</span>
              <span className="sm:hidden">Reset</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2 hover:bg-secondary/50 rounded-xl text-xs sm:text-sm"
            >
              {darkMode ? <Sun className="h-3 w-3 sm:h-4 sm:w-4" /> : <Moon className="h-3 w-3 sm:h-4 sm:w-4" />}
              <span className="hidden sm:inline">{darkMode ? 'Tema Chiaro' : 'Tema Scuro'}</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Parameters Section */}
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
                      { label: 'Indennità Guida', key: 'indennitaGuida' },
                      { label: 'Extra Mensa', key: 'extraMensa' },
                      { label: 'FF', key: 'ff' },
                      { label: 'FF Cena', key: 'ffCena' },
                      { label: 'Reperibilità Feriale', key: 'reperibilitaFeriale' },
                      { label: 'Reperibilità Sabato', key: 'reperibilitaSabato' },
                      { label: 'Reperibilità Festivo', key: 'reperibilitaFestivo' }
                    ].map(({ label, key }) => (
                      <div key={key} className="space-y-2">
                        <Label className="text-muted-foreground text-sm">{label}</Label>
                        <Input
                          type="number"
                          value={parameters[key as keyof Parameters]}
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

          {/* Week Selector */}
          <div className="space-y-4">
            <Tabs
              defaultValue={`week-${activeWeek}`}
              className="week-tabs"
              onValueChange={(value) => setActiveWeek(parseInt(value.split('-')[1]))}
            >
              <TabsList className="week-tabs-list">
                {Array.from({ length: 4 }, (_, i) => {
                  const hasData = weeks[i].some(day => 
                    day.presenza || day.guida || day.extraFF !== 'none' || 
                    day.reperibilita || day.ffCena ||
                    (day.straordinarioDiurno.ore !== '' || day.straordinarioDiurno.minuti !== '') ||
                    (day.straordinarioNotturno.ore !== '' || day.straordinarioNotturno.minuti !== '') ||
                    (day.straordinarioFestivo.ore !== '' || day.straordinarioFestivo.minuti !== '')
                  );

                  return (
                    <TabsTrigger
                      key={i}
                      value={`week-${i}`}
                      className="week-tab"
                    >
                      <span className="relative whitespace-nowrap text-xs sm:text-sm">
                        <span className="hidden sm:inline">Settimana</span>
                        <span className="sm:hidden">Sett.</span> {i + 1}
                        {hasData && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="week-tab-indicator"
                          />
                        )}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>

            {/* Days Grid */}
            <div className="grid grid-cols-1 gap-4">
              {days.map((day, dayIndex) => {
                const isWeekend = dayIndex >= 5;
                const dayData = weeks[activeWeek][dayIndex];

                return (
                  <Card
                    key={dayIndex}
                    className={cn(
                      "overflow-hidden transition-all duration-300 modern-card hover-card",
                      isWeekend && "border-orange-500/20",
                      dayData.presenza && "border-green-500/50 bg-green-500/5"
                    )}
                  >
                    <CardHeader 
                      className="cursor-pointer space-y-0 p-4"
                      onClick={() => toggleDay(dayIndex)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: expandedDays[dayIndex] ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                          <span className={cn(
                            "text-base sm:text-lg font-medium",
                            isWeekend ? "text-orange-500" : "text-primary"
                          )}>
                            {day}
                          </span>
                        </div>
                        <Switch
                          checked={dayData.presenza}
                          onCheckedChange={(checked) => {
                            handleDayChange(activeWeek, dayIndex, 'presenza', checked);
                            if (checked) setExpandedDays(prev => ({ ...prev, [dayIndex]: true }));
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="data-[state=checked]:bg-green-500"
                        />
                      </div>
                    </CardHeader>

                    <AnimatePresence initial={false}>
                      {expandedDays[dayIndex] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CardContent className="space-y-4 p-4 pt-0">
                            {/* Day Options */}
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant={dayData.guida ? "default" : "outline"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDayChange(activeWeek, dayIndex, 'guida', !dayData.guida);
                                }}
                                className="text-xs h-7"
                              >
                                Guida
                              </Button>
                              <Button
                                variant={dayData.reperibilita ? "default" : "outline"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDayChange(activeWeek, dayIndex, 'reperibilita', !dayData.reperibilita);
                                }}
                                className="text-xs h-7"
                              >
                                Reperibilità
                              </Button>
                              <Button
                                variant={dayData.ffCena ? "default" : "outline"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDayChange(activeWeek, dayIndex, 'ffCena', !dayData.ffCena);
                                }}
                                className="text-xs h-7"
                              >
                                FF Cena
                              </Button>
                            </div>

                            {/* Extra FF Select */}
                            <div className="space-y-2">
                              <Label className="text-sm text-muted-foreground">Extra/FF</Label>
                              <Select
                                value={dayData.extraFF}
                                onValueChange={(value: 'none' | 'extraMensa' | 'ff') => 
                                  handleDayChange(activeWeek, dayIndex, 'extraFF', value)
                                }
                              >
                                <SelectTrigger className="modern-input text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Nessuno</SelectItem>
                                  <SelectItem value="extraMensa">Extra Mensa</SelectItem>
                                  <SelectItem value="ff">FF</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Overtime Inputs */}
                            {['Diurno', 'Notturno', 'Festivo'].map((type) => {
                              const key = `straordinario${type}` as keyof DayState;
                              return (
                                <div key={type} className="space-y-2">
                                  <Label className="text-sm text-muted-foreground">
                                    Straordinario {type}
                                  </Label>
                                  <div className="flex gap-2">
                                    <div className="flex-1">
                                      <Input
                                        type="number"
                                        placeholder="Ore"
                                        value={dayData[key].ore}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => handleDayChange(activeWeek, dayIndex, key, { ...dayData[key], ore: e.target.value })}
                                        className="modern-input text-sm"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <Input
                                        type="number"
                                        placeholder="Min"
                                        value={dayData[key].minuti}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => handleDayChange(activeWeek, dayIndex, key, { ...dayData[key], minuti: e.target.value })}
                                        className="modern-input text-sm"
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Total Salary */}
        <Card className="sticky bottom-4 glass-morphism animate-slow mt-6">
          <CardHeader className="p-4">
            <CardTitle className="flex items-center justify-between">
              <span className="text-primary text-base sm:text-lg">Totale Stipendio</span>
              <motion.span
                key={totalSalary}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-xl sm:text-2xl font-mono text-primary"
              >
                € {totalSalary.toFixed(2)}
              </motion.span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

    </div>
  )
}