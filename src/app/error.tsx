'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold text-destructive">
        Qualcosa è andato storto!
      </h2>
      <p className="text-muted-foreground">
        Si è verificato un errore imprevisto. Riprova più tardi.
      </p>
      <Button
        variant="outline"
        onClick={() => reset()}
        className="mt-4"
      >
        Riprova
      </Button>
    </div>
  );
}
