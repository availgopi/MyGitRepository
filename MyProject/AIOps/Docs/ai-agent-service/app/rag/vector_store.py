from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

from app.rag.document_loader import load_documents


def create_vector_store():

    documents = load_documents()

    embeddings = HuggingFaceEmbeddings(
                     model_name="all-MiniLM-L6-v2"
                                       )
    
    vector_db = Chroma.from_documents(
        documents,
        embeddings,
        persist_directory="./chroma_db"
    )

    return vector_db