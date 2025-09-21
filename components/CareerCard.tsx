

import React, { useState, useMemo, useEffect } from 'react';
import type { Career, Page, LearningResource } from '../types';
import { 
    PlusCircleIcon, 
    DocumentTextIcon, 
    ChevronRightIcon, 
    ChevronDownIcon, 
    PlusIcon,
    ArticleIcon,
    BookOpenIcon,
    VideoIcon,
    BriefcaseIcon
} from './icons';

interface NotesDashboardProps {
  career: Career;
  onReset: () => void;
}

const getRandomEmoji = () => {
    const emojis = ['💡', '🚀', '📝', '🧠', '✨', '📚', '🎯', '📈'];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

const generateInitialPages = (career: Career): Page[] => {
    const pages: Page[] = [];
    const careerId = 'career_root';

    // 1. Root page for the career
    pages.push({
        id: careerId,
        icon: '🚀',
        title: career.title,
        content: `This is your dedicated workspace for pursuing a career as a ${career.title}. All the AI-generated guidance has been organized into pages for you. Feel free to edit, add notes, and track your progress.`,
        parentId: undefined,
    });

    // 2. Career Overview
    const overviewId = 'overview';
    pages.push({
        id: overviewId,
        icon: '🎯',
        title: 'Career Overview',
        content: `## Description\n${career.description}\n\n## Average Salary\n${career.averageSalary}\n\n## Pros\n${career.pros.map(p => `- ${p}`).join('\n')}\n\n## Cons\n${career.cons.map(c => `- ${c}`).join('\n')}`.trim(),
        parentId: careerId,
    });

    // 3. Skill Gap Analysis
    pages.push({
        id: 'skill_gap',
        icon: '🔧',
        title: 'Skill Gap Analysis',
        content: `## Your Existing Skills\n${career.skillGapAnalysis.existingSkills.length > 0 ? career.skillGapAnalysis.existingSkills.map(s => `- ${s}`).join('\n') : 'None specified that directly match.'}\n\n## Skills to Acquire\n${career.skillGapAnalysis.missingSkills.map(s => `- ${s}`).join('\n')}`.trim(),
        parentId: careerId,
    });
    
    // 4. Career Roadmap - This is now a dedicated view, not a parent of sub-pages.
    pages.push({
        id: 'roadmap',
        icon: '🗺️',
        title: 'Career Roadmap',
        content: 'This is your step-by-step guide to help you transition into this role. Each step includes a description and curated learning resources.',
        parentId: careerId,
    });

    // 5. Interview Prep
    pages.push({
        id: 'interview_prep',
        icon: '💬',
        title: 'Interview Prep',
        content: `## Common Interview Questions\n${career.interviewQuestions.map(q => `\n### ${q.question}\n**Tip:** ${q.tip}`).join('')}`.trim(),
        parentId: careerId,
    });

    // 6. Project Ideas
    pages.push({
        id: 'project_ideas',
        icon: '💡',
        title: 'Project Ideas',
        content: `## Portfolio Projects\nBuilding projects is a great way to learn and showcase your skills. Here are some ideas:\n${career.projectIdeas.map(p => `\n### ${p.title}\n${p.description}\n**Skills Applied:** ${p.skillsApplied.join(', ')}`).join('')}`.trim(),
        parentId: careerId,
    });

    // 7. Job Postings
    pages.push({
        id: 'job_postings',
        icon: '🔍',
        title: 'Job Postings',
        content: `## Example Job Postings\nHere are some links to real job postings to give you an idea of what employers are looking for:\n${career.jobPostings.map(url => `- [${url}](${url})`).join('\n')}`.trim(),
        parentId: careerId,
    });

    return pages;
}


const ResourceIcon = ({ type }: { type: LearningResource['type'] }) => {
    const commonProps = { className: "w-5 h-5 text-gray-500 flex-shrink-0" };
    switch (type) {
        case 'article':
            return <ArticleIcon {...commonProps} />;
        case 'video':
            return <VideoIcon {...commonProps} />;
        case 'book':
            return <BookOpenIcon {...commonProps} />;
        case 'course':
            return <BriefcaseIcon {...commonProps} />;
        default:
            return <DocumentTextIcon {...commonProps} />;
    }
};

const RoadmapView: React.FC<{ roadmap: Career['careerRoadmap'], careerTitle: string }> = ({ roadmap, careerTitle }) => {
    const [expandedSteps, setExpandedSteps] = useState<Set<number>>(() => {
        // Expand the first step by default
        return new Set(roadmap.length > 0 ? [roadmap[0].step] : []);
    });

    const toggleStep = (step: number) => {
        setExpandedSteps(prev => {
            const newSet = new Set(prev);
            if (newSet.has(step)) {
                newSet.delete(step);
            } else {
                newSet.add(step);
            }
            return newSet;
        });
    };

    return (
        <div className="max-w-3xl mx-auto h-full animate-fade-in">
            <div className="flex items-start mb-8">
                <span className="text-5xl mr-4">🗺️</span>
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900">Career Roadmap</h1>
                    <p className="text-lg text-gray-600 mt-1">
                        Your personalized step-by-step guide to becoming a {careerTitle}.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {roadmap.sort((a, b) => a.step - b.step).map((step) => {
                    const isExpanded = expandedSteps.has(step.step);
                    return (
                        <div key={step.step} className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300">
                            <button
                                onClick={() => toggleStep(step.step)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100/50 focus:outline-none focus:bg-gray-100"
                                aria-expanded={isExpanded}
                                aria-controls={`step-content-${step.step}`}
                            >
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 w-8 h-8 mr-4 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-bold">
                                        {step.step}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">{step.title}</h2>
                                </div>
                                <div className="transform transition-transform duration-200">
                                  {isExpanded ? <ChevronDownIcon className="w-6 h-6 text-gray-500" /> : <ChevronRightIcon className="w-6 h-6 text-gray-500" />}
                                </div>
                            </button>
                            {isExpanded && (
                                <div id={`step-content-${step.step}`} className="px-6 pb-6 pt-2 animate-fade-in">
                                    <p className="text-gray-600 mb-6 pl-12">{step.description}</p>
                                    
                                    {step.resources && step.resources.length > 0 && (
                                        <div className="pl-12">
                                            <h3 className="font-semibold text-gray-800 mb-3">Learning Resources</h3>
                                            <ul className="space-y-3">
                                                {step.resources.map(resource => (
                                                    <li key={resource.url} className="flex items-start group">
                                                         <div className="mt-1 mr-3">
                                                            <ResourceIcon type={resource.type} />
                                                        </div>
                                                        <div>
                                                            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline group-hover:text-blue-500 transition-colors">
                                                                {resource.title}
                                                            </a>
                                                            <span className="text-gray-500 text-sm block capitalize">{resource.type}</span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export const NotesDashboard: React.FC<NotesDashboardProps> = ({ career, onReset }) => {
  const [pages, setPages] = useState<Page[]>(() => generateInitialPages(career));
  const [activePageId, setActivePageId] = useState<string>('overview');
  const [expandedPages, setExpandedPages] = useState<Set<string>>(() => new Set(['career_root']));

  // Reset the state if a new career is selected while the component is already mounted.
  useEffect(() => {
    setPages(generateInitialPages(career));
    setActivePageId('overview'); // Set a sensible default active page
    setExpandedPages(new Set(['career_root']));
  }, [career]);

  const activePage = useMemo(() => pages.find(p => p.id === activePageId), [pages, activePageId]);
  
  const breadcrumbs = useMemo(() => {
    const trail: Page[] = [];
    if (!activePageId) return trail;
    
    let currentPage = pages.find(p => p.id === activePageId);
    while(currentPage) {
        trail.unshift(currentPage);
        currentPage = pages.find(p => p.id === currentPage?.parentId);
    }
    return trail;
  }, [activePageId, pages]);

  const handleAddNewPage = (parentId?: string) => {
    const newPage: Page = {
        id: Date.now().toString(),
        icon: getRandomEmoji(),
        title: 'Untitled',
        content: '',
        parentId,
    };
    setPages(prev => [...prev, newPage]);
    setActivePageId(newPage.id);
    if (parentId) {
        setExpandedPages(prev => new Set(prev).add(parentId));
    }
  };
  
  const handleToggleExpand = (pageId: string) => {
    setExpandedPages(prev => {
        const newSet = new Set(prev);
        if (newSet.has(pageId)) {
            newSet.delete(pageId);
        } else {
            newSet.add(pageId);
        }
        return newSet;
    });
  };

  const handlePageChange = (field: 'title' | 'content', value: string) => {
    if (!activePageId) return;

    setPages(pages.map(p => 
        p.id === activePageId ? { ...p, [field]: value } : p
    ));
  };

  const renderPageTree = (parentId?: string) => {
    const children = pages.filter(p => p.parentId === parentId);

    return children.map(page => {
        const hasChildren = pages.some(p => p.parentId === page.id);
        const isExpanded = expandedPages.has(page.id);

        return (
            <div key={page.id}>
                <div
                    className="group w-full flex items-center text-left rounded-md text-sm font-medium transition-colors my-1 pr-2"
                >
                    <div className={`flex items-center flex-grow truncate rounded-md ${
                            activePageId === page.id 
                            ? 'bg-blue-100' 
                            : 'hover:bg-gray-200'
                        }`}>
                        
                        <button 
                            onClick={() => hasChildren && handleToggleExpand(page.id)}
                            className={`p-1 rounded-md hover:bg-gray-300 ${!hasChildren && 'invisible'}`}
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                            {isExpanded ? <ChevronDownIcon className="w-4 h-4 text-gray-500"/> : <ChevronRightIcon className="w-4 h-4 text-gray-500"/>}
                        </button>

                        <button
                            onClick={() => setActivePageId(page.id)}
                            className="flex items-center flex-grow pl-1 py-1.5"
                        >
                            <span className="mr-2 text-lg">{page.icon}</span>
                            <span className={`truncate ${activePageId === page.id ? 'text-blue-800 font-semibold' : 'text-gray-700'}`}>{page.title || 'Untitled'}</span>
                        </button>

                        <button
                            onClick={() => handleAddNewPage(page.id)}
                            className="ml-auto p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-300 transition-opacity"
                            aria-label="Add sub-page"
                        >
                            <PlusIcon className="w-4 h-4 text-gray-500"/>
                        </button>
                    </div>
                </div>
                {hasChildren && isExpanded && <div className="pl-4">{renderPageTree(page.id)}</div>}
            </div>
        )
    })
  }
  
  return (
    <div className="w-full h-[calc(100vh-4rem)] max-w-7xl mx-auto bg-white rounded-lg shadow-xl flex animate-fade-in border border-gray-200">
        {/* Sidebar */}
        <aside className="w-72 bg-gray-50 p-4 border-r border-gray-200 flex flex-col">
            <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">{career.title}</h2>
                <p className="text-sm text-gray-600">Workspace</p>
            </div>

            <nav className="flex-grow space-y-0.5 overflow-y-auto -mr-2 pr-2">
                {renderPageTree(undefined)}
            </nav>

            <button
                onClick={() => handleAddNewPage()}
                className="w-full flex items-center justify-center px-4 py-2 mt-2 text-sm text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
            >
                <PlusCircleIcon className="w-5 h-5 mr-2"/>
                Add a new page
            </button>
             <button
                onClick={onReset}
                className="w-full mt-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
                Start Over
            </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 md:p-12 overflow-y-auto">
            {activePage ? (
                activePage.id === 'roadmap' ? (
                    <RoadmapView roadmap={career.careerRoadmap} careerTitle={career.title} />
                ) : (
                    <div className="h-full flex flex-col max-w-3xl mx-auto">
                         {breadcrumbs.length > 1 && (
                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                {breadcrumbs.slice(0, -1).map((page) => (
                                    <React.Fragment key={page.id}>
                                        <button onClick={() => setActivePageId(page.id)} className="hover:text-gray-900 truncate max-w-[150px]">{page.title || 'Untitled'}</button>
                                        <ChevronRightIcon className="w-4 h-4 mx-1 flex-shrink-0" />
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                         <div className="mb-8">
                            <span className="text-5xl">{activePage.icon}</span>
                        </div>
                        <input
                            type="text"
                            value={activePage.title}
                            onChange={(e) => handlePageChange('title', e.target.value)}
                            placeholder="Untitled"
                            className="text-4xl font-extrabold bg-transparent border-none focus:ring-0 p-0 w-full mb-4 text-gray-900 placeholder-gray-400"
                        />
                        <textarea
                            value={activePage.content}
                            onChange={(e) => handlePageChange('content', e.target.value)}
                            placeholder="Start writing your notes here..."
                            className="flex-grow bg-transparent border-none focus:ring-0 p-0 w-full text-lg text-gray-700 placeholder-gray-500 resize-none"
                        />
                    </div>
                )
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <DocumentTextIcon className="w-16 h-16 mb-4"/>
                    <h3 className="text-2xl font-semibold">Select a page</h3>
                    <p>Choose a page from the sidebar or create a new one to get started.</p>
                </div>
            )}
        </main>
    </div>
  );
};