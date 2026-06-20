import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
  {
    variants: {
      variant: {
        gold:       'bg-[#c9a96e] text-[#1a1a2e] hover:bg-[#d4ba85] active:scale-[0.98]',
        charcoal:   'bg-[#222240] text-[#faf9f6] border border-[#2e2e50] hover:bg-[#2a2a48] active:scale-[0.98]',
        outline:    'border border-[#c9a96e] text-[#c9a96e] hover:bg-[#c9a96e]/10 active:scale-[0.98]',
        ghost:      'text-[#8888aa] hover:text-[#faf9f6] hover:bg-[#222240]',
        destructive:'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20',
      },
      size: {
        sm:   'h-8  px-3  text-xs  rounded-md',
        md:   'h-10 px-4  text-sm  rounded-lg',
        lg:   'h-12 px-6  text-base rounded-xl',
        icon: 'h-9  w-9   text-sm  rounded-lg',
      },
    },
    defaultVariants: { variant: 'charcoal', size: 'md' },
  }
);

export function Button({ className, variant, size, children, ...props }) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </button>
  );
}
