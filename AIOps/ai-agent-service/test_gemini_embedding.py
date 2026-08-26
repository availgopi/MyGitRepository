import os

from langchain_google_genai import GoogleGenerativeAIEmbeddings


def main():

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set.")

    embeddings = GoogleGenerativeAIEmbeddings(
        model="gemini-embedding-001",
        google_api_key=api_key
    )

    text = "SQL connection pool exhaustion in Payment API"

    vector = embeddings.embed_query(text)

    print("Embedding generated successfully.")
    print("Vector type:", type(vector))
    print("Vector dimension:", len(vector))
    print("First 5 values:", vector[:5])


if __name__ == "__main__":
    main()