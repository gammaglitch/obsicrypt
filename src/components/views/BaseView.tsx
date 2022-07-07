import { ComponentChildren, FunctionalComponent } from 'preact';

type BaseViewProps = {
	icon?: ComponentChildren;
	title: string;
};

const BaseView: FunctionalComponent<BaseViewProps> = ({
	icon,
	title,
	children,
}) => {
	return (
		<div className="p-1">
			<h1 className="mb-2 text-xl font-bold">
				{icon} {title}
			</h1>
			<div>{children}</div>
		</div>
	);
};

export default BaseView;
