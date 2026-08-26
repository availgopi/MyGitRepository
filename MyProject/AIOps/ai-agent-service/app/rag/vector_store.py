from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from app.rag.document_loader import load_documents
from config import GOOGLE_API_KEY


def create_vector_store():

    documents = load_documents()

    embeddings = GoogleGenerativeAIEmbeddings(
        model="gemini-embedding-001",
        google_api_key=GOOGLE_API_KEY
    )

    vector_db = Chroma.from_documents(
        documents,
        embeddings,
        persist_directory="./chroma_db"
    )

    return vector_db