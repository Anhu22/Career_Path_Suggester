import { GoogleGenAI, Type } from "@google/genai";
import type { UserProfile, Career, CoverLetterOutline } from '../types';

// Initialize the Google GenAI client.
// The API key is expected to be available in the environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for a single career suggestion to ensure structured output from the AI model.
const careerSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    pros: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of advantages or positive aspects of this career."
    },
    cons: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of disadvantages or challenges of this career."
    },
    averageSalary: { type: Type.STRING, description: "An estimated average salary range, e.g., '$100,000 - $150,000 USD'." },
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of essential skills required for this role."
    },
    skillGapAnalysis: {
      type: Type.OBJECT,
      properties: {
        existingSkills: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Skills from the user's profile that are relevant to this career."
        },
        missingSkills: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Key skills required for this career that the user has not listed."
        },
      },
      required: ['existingSkills', 'missingSkills'],
    },
    careerRoadmap: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          step: { type: Type.INTEGER },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          resources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                url: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['article', 'video', 'book', 'course'] },
              },
              required: ['title', 'url', 'type'],
            },
          },
        },
        required: ['step', 'title', 'description', 'resources'],
      },
    },
    interviewQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          tip: { type: Type.STRING },
        },
        required: ['question', 'tip'],
      },
    },
    jobPostings: {
      type: Type.ARRAY,
      items: { type: Type.STRING, description: "A valid URL to a real, relevant job posting." },
    },
    projectIdeas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          skillsApplied: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['title', 'description', 'skillsApplied'],
      },
    },
  },
  required: [
    'title',
    'description',
    'pros',
    'cons',
    'averageSalary',
    'skills',
    'skillGapAnalysis',
    'careerRoadmap',
    'interviewQuestions',
    'jobPostings',
    'projectIdeas',
  ],
};

// Schema for the overall response containing a list of careers.
const suggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        careers: {
            type: Type.ARRAY,
            description: "An array of exactly 3 career suggestions.",
            items: careerSchema,
        },
    },
    required: ['careers'],
};

/**
 * Generates career suggestions based on a user's profile.
 * @param userProfile The user's profile information.
 * @returns A promise that resolves to an array of career suggestions.
 */
export const getCareerSuggestions = async (userProfile: UserProfile): Promise<Career[]> => {
  const prompt = `
    Based on the following user profile, please generate 3 diverse and personalized career path suggestions.

    User Profile:
    - Current Role: ${userProfile.currentRole}
    - Years of Experience: ${userProfile.yearsOfExperience}
    - Skills: ${userProfile.skills}
    - Interests: ${userProfile.interests}

    For each career suggestion, provide a comprehensive analysis including:
    - A clear title and detailed description of the role.
    - A balanced list of pros and cons.
    - An estimated average salary range (e.g., "$80,000 - $120,000 USD").
    - A list of all essential skills required for the role.
    - A skill gap analysis comparing the user's skills to the required skills, listing both 'existingSkills' and 'missingSkills'.
    - A step-by-step career roadmap for transitioning into this role, including actionable steps and for each step, a list of learning resources with title, URL, and type ('article', 'video', 'book', 'course').
    - A list of common interview questions with tips on how to answer them.
    - A list of 3 real example URLs for job postings for this role.
    - A list of 2-3 personalized project ideas that would help the user build relevant skills and a portfolio. Each project should have a title, a brief description, and a list of skills applied.

    The output must be a JSON object that strictly adheres to the provided schema. The 'careers' array must contain exactly 3 suggestions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: suggestionsSchema,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    if (result && result.careers && Array.isArray(result.careers)) {
        return result.careers as Career[];
    } else {
        console.error("Invalid response format from AI model:", result);
        throw new Error('Invalid response format from AI model.');
    }
  } catch (error) {
    console.error("Error generating career suggestions:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get career suggestions: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching career suggestions.');
  }
};

// Schema for the cover letter outline.
const coverLetterSchema = {
    type: Type.OBJECT,
    properties: {
        introduction: { 
            type: Type.STRING,
            description: "A compelling opening paragraph that introduces the user and their interest in the role."
        },
        body: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A series of paragraphs (as separate strings in the array) that connect the user's skills and experience to the job requirements."
        },
        conclusion: {
            type: Type.STRING,
            description: "A closing paragraph that reiterates interest and includes a call to action."
        }
    },
    required: ['introduction', 'body', 'conclusion'],
};

/**
 * Generates a cover letter outline based on a user's profile and a target career.
 * @param userProfile The user's profile information.
 * @param careerTitle The title of the career the user is interested in.
 * @returns A promise that resolves to a cover letter outline.
 */
export const getCoverLetterOutline = async (userProfile: UserProfile, careerTitle: string): Promise<CoverLetterOutline> => {
    const prompt = `
        Based on the user's profile and their interest in the "${careerTitle}" role, generate a structured outline for a compelling cover letter.

        User Profile:
        - Current Role: ${userProfile.currentRole}
        - Years of Experience: ${userProfile.yearsOfExperience}
        - Skills: ${userProfile.skills}
        - Interests: ${userProfile.interests}

        Target Role: ${careerTitle}

        The outline should consist of three parts:
        1.  **Introduction**: A compelling opening paragraph that introduces the user, states the position they are applying for, and briefly mentions their enthusiasm and a key qualification.
        2.  **Body**: 2-3 distinct paragraphs. Each paragraph should be a separate string in an array. These should highlight specific skills and experiences from the user's profile and connect them directly to the requirements of the target role. For example, one paragraph could focus on technical skills, and another on project experience or soft skills.
        3.  **Conclusion**: A strong closing paragraph that reiterates their interest in the role, expresses eagerness for an interview, and includes a call to action.

        The output must be a JSON object that strictly adheres to the provided schema.
    `;
    
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: coverLetterSchema,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    if (result && result.introduction && Array.isArray(result.body) && result.conclusion) {
        return result as CoverLetterOutline;
    } else {
        console.error("Invalid cover letter response format from AI model:", result);
        throw new Error('Invalid response format from AI model for cover letter.');
    }
  } catch (error) {
    console.error("Error generating cover letter outline:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate cover letter outline: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating cover letter outline.');
  }
};
