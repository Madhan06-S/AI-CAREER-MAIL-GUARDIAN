import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.config import settings

logger = logging.getLogger("ai_mail_guardian")

# In-memory database store for development mock mode
_mock_db: Dict[str, Dict[str, Dict[str, Any]]] = {}

from app.utils.auth import init_firebase

class FirestoreService:
    def __init__(self):
        self.db = None
        if settings.FIREBASE_PROJECT_ID:
            try:
                init_firebase()
                from firebase_admin import firestore
                self.db = firestore.client()
                logger.info("Firestore client initialized successfully.")
            except Exception as e:
                logger.warning(f"Could not initialize Firestore client: {e}")

    def _get_user_doc_ref(self, uid: str, collection_name: str, doc_id: str):
        """Constructs strictly scoped user document reference: users/{uid}/{collection_name}/{doc_id}"""
        if not uid:
            raise ValueError("Firestore Error: uid must be provided for user-isolated queries.")
        if self.db:
            return self.db.collection("users").document(uid).collection(collection_name).document(doc_id)
        return None

    def _get_user_collection_ref(self, uid: str, collection_name: str):
        """Constructs strictly scoped user collection reference: users/{uid}/{collection_name}"""
        if not uid:
            raise ValueError("Firestore Error: uid must be provided for user-isolated queries.")
        if self.db:
            return self.db.collection("users").document(uid).collection(collection_name)
        return None

    async def save_document(self, uid: str, collection_name: str, doc_id: str, data: Dict[str, Any]) -> bool:
        """Saves a document under users/{uid}/{collection_name}/{doc_id}"""
        data["updated_at"] = datetime.utcnow().isoformat()
        
        if self.db:
            try:
                doc_ref = self._get_user_doc_ref(uid, collection_name, doc_id)
                doc_ref.set(data, merge=True)
                return True
            except Exception as e:
                logger.error(f"Firestore set error for {collection_name}/{doc_id}: {e}")
                if settings.APP_ENV == "production":
                    raise e
        
        # Dev mock storage
        if settings.USE_MOCK_SERVICES:
            if uid not in _mock_db:
                _mock_db[uid] = {}
            if collection_name not in _mock_db[uid]:
                _mock_db[uid][collection_name] = {}
            
            existing = _mock_db[uid][collection_name].get(doc_id, {})
            existing.update(data)
            _mock_db[uid][collection_name][doc_id] = existing
            return True
            
        return False

    async def get_document(self, uid: str, collection_name: str, doc_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a document under users/{uid}/{collection_name}/{doc_id}"""
        if self.db:
            try:
                doc_ref = self._get_user_doc_ref(uid, collection_name, doc_id)
                doc = doc_ref.get()
                if doc.exists:
                    return doc.to_dict()
                return None
            except Exception as e:
                logger.error(f"Firestore get error for {collection_name}/{doc_id}: {e}")
                if settings.APP_ENV == "production":
                    raise e

        # Dev mock storage
        if settings.USE_MOCK_SERVICES:
            return _mock_db.get(uid, {}).get(collection_name, {}).get(doc_id)
            
        return None

    async def list_documents(self, uid: str, collection_name: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Lists documents under users/{uid}/{collection_name}"""
        if self.db:
            try:
                col_ref = self._get_user_collection_ref(uid, collection_name)
                docs = col_ref.limit(limit).stream()
                return [doc.to_dict() for doc in docs]
            except Exception as e:
                logger.error(f"Firestore list error for {collection_name}: {e}")
                if settings.APP_ENV == "production":
                    raise e

        # Dev mock storage
        if settings.USE_MOCK_SERVICES:
            items = list(_mock_db.get(uid, {}).get(collection_name, {}).values())
            return items[:limit]
            
        return []

    async def delete_document(self, uid: str, collection_name: str, doc_id: str) -> bool:
        """Deletes a document under users/{uid}/{collection_name}/{doc_id}"""
        if self.db:
            try:
                doc_ref = self._get_user_doc_ref(uid, collection_name, doc_id)
                doc_ref.delete()
                return True
            except Exception as e:
                logger.error(f"Firestore delete error for {collection_name}/{doc_id}: {e}")
                if settings.APP_ENV == "production":
                    raise e

        # Dev mock storage
        if settings.USE_MOCK_SERVICES:
            if uid in _mock_db and collection_name in _mock_db[uid]:
                _mock_db[uid][collection_name].pop(doc_id, None)
                return True
        return False

firestore_service = FirestoreService()
