import os
from typing import List

from langchain_community.document_loaders import PyPDFLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


DATA_PATH = "Data/"
DB_FAISS_PATH = "vectorstore/db_faiss"
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


def load_pdf_from_directory(directory: str) -> List[Document]:
    if not os.path.exists(directory):
        print(f"❌ Directory not found: {directory}")
        return []

    documents = []
    pdf_files = [f for f in os.listdir(directory) if f.lower().endswith(".pdf")]

    if not pdf_files:
        print(f"⚠️ No PDF files found in {directory}")
        return []

    print(f"\n📂 Found {len(pdf_files)} PDF file(s)")

    for file in pdf_files:
        pdf_path = os.path.join(directory, file)
        try:
            loader = PyPDFLoader(pdf_path)
            docs = loader.load()
            for doc in docs:
                doc.metadata['source_file'] = file

            documents.extend(docs)
            print(f"✅ Loaded: {file} ({len(docs)} pages)")
        except Exception as e:
            print(f"❌ Error loading {file}: {e}")

    print(f"\n📄 Total pages loaded: {len(documents)}")
    return documents


def create_chunks(
        documents: List[Document],
        chunk_size: int = CHUNK_SIZE,
        chunk_overlap: int = CHUNK_OVERLAP
) -> List[Document]:
    if not documents:
        print("⚠️ No documents to chunk")
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )

    chunks = splitter.split_documents(documents)
    print(f"📚 Created {len(chunks)} text chunks")
    print(f"   └─ Avg chunk size: {sum(len(c.page_content) for c in chunks) // len(chunks)} chars")

    return chunks


def get_embedding_model():
    print(f"\n🔧 Loading embedding model: {EMBEDDING_MODEL}")
    return HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)


def create_vector_store(chunks: List[Document], embeddings, save_path: str) -> FAISS:
    if not chunks:
        raise ValueError("No chunks provided to create vector store")

    print(f"\n🔄 Creating FAISS vector store (this may take a while)...")

    batch_size = 100
    db = None

    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        print(f"   Processing batch {i // batch_size + 1}/{(len(chunks) - 1) // batch_size + 1}")

        if db is None:
            db = FAISS.from_documents(batch, embeddings)
        else:
            batch_db = FAISS.from_documents(batch, embeddings)
            db.merge_from(batch_db)

    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    db.save_local(save_path)
    print(f"✅ FAISS vector store saved at: {save_path}")

    return db


def test_vector_store(db: FAISS, query: str = "protein intake"):
    print(f"\n🔍 Testing vector store with query: '{query}'")
    results = db.similarity_search(query, k=3)

    print(f"   Found {len(results)} relevant documents:")
    for i, doc in enumerate(results, 1):
        preview = doc.page_content[:150].replace('\n', ' ')
        print(f"\n   {i}. {preview}...")
        print(f"      Source: {doc.metadata.get('source_file', 'Unknown')}, "
              f"Page: {doc.metadata.get('page', 'N/A')}")


def main():
    """Main execution pipeline"""
    print("\n" + "=" * 60)
    print("PDF Ingestion and Vector Store Creation Pipeline")
    print("=" * 60)

    # Step 1: Load PDFs
    print("\n[STEP 1] Loading PDF documents...")
    documents = load_pdf_from_directory(DATA_PATH)

    if not documents:
        print("\n❌ No documents loaded. Exiting.")
        return

    # Step 2: Create chunks
    print("\n[STEP 2] Creating text chunks...")
    text_chunks = create_chunks(documents, chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)

    if not text_chunks:
        print("\n❌ No chunks created. Exiting.")
        return

    # Step 3: Initialize embeddings
    print("\n[STEP 3] Initializing embedding model...")
    embedding_model = get_embedding_model()

    # Step 4: Create and save vector store
    print("\n[STEP 4] Creating vector store...")
    try:
        db = create_vector_store(text_chunks, embedding_model, DB_FAISS_PATH)

        # Step 5: Test the vector store
        print("\n[STEP 5] Testing vector store...")
        test_vector_store(db)

        print("\n" + "=" * 60)
        print("✅ Pipeline completed successfully!")
        print("=" * 60)
        print(f"\nVector store statistics:")
        print(f"  • Total documents processed: {len(documents)}")
        print(f"  • Total chunks created: {len(text_chunks)}")
        print(f"  • Storage location: {DB_FAISS_PATH}")

    except Exception as e:
        print(f"\n❌ Failed to create vector store: {e}")
        raise


if __name__ == "__main__":
    main()