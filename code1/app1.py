import os
from dotenv import load_dotenv
import streamlit as st
from groq import Groq
from langchain.chains import ConversationChain
from langchain.chains.conversation.memory import ConversationBufferWindowMemory
from langchain_groq import ChatGroq

load_dotenv()
groq_api_key = os.getenv('GROQ_API_KEY')

allowed_topics = [
    'math', 'science', 'history', 'literature', 'geography', 'languages',
    'physics', 'chemistry', 'biology', 'algebra', 'geometry', 'calculus',
    'computer science', 'electrical engineering', 'mechanical engineering',
    'civil engineering', 'chemical engineering', 'aerospace engineering',
    'biomedical engineering', 'software engineering', 'environmental engineering',
    'industrial engineering', 'materials science', 'nuclear engineering',
    'systems engineering', 'machine learning', 'artificial intelligence',
    'data science', 'deep learning', 'neural networks','graph theory','information technology'
]

def is_question_related_to_studies(question):
    for topic in allowed_topics:
        if topic in question.lower():
            return True
    return False

def main():
    st.title("Classroom Chatbot Assistant")
    st.sidebar.title('Select an LLM')
    model = st.sidebar.selectbox(
        'Choose a model',
        ['llama-3.1-70b-versatile']
    )
    conversational_memory_length = st.sidebar.slider('Conversational memory length:', 1, 10, value=5)
    memory = ConversationBufferWindowMemory(k=conversational_memory_length)
    user_question = st.text_area("Ask a question:")

    if 'chat_history' not in st.session_state:
        st.session_state.chat_history = []
    else:
        for message in st.session_state.chat_history:
            memory.save_context({'input': message['human']}, {'output': message['AI']})

    groq_chat = ChatGroq(
        groq_api_key=groq_api_key,
        model_name=model
    )
    conversation = ConversationChain(
        llm=groq_chat,
        memory=memory
    )

    if user_question:
        if is_question_related_to_studies(user_question):
            response = conversation(user_question)
            message = {'human': user_question, 'AI': response['response']}
            st.session_state.chat_history.insert(0, message)  
            st.write("Chatbot:", response['response'])
        else:
            st.write("Sorry, I can only answer questions related to students' studies. Please ask about topics like math, science, engineering, etc.")

    st.write("### Previous Q&A")
    for msg in st.session_state.chat_history:
        st.write(f"**You:** {msg['human']}")
        st.write(f"**Chatbot:** {msg['AI']}")

if __name__ == "__main__":
    main()
