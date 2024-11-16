'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type DayState = {
  presenza: boolean;
  guida: boolean;
  extraMensa: boolean;
  ff: boolean;
  reperibilita: boolean;
  ffCena: boolean;
  straordinarioDiurno: { ore: string; minuti: string };
  straordinarioNotturno: { ore: string; minuti: string };
  straordinarioFestivo: { ore: string; minuti: string };
};

type Parameters = {
  stipendioBase: string;
  indennitaGuida: string;
  extraMensa: string;
  ff: string;
  ffCena: string;
  reperibilitaFeriale: string;
  reperibilitaSabato: string;
  reperibilitaFestivo: string;
};

const initialParameters: Parameters = {
  stipendioBase: "0",
  indennitaGuida: "0",
  extraMensa: "0",
  ff: "0",
  ffCena: "0",
  reperibilitaFeriale: "0",
  reperibilitaSabato: "0",
  reperibilitaFestivo: "0"
};

const initialDay: DayState = {
  presenza: false,
  guida: false,
  extraMensa: false,
  ff: false,
  reperibilita: false,
  ffCena: false,
  straordinarioDiurno: { ore: "0", minuti: "0" },
  straordinarioNotturno: { ore: "0", minuti: "0" },
  straordinarioFestivo: { ore: "0", minuti: "0" }
};

const initialWeek = Array(7).fill(null).map(() => ({ ...initialDay }));

export default function SalaryCalculator() {
  // Initialize state with default values
  const [parameters, setParameters] = useState(initialParameters);
  const [weeks, setWeeks] = useState([initialWeek]);
  const [activeWeek, setActiveWeek] = useState(0);
  const [showSettings, setShowSettings] = useState(true);
  const [totalSalary, setTotalSalary] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [expandedDays, setExpandedDays] = useState<{ [key: number]: boolean }>({});

  // Load data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedParameters = localStorage.getItem('salaryParameters');
      const savedWeeks = localStorage.getItem('salaryWeeks');
      const savedActiveWeek = localStorage.getItem('activeWeek');
      const savedShowSettings = localStorage.getItem('showSettings');
      const savedDarkMode = localStorage.getItem('darkMode');

      if (savedParameters) setParameters(JSON.parse(savedParameters));
      if (savedWeeks) setWeeks(JSON.parse(savedWeeks));
      if (savedActiveWeek) setActiveWeek(JSON.parse(savedActiveWeek));
      if (savedShowSettings) setShowSettings(JSON.parse(savedShowSettings));
      if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('salaryParameters', JSON.stringify(parameters));
      localStorage.setItem('salaryWeeks', JSON.stringify(weeks));
      localStorage.setItem('activeWeek', JSON.stringify(activeWeek));
      localStorage.setItem('showSettings', JSON.stringify(showSettings));
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }
  }, [parameters, weeks, activeWeek, showSettings, darkMode]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div>
        <Accordion.Item value="base">
          <AccordionTrigger>Parametri Base</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Stipendio Base</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={parameters.stipendioBase}
                    onChange={(e) => setParameters({ ...parameters, stipendioBase: e.target.value })}
                    className="w-full p-2 border rounded pl-8"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Indennità Guida</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={parameters.indennitaGuida}
                    onChange={(e) => setParameters({ ...parameters, indennitaGuida: e.target.value })}
                    className="w-full p-2 border rounded pl-8"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Extra Mensa</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={parameters.extraMensa}
                    onChange={(e) => setParameters({ ...parameters, extraMensa: e.target.value })}
                    className="w-full p-2 border rounded pl-8"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium mb-1">FF</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={parameters.ff}
                    onChange={(e) => setParameters({ ...parameters, ff: e.target.value })}
                    className="w-full p-2 border rounded pl-8"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium mb-1">FF Cena</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={parameters.ffCena}
                    onChange={(e) => setParameters({ ...parameters, ffCena: e.target.value })}
                    className="w-full p-2 border rounded pl-8"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Reperibilità Feriale</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={parameters.reperibilitaFeriale}
                    onChange={(e) => setParameters({ ...parameters, reperibilitaFeriale: e.target.value })}
                    className="w-full p-2 border rounded pl-8"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Reperibilità Sabato</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={parameters.reperibilitaSabato}
                    onChange={(e) => setParameters({ ...parameters, reperibilitaSabato: e.target.value })}
                    className="w-full p-2 border rounded pl-8"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Reperibilità Festivo</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={parameters.reperibilitaFestivo}
                    onChange={(e) => setParameters({ ...parameters, reperibilitaFestivo: e.target.value })}
                    className="w-full p-2 border rounded pl-8"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </Accordion.Item>
      </div>
      <div>Work in progress...</div>
    </div>
  );
}
