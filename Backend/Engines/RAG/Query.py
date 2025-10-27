import os

from dotenv import load_dotenv
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.history_aware_retriever import create_history_aware_retriever
from langchain.memory import ConversationBufferMemory
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=API_KEY,
    temperature=0.7,
    max_tokens=512,
    convert_system_message_to_human=True
)

# Step 2: Initialize embeddings and vectorstore
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
DB_FAISS_PATH = "vectorstore/db_faiss"
vectorstore = FAISS.load_local(
    DB_FAISS_PATH,
    embeddings,
    allow_dangerous_deserialization=True
)
retriever = vectorstore.as_retriever()

# Step 3: Create corrected prompt templates
# Contextualize question based on chat history - FIXED VERSION
history_aware_prompt = ChatPromptTemplate.from_messages([
    MessagesPlaceholder(variable_name="chat_history"),
    ("user", "{input}"),
    ("user", "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation")
])

# Alternative simpler version if the above doesn't work:
# history_aware_prompt = ChatPromptTemplate.from_messages([
#     ("system", "Given a conversation history and a follow up question, rephrase the follow up question to be a standalone question that contains all the context needed to understand it."),
#     MessagesPlaceholder(variable_name="chat_history"),
#     ("human", "{input}"),
# ])

# Main QA prompt
qa_prompt = ChatPromptTemplate.from_messages([
    ("system",
     "You are a helpful assistant. Use the following context to answer the question. If you don't know the answer, say you don't know. Keep your answer concise but thorough.\n\nContext:\n{context}"),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}"),
])

# Step 4: Create the chains
# Chain that uses history to improve the retrieval query
history_aware_retriever = create_history_aware_retriever(
    llm, retriever, history_aware_prompt
)

# Chain that processes the retrieved documents and generates answer
question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)

# Combine into final retrieval chain
retrieval_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)

# Step 5: Create memory and session management
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True,
    output_key="answer"
)

# Store conversation history
conversation_history = {}

def get_session_history(session_id: str):
    """Get or create session history"""
    if session_id not in conversation_history:
        conversation_history[session_id] = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            output_key="answer"
        )
    return conversation_history[session_id]

# Function to query the chain with memory - FIXED VERSION
def query_chain(question, session_id="default"):
    # Get session-specific memory
    session_memory = get_session_history(session_id)

    # Get current chat history
    chat_history = session_memory.load_memory_variables({})["chat_history"]

    # Invoke the chain - use "input" instead of "question" for the history_aware_retriever
    response = retrieval_chain.invoke({
        "input": question,  # Changed from "question" to "input"
        "chat_history": chat_history
    })

    # Save the conversation to memory
    session_memory.save_context(
        {"input": question},  # Changed from "question" to "input"
        {"answer": response["answer"]}
    )

    return response["answer"]

# Test the chain with a sample question
if __name__ == "__main__":
    sample_question = "According to the Indian Council of Medical Research (ICMR), what is the recommended daily protein intake for adult women?"
    print("\nQuestion:", sample_question)
    print("\nAnswer:", query_chain(sample_question))

    follow_up_question = "Based on that intake, how much protein should a 60 kg woman aim for daily?"
    print("\nQuestion:", follow_up_question)
    print("\nAnswer:", query_chain(follow_up_question))