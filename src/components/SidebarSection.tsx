import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';

type SidebarSectionProps = {
	title: string;
	defaultOpen?: boolean;
};

const SidebarSection: FunctionalComponent<SidebarSectionProps> = ({
	title,
	defaultOpen = true,
	children,
}) => {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<div className="mb-6">
			<h2
				className="text-sm font-semibold mb-2 opacity-60 cursor-pointer select-none flex items-center"
				onClick={() => setOpen(!open)}
			>
				<span
					className="inline-block mr-1 transition-transform"
					style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
				>
					›
				</span>
				{title}
			</h2>
			{open && children}
		</div>
	);
};

export default SidebarSection;
