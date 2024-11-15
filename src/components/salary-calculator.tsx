'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type DayState = {
  presenza: boolean;
  guida: boolean;
  extraFF: 'none' | 'extraMensa' | 'ff';
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
  extraFF: 'none',
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
      {/* Your existing JSX here */}
      <div>Work in progress...</div>
    </div>
  );
}
