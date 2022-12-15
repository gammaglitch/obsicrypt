import { FunctionalComponent } from 'preact';

type TextareaProps = {
	text: string;
	onChangeText: (value: string) => void;
};

const Textarea: FunctionalComponent<TextareaProps> = ({
	text,
	onChangeText,
}) => {
	return (
		<textarea value={text} onChange={(e) => onChangeText(e.target.value)} />
	);
};

export default Textarea;
