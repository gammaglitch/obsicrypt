import { FileType } from '../types/File';
import { TaskType } from '../types/Task';
import Task from './Task';

type FileOverviewProps = {
	files: FileType[];
	toggleTask: (file: FileType, task: TaskType) => void;
};

const FileOverview = ({ files, toggleTask }: FileOverviewProps) => {
	return (
		<div>
			{files.map((file) => (
				<div>
					<div>{file.name}</div>
					<div>
						{file.tasks.map((task) => (
							<Task task={task} toggleTask={(task) => toggleTask(file, task)} />
						))}
					</div>
				</div>
			))}
		</div>
	);
};

export default FileOverview;
