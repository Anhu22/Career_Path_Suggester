
export interface UserProfile {
  currentRole: string;
  yearsOfExperience: number;
  skills: string;
  interests: string;
}

export interface LearningResource {
  title: string;
  url: string;
  type: 'article' | 'video' | 'book' | 'course';
}

export interface RoadmapStep {
    step: number;
    title: string;
    description: string;
    resources: LearningResource[];
}

export interface InterviewQuestion {
    question: string;
    tip: string;
}

export interface SkillGapAnalysis {
    existingSkills: string[];
    missingSkills: string[];
}

export interface ProjectIdea {
  title: string;
  description: string;
  skillsApplied: string[];
}

export interface Career {
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  averageSalary: string;
  skills: string[]; // All required skills
  skillGapAnalysis: SkillGapAnalysis;
  careerRoadmap: RoadmapStep[];
  interviewQuestions: InterviewQuestion[];
  jobPostings: string[]; // URLs
  projectIdeas: ProjectIdea[];
}

export interface CoverLetterOutline {
  introduction: string;
  body: string[];
  conclusion:string;
}

export interface ApiError {
  message: string;
}

export interface Page {
  id: string;
  icon: string;
  title: string;
  content: string;
  parentId?: string;
}