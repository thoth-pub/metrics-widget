import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '@/shared/lib/utils';

const buttonVariants = cva(
	"inline-flex hover:text-button-typography-hover hover:border-button-border-hover active:text-button-typography-active active:border-button-border-active cursor-pointer bg-button-background text-button-typography items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default: '',
				outline: 'border border-button-border shadow-xs',
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				link: 'text-primary underline-offset-4 hover:underline',
				active:
					'bg-button-active-background !text-button-active-typography border-button-active-border',
				ghost: 'bg-transparent [&_svg]:text-input-start-icon',
			},
			size: {
				default: 'h-9 px-4 py-2 has-[>svg]:px-3',
				sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
				lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
				xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
				icon: 'size-9',
				'icon-xs': "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
				'icon-sm': 'size-8',
				'icon-lg': 'size-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

function Button({
	className,
	variant = 'default',
	size = 'default',
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : 'button';

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
