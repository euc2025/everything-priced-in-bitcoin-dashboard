"use client";

export function DisclaimerFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="text-xs text-muted-foreground">
          Este dashboard es educativo y usa datos aproximados o simulados cuando no hay
          proveedor disponible. No es asesoría financiera.
        </div>
      </div>
    </footer>
  );
}
