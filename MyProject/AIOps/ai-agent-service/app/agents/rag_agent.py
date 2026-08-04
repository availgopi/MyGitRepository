from app.rag.vector_store import create_vector_store

vector_db = create_vector_store()

def retrive_knowledge(state):
   
    issue = state["log"]
   
    results = vector_db.similarity_search(
        issue,
        k=1
    )

    knowledge = "\n\n".join([doc.page_content for doc in results])
    state["knowledge"] = knowledge

    return state