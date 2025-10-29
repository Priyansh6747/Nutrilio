from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import Engines.DB_Engine.Chat as Chatbot

BotRouter = APIRouter()


class QueryRequest(BaseModel):
    query: str
    user_id: str
    verbose: Optional[bool] = False


class QueryResponse(BaseModel):
    answer: str
    num_docs: int
    success: bool


class ClearHistoryRequest(BaseModel):
    user_id: str


class UserIdRequest(BaseModel):
    user_id: str


class HistoryLimitRequest(BaseModel):
    user_id: str
    limit: Optional[int] = None


@BotRouter.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    try:
        pipeline = Chatbot.ChatHistoryPipeline()
        result = pipeline.process_query(
            query=request.query,
            user_id=request.user_id,
            verbose=request.verbose
        )
        return QueryResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")


@BotRouter.post("/query/simple")
async def simple_query(request: QueryRequest):
    try:
        answer = Chatbot.query_with_history(
            query=request.query,
            user_id=request.user_id,
            verbose=request.verbose
        )
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")


@BotRouter.post("/history/retrieve")
async def retrieve_history(request: HistoryLimitRequest):
    try:
        pipeline = Chatbot.ChatHistoryPipeline()
        messages = pipeline.retrieve_history(
            user_id=request.user_id,
            limit=request.limit
        )
        return {
            "user_id": request.user_id,
            "message_count": len(messages),
            "messages": [{"role": msg.__class__.__name__, "content": msg.content} for msg in messages]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving history: {str(e)}")


@BotRouter.post("/history/full")
async def load_full_chat(request: UserIdRequest):
    try:
        pipeline = Chatbot.ChatHistoryPipeline()
        messages = pipeline.load_full_chat(user_id=request.user_id)
        return {
            "user_id": request.user_id,
            "total_messages": len(messages),
            "messages": messages
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading full chat: {str(e)}")


@BotRouter.post("/history/clear")
async def clear_history(request: ClearHistoryRequest):
    try:
        pipeline = Chatbot.ChatHistoryPipeline()
        success = pipeline.clear_history(user_id=request.user_id)
        return {
            "success": success,
            "message": f"Chat history cleared for user {request.user_id}" if success else "Failed to clear history"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing history: {str(e)}")


@BotRouter.post("/history/summary")
async def get_chat_summary(request: UserIdRequest):
    try:
        pipeline = Chatbot.ChatHistoryPipeline()
        summary = pipeline.get_chat_summary(user_id=request.user_id)
        return {
            "user_id": request.user_id,
            **summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting chat summary: {str(e)}")


@BotRouter.get("/health")
async def health_check():
    return {"status": "healthy", "service": "chatbot"}