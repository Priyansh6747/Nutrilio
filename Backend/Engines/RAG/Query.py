import os
from typing import Dict, List

from dotenv import load_dotenv
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.history_aware_retriever import create_history_aware_retriever
from langchain_community.vectorstores import FAISS
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings


load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")


llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=API_KEY,
    temperature=0.3,
    max_tokens=1024,
    convert_system_message_to_human=True
)

print("Loading embeddings and vector store...")
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
DB_FAISS_PATH = "vectorstore/db_faiss"

try:
    vectorstore = FAISS.load_local(
        DB_FAISS_PATH,
        embeddings,
        allow_dangerous_deserialization=True
    )
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5}
    )
    print("✅ Vector store loaded successfully")
except Exception as e:
    print(f"❌ Error loading vector store: {e}")
    raise

history_aware_prompt = ChatPromptTemplate.from_messages([
    ("system", """Given the chat history and the latest user question, rephrase the question to be standalone.
    Include all necessary context from the chat history.
    If the question is already clear and standalone, return it as is.
    Do not answer the question, only reformulate it if needed."""),
    MessagesPlaceholder(variable_name="chat_history"),
    ("user", "{input}"),
])

qa_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a knowledgeable assistant specializing in Indian dietary guidelines and nutrition.

**Your Task:**
1. **If relevant context is provided below:** Use it to answer the user's question accurately and comprehensively.
   - Base your answer strictly on the provided context
   - Cite specific information from the guidelines when applicable
   - Be specific about recommendations, measurements, and guidelines

2. **If the context is empty, irrelevant, or doesn't contain information to answer the question:**
   - Clearly state: "I don't have specific information about that in the ICMR dietary guidelines I have access to."
   - Provide a helpful general response based on common nutritional knowledge if appropriate
   - Suggest related topics that might be helpful
   - Encourage the user to consult healthcare professionals for personalized advice

**Guidelines:**
- Always be honest about the limitations of available information
- Never make up information or citations
- Keep responses clear, concise, and actionable
- Use a friendly and professional tone
- If asked about specific measurements or recommendations, provide exact values from the context

**Context Information:**
{context}

---

If no relevant context is found above, inform the user politely and provide general guidance where appropriate."""),
    MessagesPlaceholder(variable_name="chat_history"),
    ("user", "{input}"),
])


print("Creating retrieval chains")
history_aware_retriever = create_history_aware_retriever(
    llm, retriever, history_aware_prompt
)

question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
retrieval_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)


def query_chain(
        question: str,
        chat_history: List = None,
        verbose: bool = False
) -> Dict[str, any]:
    try:
        if chat_history is None:
            chat_history = []

        if verbose:
            print(f"\n🔍 Processing question: {question}")
            print(f"📝 Chat history length: {len(chat_history)}")


        response = retrieval_chain.invoke({
            "input": question,
            "chat_history": chat_history
        })


        answer = response.get("answer", "I apologize, but I couldn't generate a response.")
        context_docs = response.get("context", [])

        if verbose:
            print(f"\n📄 Retrieved {len(context_docs)} documents")
            if context_docs:
                print("📝 Context snippets:")
                for i, doc in enumerate(context_docs[:2], 1):
                    content_preview = doc.page_content[:200].replace('\n', ' ')
                    print(f"  {i}. {content_preview}...")
            else:
                print("  ⚠️ No relevant context found")

        return {
            "answer": answer,
            "context": context_docs,
            "num_docs": len(context_docs)
        }

    except Exception as e:
        error_msg = f"An error occurred while processing your question: {str(e)}"
        print(f"❌ {error_msg}")
        return {
            "answer": error_msg,
            "context": [],
            "num_docs": 0
        }

def chatbot(
        question: str,
        chat_history: List = None,
) -> Dict[str, any]:
    return query_chain(question, chat_history, False)

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("Testing RAG System with Sample Questions")
    print("=" * 70)

    # Initialize chat history
    history = []

    # Test 1: First question
    q1 = "What is the recommended daily protein intake for adult women according to ICMR?"
    print(f"\n❓ Question 1: {q1}")
    result1 = query_chain(q1, chat_history=history, verbose=True)
    print(f"\n💬 Answer:\n{result1['answer']}")

    # Add to history
    history.append(HumanMessage(content=q1))
    history.append(AIMessage(content=result1['answer']))

    # Test 2: Follow-up question (uses history)
    q2 = "How much protein should a 60 kg woman consume daily?"
    print(f"\n❓ Question 2: {q2}")
    result2 = query_chain(q2, chat_history=history, verbose=True)
    print(f"\n💬 Answer:\n{result2['answer']}")

    # Add to history
    history.append(HumanMessage(content=q2))
    history.append(AIMessage(content=result2['answer']))

    # Test 3: Question without context
    q3 = "What is the best diet for marathon training?"
    print(f"\n❓ Question 3: {q3}")
    result3 = query_chain(q3, chat_history=history, verbose=True)
    print(f"\n💬 Answer:\n{result3['answer']}")

    print("\n" + "=" * 70)