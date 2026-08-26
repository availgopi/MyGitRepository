from app.rag.vector_store import create_vector_store

db = create_vector_store()

results = db.similarity_search(
    "SQL timeout in Payment API",
    k=3
)

print("\nTop Matches:\n")

for i, doc in enumerate(results, start=1):
    print(f"\nResult {i}")
    print(doc.page_content)