import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';

import { Taskey } from '../helpers/tasks/types';
import { useFileManager } from '../hooks/useFileManager';

type TaskModalProps = {
	task: Taskey;
	isOpen: boolean;
	onClose: () => void;
};

const TaskModal: FunctionalComponent<TaskModalProps> = ({ task, isOpen, onClose }) => {
	const { updateTaskText } = useFileManager();
	const [isEditingText, setIsEditingText] = useState(false);
	const [editedText, setEditedText] = useState('');

	if (!isOpen) return null;

	const handleEditClick = () => {
		setEditedText(task.displayText);
		setIsEditingText(true);
	};

	const handleSave = async () => {
		if (editedText.trim()) {
			// Preserve the list marker and checkbox
			const marker = task.done ? '[x]' : '[ ]';
			const listMarker = task.originalText.match(/^\s*[-*]/)?.[0] || '-';

			// Build metadata strings
			const metadataParts: string[] = [];

			// Add key-value metadata (due, start, completedOn)
			if (task.due) metadataParts.push(`{due:${task.due}}`);
			if (task.start) metadataParts.push(`{start:${task.start}}`);
			if (task.completedOn) metadataParts.push(`{completedOn:${task.completedOn}}`);

			// Add custom metadata
			Object.entries(task.custom).forEach(([key, values]) => {
				values.forEach(value => metadataParts.push(`{${key}:${value}}`));
			});

			// Add tags
			task.tags.forEach(tag => metadataParts.push(`#${tag}`));

			// Add contexts
			task.contexts.forEach(context => metadataParts.push(`@${context}`));

			// Combine everything
			const metadata = metadataParts.length > 0 ? ' ' + metadataParts.join(' ') : '';
			const newText = `${listMarker} ${marker} ${editedText.trim()}${metadata}`;

			console.log('TASK_SAVE_DEBUG', {
				originalText: task.originalText,
				editedText: editedText,
				taskMetadata: {
					due: task.due,
					start: task.start,
					completedOn: task.completedOn,
					tags: task.tags,
					contexts: task.contexts,
					custom: task.custom
				},
				metadataParts: metadataParts,
				finalNewText: newText
			});

			await updateTaskText(task, newText);
			setIsEditingText(false);
			onClose();
		}
	};

	const handleCancel = () => {
		setIsEditingText(false);
		setEditedText('');
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
			onClick={onClose}
		>
			<div
				className="bg-[#2a2738] rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex justify-between items-start mb-4">
					<h2 className="text-xl font-semibold">Task Details</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-white text-2xl leading-none"
					>
						×
					</button>
				</div>

				<div className="space-y-4">
					<div>
						<label className="text-sm font-semibold text-gray-400 block mb-1">
							Display Text
						</label>
						{isEditingText ? (
							<div className="flex gap-2">
								<input
									type="text"
									value={editedText}
									onInput={(e) => setEditedText((e.target as HTMLInputElement).value)}
									className="flex-1 bg-[#1e1b26] border border-gray-600 rounded px-3 py-2 text-base focus:outline-none focus:border-gray-400"
									autoFocus
								/>
								<button
									onClick={handleSave}
									className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
								>
									Save
								</button>
								<button
									onClick={handleCancel}
									className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm font-medium"
								>
									Cancel
								</button>
							</div>
						) : (
							<div
								className="text-base cursor-pointer hover:bg-[#3d3a4b] p-2 rounded -ml-2"
								onClick={handleEditClick}
							>
								{task.displayText}
							</div>
						)}
					</div>

					<div>
						<label className="text-sm font-semibold text-gray-400 block mb-1">
							Status
						</label>
						<div className="text-base">{task.done ? '✓ Completed' : '○ Incomplete'}</div>
					</div>

					<div>
						<label className="text-sm font-semibold text-gray-400 block mb-1">
							File Path
						</label>
						<div className="text-sm text-gray-300">{task.filePath}</div>
					</div>

					{task.due && (
						<div>
							<label className="text-sm font-semibold text-gray-400 block mb-1">
								Due Date
							</label>
							<div className="text-base">{task.due}</div>
						</div>
					)}

					{task.start && (
						<div>
							<label className="text-sm font-semibold text-gray-400 block mb-1">
								Start Date
							</label>
							<div className="text-base">{task.start}</div>
						</div>
					)}

					{task.completedOn && (
						<div>
							<label className="text-sm font-semibold text-gray-400 block mb-1">
								Completed On
							</label>
							<div className="text-base">{task.completedOn}</div>
						</div>
					)}

					{task.tags.length > 0 && (
						<div>
							<label className="text-sm font-semibold text-gray-400 block mb-1">
								Tags
							</label>
							<div className="flex flex-wrap gap-2">
								{task.tags.map((tag) => (
									<span
										key={tag}
										className="px-2 py-1 bg-[#3d3a4b] rounded text-sm"
									>
										#{tag}
									</span>
								))}
							</div>
						</div>
					)}

					{task.contexts.length > 0 && (
						<div>
							<label className="text-sm font-semibold text-gray-400 block mb-1">
								Contexts
							</label>
							<div className="flex flex-wrap gap-2">
								{task.contexts.map((context) => (
									<span
										key={context}
										className="px-2 py-1 bg-[#3d3a4b] rounded text-sm"
									>
										@{context}
									</span>
								))}
							</div>
						</div>
					)}

					{Object.keys(task.custom).length > 0 && (
						<div>
							<label className="text-sm font-semibold text-gray-400 block mb-1">
								Custom Metadata
							</label>
							<div className="space-y-2">
								{Object.entries(task.custom).map(([key, values]) => (
									<div key={key}>
										<span className="text-sm text-gray-400">{key}:</span>{' '}
										<span className="text-sm">{values.join(', ')}</span>
									</div>
								))}
							</div>
						</div>
					)}

					<div>
						<label className="text-sm font-semibold text-gray-400 block mb-1">
							Original Text
						</label>
						<div className="text-sm text-gray-300 font-mono bg-[#1e1b26] p-2 rounded">
							{task.originalText}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TaskModal;
