from langchain_community.document_loaders import TextLoader

def load_documents():
    loader = TextLoader ( "documents/Database_Runbook.txt"  )
    documents = loader.load()

    return documents