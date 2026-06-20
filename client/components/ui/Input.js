import { cn } from '@/lib/utils';

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full h-10 px-3 rounded-lg text-sm bg-[#1a1a2e] border border-[#2e2e50] text-[#faf9f6] placeholder:text-[#8888aa]',
        'focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/50 focus:border-[#c9a96e] transition-colors',
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full px-3 py-2 rounded-lg text-sm bg-[#1a1a2e] border border-[#2e2e50] text-[#faf9f6] placeholder:text-[#8888aa] resize-none',
        'focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/50 focus:border-[#c9a96e] transition-colors',
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, children, ...props }) {
  return (
    <label className={cn('block text-xs font-semibold text-[#8888aa] uppercase tracking-wider mb-1.5', className)} {...props}>
      {children}
    </label>
  );
}
