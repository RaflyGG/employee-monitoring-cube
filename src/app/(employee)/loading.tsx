export default function EmployeeLoading() {
  return (
    <div className="flex flex-col gap-4 animate-pulse" aria-busy="true" aria-label="Memuat konten...">
      {/* Top Header/Status Skeleton Card */}
      <div className="bg-white dark:bg-[#141926] border border-[#060057]/10 dark:border-white/10 rounded-2xl p-5 shadow-xs">
        <div className="h-4 w-36 bg-[#060057]/10 dark:bg-white/10 rounded-md mb-2" />
        <div className="h-3 w-48 bg-[#060057]/5 dark:bg-white/5 rounded-md" />
        <div className="mt-4 pt-3 border-t border-[#060057]/10 dark:border-white/10 flex items-center justify-between">
          <div className="h-3 w-28 bg-[#060057]/5 dark:bg-white/5 rounded-md" />
          <div className="h-5 w-24 bg-[#060057]/10 dark:bg-white/10 rounded-lg" />
        </div>
      </div>

      {/* Main Content Skeleton Search / Bar */}
      <div className="bg-white dark:bg-[#141926] border border-[#060057]/10 dark:border-white/10 rounded-xl p-3 shadow-xs">
        <div className="h-8 w-full bg-[#060057]/5 dark:bg-white/5 rounded-lg" />
      </div>

      {/* List Items Skeleton */}
      <div className="flex flex-col gap-2.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#141926] border border-[#060057]/10 dark:border-white/10 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-[#060057]/10 dark:bg-white/10 shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <div className="h-3.5 w-32 bg-[#060057]/10 dark:bg-white/10 rounded-md" />
                <div className="h-2.5 w-20 bg-[#060057]/5 dark:bg-white/5 rounded-md" />
              </div>
            </div>
            <div className="h-6 w-20 rounded-full bg-[#060057]/5 dark:bg-white/5 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
