import torch
import streamlit as st
from transformers import pipeline

# -----------------------
# Page Config
# -----------------------
st.set_page_config(
    page_title="AI Career Path Generator",
    layout="wide",
    page_icon="🚀"
)

# -----------------------
# CSS for aesthetics
# -----------------------
st.markdown("""
<style>
body {
    background: linear-gradient(135deg, #f0f4ff, #e0f7fa);
}
.card {
    background-color: #ffffff;
    padding: 20px;
    margin: 10px 0;
    border-radius: 15px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.stButton>button {
    background-color: #4B0082;
    color: white;
    border-radius: 8px;
    height: 3em;
    width: 220px;
    font-size: 18px;
    margin: auto;
    display: block;
}
</style>
""", unsafe_allow_html=True)

# -----------------------
# Load Hugging Face Model
# -----------------------
@st.cache_resource
def load_generator():
    # use smaller, lightweight model for Streamlit Cloud
    return pipeline("text-generation", model="distilgpt2")

generator = load_generator()

# -----------------------
# Constants
# -----------------------
JOB_ROLES = [
    "Student","Software Engineer", "Data Scientist", "Product Manager", "Designer",
    "Marketing Specialist", "Sales Representative", "Customer Support",
    "Business Analyst", "DevOps Engineer", "QA Engineer"
]

# -----------------------
# Functions
# -----------------------
def get_career_suggestions(user_profile, num_careers=3):
    prompt = f"""
I am a {user_profile['yearsOfExperience']}-year experienced {user_profile['currentRole']} skilled in {user_profile['skills']}. 
My interests are {user_profile['interests']}. Suggest {num_careers} possible career paths. 
For each, provide a title, description, pros, cons, required skills, and a short roadmap.
"""
    result = generator(prompt, max_length=400, do_sample=True, temperature=0.9)
    text = result[0]['generated_text']

    careers = []
    for i in range(num_careers):
        careers.append({
            "title": f"Career Option {i+1}",
            "description": text,
            "pros": ["High demand", "Good salary"],
            "cons": ["Challenging", "Requires learning new skills"],
            "averageSalary": "N/A",
            "skills": user_profile['skills'].split(","),
            "skillGapAnalysis": {
                "existingSkills": user_profile['skills'].split(","),
                "missingSkills": ["Statistics", "Machine Learning"]
            },
            "careerRoadmap": [
                {"step": 1, "title": "Learn new skills", "description": "Focus on missing skills", 
                 "resources": [{"title": "Khan Academy", "url": "https://www.khanacademy.org", "type": "course"}]}
            ],
            "interviewQuestions": [{"question": "Tell me about yourself", "tip": "Keep it concise"}],
            "jobPostings": ["https://example.com/job1", "https://example.com/job2"],
            "projectIdeas": [{"title": "Example Project", "description": "Build something relevant", 
                              "skillsApplied": user_profile['skills'].split(",")}]
        })
    return {"careers": careers}

# -----------------------
# Session State
# -----------------------
if "page" not in st.session_state:
    st.session_state.page = "home"
if "user_profile" not in st.session_state:
    st.session_state.user_profile = {}
if "careers" not in st.session_state:
    st.session_state.careers = []
if "selected_career" not in st.session_state:
    st.session_state.selected_career = None
if "notes" not in st.session_state:
    st.session_state.notes = ""

# -----------------------
# Pages
# -----------------------
def home_page():
    st.markdown("<h1 style='text-align:center; color:#4B0082;'>AI Career Path Generator 🚀</h1>", unsafe_allow_html=True)
    st.markdown("<p style='text-align:center;'>Discover your perfect career path based on skills, experience, and interests.</p>", unsafe_allow_html=True)
    st.markdown("<br>", unsafe_allow_html=True)

    if st.button("Get Started"):
        st.session_state.page = "career_form"
        st.rerun()


def career_form_page():
    st.header("Career Path Finder 🧭")
    with st.form("career_form"):
        col1, col2 = st.columns(2)
        with col1:
            current_role = st.selectbox("Current or Most Recent Role", JOB_ROLES)
            years_of_experience = st.number_input("Years of Experience", min_value=0, step=1)
        with col2:
            skills = st.text_area("Your Skills (comma separated)", placeholder="e.g., Python, React")
            interests = st.text_area("Your Interests & Passions (comma separated)", placeholder="e.g., AI, Sustainable Energy")
        submitted = st.form_submit_button("Discover My Career Path")
        if submitted:
            st.session_state.user_profile = {
                "currentRole": current_role,
                "yearsOfExperience": years_of_experience,
                "skills": skills,
                "interests": interests
            }
            with st.spinner("Generating career suggestions..."):
                response = get_career_suggestions(st.session_state.user_profile)
                st.session_state.careers = response["careers"]
            st.session_state.page = "career_suggestions"
            st.rerun()


def career_suggestions_page():
    st.header("Career Suggestions 💼")
    st.markdown("<p style='text-align:center;'>Select a career to view its full roadmap and details.</p>", unsafe_allow_html=True)

    for idx, career in enumerate(st.session_state.careers):
        st.markdown(f"<div class='card'><h3>{career['title']}</h3><p>{career['description'][:200]}...</p></div>", unsafe_allow_html=True)
        if st.button(f"➡️ Choose Career {idx+1}", key=idx):
            st.session_state.selected_career = career
            st.session_state.page = "career_dashboard"
            st.rerun()


def career_dashboard_page():
    career = st.session_state.selected_career
    if not career:
        st.warning("No career selected! Please choose a career first.")
        st.session_state.page = "career_suggestions"
        st.rerun()
        return

    st.markdown(f"<h2 style='color:#4B0082;'>{career['title']}</h2>", unsafe_allow_html=True)
    st.write(career["description"])

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Pros")
        for pro in career["pros"]:
            st.write(f"- {pro}")
    with col2:
        st.subheader("Cons")
        for con in career["cons"]:
            st.write(f"- {con}")

    st.subheader("Skills Required")
    st.write(", ".join(career["skills"]))

    with st.expander("Skill Gap Analysis"):
        st.write("Existing Skills:", ", ".join(career["skillGapAnalysis"]["existingSkills"]))
        st.write("Missing Skills:", ", ".join(career["skillGapAnalysis"]["missingSkills"]))

    with st.expander("Career Roadmap"):
        for step in career["careerRoadmap"]:
            st.write(f"Step {step['step']}: {step['title']}")
            st.write(step["description"])
            for resource in step["resources"]:
                st.write(f"- [{resource['title']}]({resource['url']}) ({resource['type']})")

    with st.expander("Interview Questions"):
        for iq in career["interviewQuestions"]:
            st.write(f"Q: {iq['question']}")
            st.write(f"Tip: {iq['tip']}")

    with st.expander("Job Postings"):
        for job in career["jobPostings"]:
            st.write(f"- [Job Posting]({job})")

    with st.expander("Project Ideas"):
        for project in career["projectIdeas"]:
            st.write(f"Title: {project['title']}")
            st.write(project["description"])
            st.write("Skills Applied:", ", ".join(project["skillsApplied"]))

    st.markdown("---")
    st.header("📓 Notes")
    st.text_area("Write your notes here:", value=st.session_state.notes, key="notes_area", 
                 on_change=lambda: st.session_state.__setitem__('notes', st.session_state.notes_area))

    # Navigation buttons centered
    col1, col2 = st.columns([1,1])
    with col1:
        if st.button("← Back to Suggestions"):
            st.session_state.page = "career_suggestions"
            st.rerun()
    with col2:
        if st.button("🏠 Home"):
            st.session_state.page = "home"
            st.rerun()

# -----------------------
# Navigation
# -----------------------
if st.session_state.page == "home":
    home_page()
elif st.session_state.page == "career_form":
    career_form_page()
elif st.session_state.page == "career_suggestions":
    career_suggestions_page()
elif st.session_state.page == "career_dashboard":
    career_dashboard_page()
