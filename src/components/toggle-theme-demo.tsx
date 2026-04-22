import { ToggleTheme } from "@/components/ui/toggle-theme";
import { cn } from '@/lib/utils';

export default function DemoOne() {
	return (
		<div className="relative flex h-[150px] w-full items-center justify-center rounded-2xl overflow-hidden border border-border">
			<div
				aria-hidden="true"
				className={cn(
					'absolute inset-0 -z-10 size-full',
					'bg-[radial-gradient(color-mix(in_oklab,var(--foreground)_10%,transparent)_2px,transparent_2px)]',
					'bg-[size:12px_12px]',
				)}
			/>
			<ToggleTheme />
		</div>
	);
}
