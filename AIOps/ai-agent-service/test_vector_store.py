from app.rag.vector_store import create_vector_store

print("Creating vector store...")

db = create_vector_store()

print("Vector store created successfully.")

print("Collection count:", db._collection.count())