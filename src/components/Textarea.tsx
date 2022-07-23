import { FunctionalComponent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

type TextareaProps = {
    value: string;
    onChange:
};

const Textarea: FunctionalComponent<TextareaProps> = () => {
	const textareaRef = useRef(null);
	const [currentValue, setCurrentValue] = useState('');

	useEffect(() => {
		textareaRef.current.style.height = '0px';
		const scrollHeight = textareaRef.current.scrollHeight;
		textareaRef.current.style.height = scrollHeight + 'px';
	}, [currentValue]);

	return (
		<textarea
			ref={textareaRef}
			style={{
				display: 'block',
				overflow: 'hidden',
				resize: 'none',
				width: '100%',
			}}
			value={currentValue}
			onChange={(e) => {
				setCurrentValue(e.target.value);
			}}
		/>
	);
};

export default Textarea;
