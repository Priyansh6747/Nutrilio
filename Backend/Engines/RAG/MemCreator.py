import os

from langchain_community.document_loaders import PyPDFLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Load PDFs from directory
DATA_PATH = "Data/"

def load_pdf_from_directory(directory: str):
    documents = []
    for file in os.listdir(directory):
        if file.lower().endswith(".pdf"):
            pdf_path = os.path.join(directory, file)
            try:
                loader = PyPDFLoader(pdf_path)
                docs = loader.load()
                documents.extend(docs)
                print(f"✅ Successfully loaded: {file} ({len(docs)} pages)")
            except Exception as e:
                print(f"❌ Error loading {file}: {e}")
    return documents

# Split documents into chunks
def create_chunks(data, chunk_size=500, overlap=50):
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=overlap)
    chunks = splitter.split_documents(data)
    print(f"📚 Created {len(chunks)} text chunks.")
    return chunks

documents = load_pdf_from_directory(DATA_PATH)
text_chunks = create_chunks(documents, chunk_size=500)

# Create embedding model
def get_embedding_model():
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

embedding_model = get_embedding_model()


if __name__ == "__main__":
    DB_FAISS_PATH = "vectorstore/db_faiss"
    try:
        db = FAISS.from_documents(text_chunks, embedding_model)
        db.save_local(DB_FAISS_PATH)
        print(f"✅ FAISS vector store saved at: {DB_FAISS_PATH}")
    except Exception as e:
        print(f"❌ Failed to create FAISS store: {e}")