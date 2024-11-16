'use client'

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Sun, Moon, Euro, ChevronRight, ChevronUp, ChevronDown, RotateCcw, Settings2, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocalStorage } from "@/components/client-wrapper"
import { Parameters } from "@/components/parameters"
import jsPDF from 'jspdf'

type TimeEntry = {
  ore: string;
  minuti: string;
};

type DayState = {
  guida: boolean;
  extraMensa: boolean;
  ff: boolean;
  reperibilita: boolean;
  ffCena: boolean;
  presenza: boolean;
  straordinarioDiurno: TimeEntry;
  straordinarioNotturno: TimeEntry;
  straordinarioFestivo: TimeEntry;
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

const initialDay: DayState = {
  guida: false,
  extraMensa: false,
  ff: false,
  reperibilita: false,
  ffCena: false,
  presenza: false,
  straordinarioDiurno: { ore: "0", minuti: "0" },
  straordinarioNotturno: { ore: "0", minuti: "0" },
  straordinarioFestivo: { ore: "0", minuti: "0" }
}

const initialParameters: Parameters = {
  stipendioBase: '0',
  indennitaGuida: '0',
  extraMensa: '0',
  ff: '0',
  ffCena: '0',
  reperibilitaFeriale: '0',
  reperibilitaSabato: '0',
  reperibilitaFestivo: '0'
}

export default function SalaryCalculator() {
  const [parameters, setParameters] = useLocalStorage<Parameters>('salaryParameters', initialParameters)
  const [weeks, setWeeks] = useLocalStorage('salaryWeeks', 
    Array(4).fill(null).map(() => Array(7).fill(null).map(() => ({ ...initialDay })))
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

  const handleDayChange = (_weekIndex: number, dayIndex: number, field: keyof DayState, value: any) => {
    setWeeks((prev: DayState[][]) => {
      const newWeeks = [...prev];
      if (field === 'straordinarioDiurno' || field === 'straordinarioNotturno' || field === 'straordinarioFestivo') {
        newWeeks[activeWeek][dayIndex] = {
          ...newWeeks[activeWeek][dayIndex],
          [field]: { ...newWeeks[activeWeek][dayIndex][field], ...value }
        };
      } else {
        newWeeks[activeWeek][dayIndex] = {
          ...newWeeks[activeWeek][dayIndex],
          [field]: value
        };
      }
      return newWeeks;
    });
  };

  const handleOvertimeChange = (
    _weekIndex: number,
    dayIndex: number,
    field: keyof Pick<DayState, 'straordinarioDiurno' | 'straordinarioNotturno' | 'straordinarioFestivo'>,
    overtimeField: keyof TimeEntry,
    value: string
  ) => {
    setWeeks((prev: DayState[][]) => {
      const newWeeks = [...prev];
      if (newWeeks[activeWeek]?.[dayIndex]?.[field]) {
        newWeeks[activeWeek][dayIndex] = {
          ...newWeeks[activeWeek][dayIndex],
          [field]: {
            ...newWeeks[activeWeek][dayIndex][field],
            [overtimeField]: value
          }
        };
      }
      return newWeeks;
    });
  };

  const calculateDaySalary = useMemo(() => (week: number, dayIndex: number): number => {
    const day = weeks[week]?.[dayIndex];
    if (!day) return 0;

    const calculateDailySalary = (day: DayState): number => {
      const getNumericValue = (value: string): number => {
        const numericValue = parseFloat(value);
        return isNaN(numericValue) ? 0 : numericValue;
      };

      // Base salary calculation for standard work day (7 hours and 36 minutes = 7.6 hours)
      const STANDARD_DAILY_HOURS = 7.6;
      const hourlyRate = getNumericValue(parameters.stipendioBase) / (STANDARD_DAILY_HOURS * 22); // Diviso per ore giornaliere e giorni lavorativi
      let salary = day.presenza ? hourlyRate * STANDARD_DAILY_HOURS * 22 / 22 : 0; // Moltiplico e divido per 22 per ottenere la paga giornaliera

      // Add guida compensation
      if (day.guida) {
        salary += getNumericValue(parameters.indennitaGuida);
      }

      // Add extra/FF compensation
      if (day.extraMensa) {
        salary += getNumericValue(parameters.extraMensa);
      } else if (day.ff) {
        salary += getNumericValue(parameters.ff);
      }

      // Add FF Cena
      if (day.ffCena) {
        salary += getNumericValue(parameters.ffCena);
      }

      // Add reperibilità based on day type
      if (day.reperibilita) {
        if (dayIndex === 5) { // Saturday
          salary += getNumericValue(parameters.reperibilitaSabato);
        } else if (dayIndex === 6) { // Sunday
          salary += getNumericValue(parameters.reperibilitaFestivo);
        } else { // Weekday
          salary += getNumericValue(parameters.reperibilitaFeriale);
        }
      }

      // Calculate overtime
      const calculateOvertimeMinutes = (ore: string, minuti: string): number => {
        const hours = parseInt(ore) || 0;
        const minutes = parseInt(minuti) || 0;
        return hours * 60 + minutes;
      };

      // Calcola la maggiorazione oraria in base allo stipendio base
      const calculateOvertimeRate = (baseRate: number, percentage: number): number => {
        return baseRate + (baseRate * percentage);
      };

      // Diurno overtime (maggiorazione 25%)
      const diurnoMinutes = calculateOvertimeMinutes(
        day.straordinarioDiurno?.ore || '0',
        day.straordinarioDiurno?.minuti || '0'
      );
      if (diurnoMinutes > 0) {
        const overtimeRate = calculateOvertimeRate(hourlyRate, 0.25);
        salary += (diurnoMinutes / 60) * overtimeRate;
      }

      // Notturno overtime (maggiorazione 40%)
      const notturnoMinutes = calculateOvertimeMinutes(
        day.straordinarioNotturno?.ore || '0',
        day.straordinarioNotturno?.minuti || '0'
      );
      if (notturnoMinutes > 0) {
        const overtimeRate = calculateOvertimeRate(hourlyRate, 0.40);
        salary += (notturnoMinutes / 60) * overtimeRate;
      }

      // Festivo overtime (maggiorazione 50%)
      const festivoMinutes = calculateOvertimeMinutes(
        day.straordinarioFestivo?.ore || '0',
        day.straordinarioFestivo?.minuti || '0'
      );
      if (festivoMinutes > 0) {
        const overtimeRate = calculateOvertimeRate(hourlyRate, 0.50);
        salary += (festivoMinutes / 60) * overtimeRate;
      }

      return Number(salary.toFixed(2));
    };

    return calculateDailySalary(day);
  }, [weeks, parameters, activeWeek]);

  const generateWeeklyReport = (weekIndex: number): string[] => {
    const week = weeks[weekIndex];
    if (!week) return [];

    let guide = 0;
    let straordinariDiurni = 0;
    let straordinariNotturni = 0;
    let straordinariFestivi = 0;
    let extraMensa = 0;
    let ff = 0;
    let ffCena = 0;
    let reperibilita = 0;
    let totaleSalario = 0;

    week.forEach((day, dayIndex) => {
      if (day.guida) guide++;
      if (day.extraMensa) extraMensa++;
      if (day.ff) ff++;
      if (day.ffCena) ffCena++;
      if (day.reperibilita) reperibilita++;

      // Calcola ore straordinari
      const getMinutes = (ore: string = '0', minuti: string = '0') => 
        (parseInt(ore) || 0) * 60 + (parseInt(minuti) || 0);

      if (day.straordinarioDiurno) {
        straordinariDiurni += getMinutes(
          day.straordinarioDiurno.ore,
          day.straordinarioDiurno.minuti
        );
      }
      if (day.straordinarioNotturno) {
        straordinariNotturni += getMinutes(
          day.straordinarioNotturno.ore,
          day.straordinarioNotturno.minuti
        );
      }
      if (day.straordinarioFestivo) {
        straordinariFestivi += getMinutes(
          day.straordinarioFestivo.ore,
          day.straordinarioFestivo.minuti
        );
      }

      totaleSalario += calculateDaySalary(weekIndex, dayIndex);
    });

    const lines = []
    lines.push(`Riepilogo Settimana ${weekIndex + 1}:`)
    lines.push(`------------------------`)
    lines.push(`Guide: ${guide} giorni`)
    lines.push(`Straordinari:`)
    lines.push(`  - Diurni: ${(straordinariDiurni / 60).toFixed(1)} ore`)
    lines.push(`  - Notturni: ${(straordinariNotturni / 60).toFixed(1)} ore`)
    lines.push(`  - Festivi: ${(straordinariFestivi / 60).toFixed(1)} ore`)
    lines.push(`Extra Mensa: ${extraMensa} giorni`)
    lines.push(`Fuori Ferie: ${ff} giorni`)
    lines.push(`FF Cena: ${ffCena} giorni`)
    lines.push(`Reperibilità: ${reperibilita} giorni`)
    lines.push(`Totale Salario: €${totaleSalario.toFixed(2)}`)
    return lines
  };

  const downloadReport = () => {
    const doc = new jsPDF()
    const lineHeight = 7
    let yPos = 20

    // Titolo
    doc.setFontSize(20)
    doc.text('Report Stipendio', 20, yPos)
    yPos += lineHeight * 2

    // Parametri
    doc.setFontSize(12)
    doc.text('Parametri di Calcolo:', 20, yPos)
    yPos += lineHeight
    doc.setFontSize(10)
    doc.text(`Paga oraria base: €${parameters.stipendioBase}`, 25, yPos)
    yPos += lineHeight
    doc.text(`Compenso guida: €${parameters.indennitaGuida}`, 25, yPos)
    yPos += lineHeight
    doc.text(`Pasto extra: €${parameters.extraMensa}`, 25, yPos)
    yPos += lineHeight * 2

    // Report per ogni settimana
    weeks.forEach((week, index) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(14)
      doc.text(`Settimana ${index + 1}`, 20, yPos)
      yPos += lineHeight

      doc.setFontSize(10)
      const report = generateWeeklyReport(index)
      report.slice(1).forEach(line => {
        if (yPos > 280) {
          doc.addPage()
          yPos = 20
        }
        if (line.startsWith('-')) {
          doc.text(line, 25, yPos)
        } else if (line.startsWith('\n')) {
          yPos += lineHeight
          doc.text(line.substring(1), 20, yPos)
        } else {
          doc.text(line, 20, yPos)
        }
        yPos += lineHeight
      })
      yPos += lineHeight
    })

    // Totale generale
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    doc.setFontSize(14)
    doc.text(`Totale Generale: €${totalSalary.toFixed(2)}`, 20, yPos)

    // Salva il PDF
    doc.save('report-stipendio.pdf')
  };

  const resetCalculator = () => {
    setWeeks(Array(4).fill(null).map(() => Array(7).fill(null).map(() => ({ ...initialDay }))))
    setActiveWeek(0)
    setExpandedDays({})
  }

  // Calculate total salary
  useEffect(() => {
    const total = weeks.reduce((weekTotal, week, weekIndex) => {
      return weekTotal + week.reduce((dayTotal, _, dayIndex) => {
        return dayTotal + calculateDaySalary(weekIndex, dayIndex);
      }, 0);
    }, 0);
    setTotalSalary(Math.round(total * 100) / 100);
  }, [weeks, calculateDaySalary]);

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Calcolatore Stipendio</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-full"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={resetCalculator}
            className="rounded-full"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-8">
        <Parameters parameters={parameters} setParameters={setParameters} />
        
        {/* Download Report Button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Settimane</h2>
          <Button
            onClick={downloadReport}
            variant="default"
            className="bg-green-600 hover:bg-green-700" 
          >
            Scarica Report
          </Button>
        </div>

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
                  day.guida || day.extraMensa || 
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
                    dayData.guida && "border-green-500/50 bg-green-500/5"
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
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CardContent className="space-y-4 p-4 pt-0">
                          {/* Day Options */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center">
                              <Button
                                variant={dayData.guida ? "default" : "outline"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDayChange(activeWeek, dayIndex, 'guida', !dayData.guida);
                                }}
                                className="text-xs h-7 w-full"
                              >
                                Guida
                              </Button>
                            </div>

                            <div className="flex items-center">
                              <Button
                                variant={dayData.extraMensa ? "default" : "outline"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDayChange(activeWeek, dayIndex, 'extraMensa', !dayData.extraMensa);
                                }}
                                className="text-xs h-7 w-full"
                              >
                                Extra Mensa
                              </Button>
                            </div>

                            <div className="flex items-center">
                              <Button
                                variant={dayData.ff ? "default" : "outline"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDayChange(activeWeek, dayIndex, 'ff', !dayData.ff);
                                }}
                                className="text-xs h-7 w-full"
                              >
                                FF
                              </Button>
                            </div>

                            <div className="flex items-center">
                              <Button
                                variant={dayData.reperibilita ? "default" : "outline"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDayChange(activeWeek, dayIndex, 'reperibilita', !dayData.reperibilita);
                                }}
                                className="text-xs h-7 w-full"
                              >
                                Reperibilità
                              </Button>
                            </div>

                            <div className="flex items-center">
                              <Button
                                variant={dayData.ffCena ? "default" : "outline"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDayChange(activeWeek, dayIndex, 'ffCena', !dayData.ffCena);
                                }}
                                className="text-xs h-7 w-full"
                              >
                                FF Cena
                              </Button>
                            </div>
                          </div>

                          {/* Overtime Inputs */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                              { 
                                label: 'Straordinario Diurno',
                                key: 'straordinarioDiurno' as const,
                                icon: <Sun className="h-4 w-4 text-yellow-500" />
                              },
                              { 
                                label: 'Straordinario Notturno',
                                key: 'straordinarioNotturno' as const,
                                icon: <Moon className="h-4 w-4 text-blue-500" />
                              },
                              { 
                                label: 'Straordinario Festivo',
                                key: 'straordinarioFestivo' as const,
                                icon: <Calendar className="h-4 w-4 text-red-500" />
                              }
                            ].map(({ label, key, icon }) => (
                              <div key={key} className="space-y-2">
                                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                                  {icon} {label}
                                </Label>
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <Input
                                      type="number"
                                      value={dayData[key].ore}
                                      onChange={(e) => handleOvertimeChange(activeWeek, dayIndex, key, 'ore', e.target.value)}
                                      placeholder="Ore"
                                      className="modern-input text-sm"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <Input
                                      type="number"
                                      value={dayData[key].minuti}
                                      onChange={(e) => handleOvertimeChange(activeWeek, dayIndex, key, 'minuti', e.target.value)}
                                      placeholder="Min"
                                      className="modern-input text-sm"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Daily Salary */}
                          <div className="pt-4 border-t">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Totale Giornaliero</span>
                              <span className="text-lg font-semibold">
                                €{calculateDaySalary(activeWeek, dayIndex).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Total Salary Display */}
        <Card className="mb-6 modern-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Totale Stipendio
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings2 className="mr-2 h-3 w-3" />
              {showSettings ? 'Nascondi' : 'Mostra'} Parametri
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">€{totalSalary.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}