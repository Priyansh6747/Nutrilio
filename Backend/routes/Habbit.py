
from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.concurrency import run_in_threadpool

from Engines.DB_Engine.Habbit import (
    initiate_analysis, 
    complete_analysis, 
    get_analysis_report, 
    is_analysis_in_progress
)
from Config import firestoreDB
from datetime import datetime
from Engines.Analysis.HabitAnalyzer import generate_habit_analysis_report

HabbitRouter = APIRouter()

def process_habit_analysis(user_id: str, analysis_id: str):
    """
    Background task to perform habit analysis.
    """
    try:
        # Step 2: Perform the habit analysis
        analysis_result = generate_habit_analysis_report(uid=user_id)
        
        # Step 3: Complete and update the analysis document with results
        complete_analysis(user_id=user_id, analysis_id=analysis_id, report=analysis_result)
        
        print(f"Habit analysis completed for user {user_id}, doc {analysis_id}")
    except Exception as e:
        print(f"Habit analysis failed for user {user_id}, doc {analysis_id}: {str(e)}")
        # Optionally: mark the document as failed in the database
        try:
            firestoreDB.collection('users').document(user_id).collection('analysis').document(analysis_id).update({
                'status': 'failed',
                'error': str(e),
                'failed_at': datetime.now()
            })
        except:
            pass

@HabbitRouter.get('/refresh/{user_id}')
async def refresh_habit_analysis(user_id: str, bg: BackgroundTasks):
    """
    Check if an analysis is already in progress for the user. If not, initiate a new habit analysis
    and return the doc id. Analysis runs in background using multithreading.
    """
    # Check if analysis is already running
    if is_analysis_in_progress(user_id):
        raise HTTPException(
            status_code=409, 
            detail="Analysis already in progress for this user"
        )
    
    # Step 1: Initiate analysis and create pending document
    analysis_id = initiate_analysis(user_id)
    
    # Step 2: Queue the analysis task in background thread
    bg.add_task(
        run_in_threadpool,
        process_habit_analysis,
        user_id=user_id,
        analysis_id=analysis_id
    )
    
    return {
        "status": "started",
        "doc_id": analysis_id,
        "message": "Habit analysis initiated successfully"
    }

@HabbitRouter.get('/report/{user_id}')
async def get_habit_analysis_report(user_id: str):
    """
    Retrieve the latest habit analysis report for the user.
    """
    report = get_analysis_report(user_id)
    if report is None:
        raise HTTPException(
            status_code=404, 
            detail="No habit analysis report found for this user"
        )
    return {
        "user_id": user_id,
        "report": report
    }