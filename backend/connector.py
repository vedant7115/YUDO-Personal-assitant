import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

class SupabaseConnector:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL", "")
        key = os.environ.get("SUPABASE_KEY", "")
        
        # Validating URL cleanly avoids client crashes
        if url and url.startswith("http") and key and not "Replace_This" in key:
            try:
                self.client: Client = create_client(url, key)
                self.is_connected = True
                print("Successfully connected to Supabase Database!")
            except Exception as e:
                print(f"Auth configuration failed: {e}")
                self.client = None
                self.is_connected = False
        else:
            self.client = None
            self.is_connected = False
            print("Warning: Valid SUPABASE_URL or SUPABASE_KEY not found. Running in mock mode.")

    def get_documents(self):
        if self.is_connected:
            response = self.client.table("documents").select("*").execute()
            return response.data
        return [{"id": "1", "name": "Resume.pdf", "status": "Mock DB"}]

    def get_chat_history(self):
        if self.is_connected:
            response = self.client.table("chat_history").select("*").execute()
            return response.data
        return [{"id": "1", "message": "Hello YUDO", "response": "Hello! How can I assist you today?"}]

db_connector = SupabaseConnector()
