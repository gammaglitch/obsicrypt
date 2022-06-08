import { FileType } from '../types/File';
import Task from './Task';

type FileOverviewProps = {
	files: FileType[];
};

const FileOverview = ({ files }: FileOverviewProps) => {
	return (
		<div>
			{files.map((file) => (
				<div>
					<div>{file.name}</div>
					<div>
						{file.tasks.map((task) => (
							<Task task={task} />
						))}
					</div>
				</div>
			))}
		</div>
	);
};

export default FileOverview;
