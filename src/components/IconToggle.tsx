import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';

type IconToggleProps = {
	icon: any;
};

const IconToggle: FunctionalComponent<IconToggleProps> = ({
	children,
	icon,
}) => {
	const [showInput, setShowInput] = useState(false);

	if (showInput) {
		return <>{children}</>;
	}

	return <div onClick={() => setShowInput(true)}>{icon}</div>;
};

export default IconToggle;
