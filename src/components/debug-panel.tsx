'use client';

import { useState } from 'react';
import { errorHandler } from '@/lib/error-handler';
import { motion, AnimatePresence } from 'framer-motion';

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const logs = errorHandler.getLogs();

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700 transition-colors"
      >
        Debug {logs.length > 0 && `(${logs.length})`}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-full mb-2 w-96 max-h-96 overflow-auto bg-gray-800 rounded-lg p-4 text-white"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Debug Logs</h3>
              <button
                onClick={() => errorHandler.clearLogs()}
                className="text-xs bg-red-500 px-2 py-1 rounded hover:bg-red-600 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-sm ${
                    log.level === 'error'
                      ? 'bg-red-900/50'
                      : log.level === 'warning'
                      ? 'bg-yellow-900/50'
                      : 'bg-blue-900/50'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">[{log.level.toUpperCase()}]</span>
                    <span className="text-xs opacity-50">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-1">{log.message}</p>
                  {log.context && (
                    <pre className="mt-1 text-xs opacity-75 overflow-x-auto">
                      {JSON.stringify(log.context, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
