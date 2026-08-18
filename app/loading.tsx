export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-isl-white" aria-label="Cargando contenido">
      <span
        className="isl-fade-up size-8 animate-spin rounded-full border-2 border-isl-gold border-t-transparent motion-reduce:animate-none"
        aria-hidden="true"
      />
      <span className="sr-only">Cargando contenido</span>
    </main>
  );
}
