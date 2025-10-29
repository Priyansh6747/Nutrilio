"""
whats in this file
main idea functions to create this pipline

step 1
retrive history if present
check if the chat subcollection exist if not create it and return []
else retrive last 7 msgs as context

step 2
Get result
ans = chatbot(Query, chat_history)

step 3
store the query and result in db and return the answer


Additional funcs

"""
from datetime import datetime
from typing import Dict, List, Optional

from langchain_core.messages import HumanMessage, AIMessage

from Config import firestoreDB
from Engines.RAG.Query import chatbot


class ChatHistoryPipeline:

    def __init__(self, db=None):
        self.db = db or firestoreDB
        self.collection_name = "users"
        self.subcollection_name = "chat_history"
        self.history_limit = 7

    def _get_chat_ref(self, user_id: str):
        return (self.db.collection(self.collection_name)
                .document(user_id)
                .collection(self.subcollection_name))

    def retrieve_history(self, user_id: str, limit: int = None) -> List:
        if limit is None:
            limit = self.history_limit * 2

        try:
            chat_ref = self._get_chat_ref(user_id)

            docs = (chat_ref
                   .order_by("timestamp", direction="DESCENDING")
                   .limit(limit)
                   .stream())

            messages = []
            doc_list = list(docs)

            if not doc_list:
                print(f"📝 No chat history found for user {user_id}")
                return []

            doc_list.reverse()

            for doc in doc_list:
                data = doc.to_dict()
                role = data.get("role")
                content = data.get("content")

                if role == "user":
                    messages.append(HumanMessage(content=content))
                elif role == "assistant":
                    messages.append(AIMessage(content=content))

            print(f"✅ Retrieved {len(messages)} messages for user {user_id}")
            return messages

        except Exception as e:
            print(f"❌ Error retrieving chat history for user {user_id}: {e}")
            return []

    def store_message(
        self,
        user_id: str,
        role: str,
        content: str,
        metadata: Optional[Dict] = None
    ) -> bool:
        try:
            chat_ref = self._get_chat_ref(user_id)

            message_data = {
                "role": role,
                "content": content,
                "timestamp": datetime.utcnow()
            }

            if metadata:
                message_data["metadata"] = metadata

            chat_ref.add(message_data)

            return True

        except Exception as e:
            print(f"❌ Error storing message for user {user_id}: {e}")
            return False

    def store_conversation(
        self,
        user_id: str,
        query: str,
        answer: str,
        num_docs: int = 0,
        context_preview: Optional[str] = None
    ) -> bool:
        user_stored = self.store_message(user_id, "user", query)

        metadata = {"num_docs": num_docs}
        if context_preview:
            metadata["context_preview"] = context_preview

        assistant_stored = self.store_message(user_id, "assistant", answer, metadata)

        return user_stored and assistant_stored

    def process_query(
        self,
        query: str,
        user_id: str,
        verbose: bool = False
    ) -> Dict[str, any]:
        if verbose:
            print(f"\n{'='*70}")
            print(f"🚀 Processing query for user: {user_id}")
            print(f"❓ Query: {query}")
            print(f"{'='*70}")

        if verbose:
            print("\n📚 Step 1: Retrieving chat history...")

        chat_history = self.retrieve_history(user_id)

        if verbose:
            print("\n🤖 Step 2: Querying RAG system...")

        result = chatbot(question=query, chat_history=chat_history)
        answer = result.get("answer", "I apologize, but I couldn't generate a response.")
        context_docs = result.get("context", [])
        num_docs = result.get("num_docs", 0)

        context_preview = None
        if context_docs:
            context_preview = context_docs[0].page_content[:150].replace('\n', ' ')

        if verbose:
            print(f"✅ Answer generated ({num_docs} docs retrieved)")

        if verbose:
            print("\n💾 Step 3: Storing conversation...")

        storage_success = self.store_conversation(
            user_id=user_id,
            query=query,
            answer=answer,
            num_docs=num_docs,
            context_preview=context_preview
        )

        if verbose:
            if storage_success:
                print("✅ Conversation stored successfully")
            else:
                print("⚠️ Failed to store conversation")
            print(f"{'='*70}\n")

        return {
            "answer": answer,
            "num_docs": num_docs,
            "success": storage_success
        }

    def load_full_chat(self, user_id: str) -> List[Dict]:
        try:
            chat_ref = self._get_chat_ref(user_id)
            docs = chat_ref.order_by("timestamp").stream()

            messages = []
            for doc in docs:
                data = doc.to_dict()
                messages.append({
                    "id": doc.id,
                    "role": data.get("role"),
                    "content": data.get("content"),
                    "timestamp": data.get("timestamp"),
                    "metadata": data.get("metadata", {})
                })

            return messages

        except Exception as e:
            print(f"❌ Error loading full chat for user {user_id}: {e}")
            return []

    def clear_history(self, user_id: str) -> bool:
        try:
            chat_ref = self._get_chat_ref(user_id)
            docs = chat_ref.stream()

            count = 0
            for doc in docs:
                doc.reference.delete()
                count += 1

            print(f"✅ Cleared {count} messages for user {user_id}")
            return True

        except Exception as e:
            print(f"❌ Error clearing history for user {user_id}: {e}")
            return False

    def get_chat_summary(self, user_id: str) -> Dict:
        try:
            chat_ref = self._get_chat_ref(user_id)
            docs = list(chat_ref.stream())

            total_messages = len(docs)
            user_messages = sum(1 for doc in docs if doc.to_dict().get("role") == "user")
            assistant_messages = total_messages - user_messages

            first_msg = None
            last_msg = None
            if docs:
                sorted_docs = sorted(docs, key=lambda d: d.to_dict().get("timestamp"))
                first_msg = sorted_docs[0].to_dict().get("timestamp")
                last_msg = sorted_docs[-1].to_dict().get("timestamp")

            return {
                "total_messages": total_messages,
                "user_messages": user_messages,
                "assistant_messages": assistant_messages,
                "first_message": first_msg,
                "last_message": last_msg
            }

        except Exception as e:
            print(f"❌ Error getting chat summary for user {user_id}: {e}")
            return {}


def query_with_history(query: str, user_id: str, verbose: bool = False) -> str:
    pipeline = ChatHistoryPipeline()
    result = pipeline.process_query(query, user_id, verbose)
    return result["answer"]


