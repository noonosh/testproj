import { ModeToggle } from "./mode-toggle";

export default function Header() {
	return (
		<div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
			<div className="container mx-auto px-4 py-4 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="w-7 h-7 rounded border border-gray-300 dark:border-gray-700 flex items-center justify-center">
						<span className="text-gray-900 dark:text-gray-100 font-light text-lg">∫</span>
					</div>
					<span className="font-mono text-sm text-gray-900 dark:text-gray-100">
						calc
					</span>
				</div>
				<ModeToggle />
			</div>
		</div>
	);
}
