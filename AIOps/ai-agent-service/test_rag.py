from app.rag.vector_store import create_vector_store

db = create_vector_store()

results = db.similarity_search("SQL connection timeout")

for doc in results:
    print(doc.page_content)