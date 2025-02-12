export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="text-white text-xl">Loading model...</div>
    </div>
  );
}