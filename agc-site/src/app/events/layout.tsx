export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-white">
      {children}
    </div>
  );
}
