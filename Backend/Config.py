import firebase_admin
from dotenv import load_dotenv
from firebase_admin import credentials, firestore

load_dotenv()

#Firebase
cred = credentials.Certificate("firebaseSecret.json")
firebase_admin.initialize_app(cred)
firestoreDB = firestore.client()





