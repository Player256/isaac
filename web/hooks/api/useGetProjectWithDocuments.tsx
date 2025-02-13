import { TextDocument, useGetDocuments } from '@hooks/api/useGetDocuments';
import { Project, useGetProjects } from '@hooks/api/useGetProjects';
import useGetEditorRouter from '@hooks/useGetEditorRouter';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

interface ProjectDocuments extends Project {
	documents: TextDocument[];
}

interface ReturnProps {
	projects: Project[];
	projectDocuments: ProjectDocuments[] | undefined;
	isLoading: boolean;
	currentProjectDocuments: ProjectDocuments | undefined;
}

const useGetProjectWithDocuments = (): ReturnProps => {
	const { projectId: currentProjectId } = useGetEditorRouter();
	const [projectDocuments, setProjectDocuments] = useState<ProjectDocuments[]>(
		[],
	);

	const { data: documents, isLoading: isGetDocumentsLoading, isError } =
		useGetDocuments();
	const { data: projects, isLoading: isGetProjectsLoading, isError: projectsError } = useGetProjects();

	if (isError) {
		toast.error('Error fetching project documents');
	}

	if (projectsError) {
		toast.error("Error loading projects");
	}

	useEffect(() => {
		if (projects?.length && documents?.length) {
			const _projectDocuments = projects.map(project => ({
				...project,
				documents: documents.filter(
					document => document.projectId === project.id,
				),
			}));
			setProjectDocuments(_projectDocuments);
		}
	}, [projects, documents]);

	const currentProjectDocuments = useMemo(() => {
		return projectDocuments?.find(item => item.id === currentProjectId);
	}, [projectDocuments, currentProjectId]);

	return {
		projects,
		projectDocuments,
		isLoading: isGetDocumentsLoading || isGetProjectsLoading,
		currentProjectDocuments,
	};
};

export default useGetProjectWithDocuments;
