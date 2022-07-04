import { MutableRef, useEffect } from 'preact/hooks';

function useOnClickOutside(ref: MutableRef<any>, callback: () => void) {
	const handleClick = (e: MouseEvent) => {
		if (ref.current && !ref.current.contains(e.target)) {
			callback();
		}
	};

	useEffect(() => {
		document.addEventListener('click', handleClick);

		return () => {
			document.removeEventListener('click', handleClick);
		};
	});
}

export default useOnClickOutside;
