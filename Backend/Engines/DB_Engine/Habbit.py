from Config import firestoreDB 
from datetime import datetime
from google.cloud.firestore import Query

def initiate_analysis(user_id):
    doc_ref = firestoreDB.collection('users').document(user_id).collection('analysis').add({
        'status': 'in_progress',
        'timestamp': datetime.now()
    })
    # .add() returns (timestamp, DocumentReference), so unpack it
    _, document_ref = doc_ref
    return document_ref.id

def complete_analysis(user_id, analysis_id, report):
    firestoreDB.collection('users').document(user_id).collection('analysis').document(analysis_id).update({
        'status': 'completed',
        'report': report,
        'completed_at': datetime.now()
    })

def fail_analysis(user_id, analysis_id, error_message):
    firestoreDB.collection('users').document(user_id).collection('analysis').document(analysis_id).update({
        'status': 'failed',
        'error': error_message,
        'failed_at': datetime.now()
    })    

def get_analysis_report(user_id):
    # Get the latest analysis report for the user
    analysis_ref = firestoreDB.collection('users').document(user_id).collection('analysis')
    # Use Query.DESCENDING instead of firestoreDB.firestore.Query.DESCENDING
    latest_analysis = analysis_ref.order_by('timestamp', direction=Query.DESCENDING).limit(1).get()
    if latest_analysis:
        return latest_analysis[0].to_dict().get('report')
    return None

def is_analysis_in_progress(user_id):
    analysis_ref = firestoreDB.collection('users').document(user_id).collection('analysis')
    in_progress_analysis = analysis_ref.where('status', '==', 'in_progress').get()
    return len(in_progress_analysis) > 0


