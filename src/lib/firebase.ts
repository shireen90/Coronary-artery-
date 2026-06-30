import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  deleteDoc,
  updateDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAic94KztnrqmMJHqK5mriGMx-GZ0ZG5o4",
  authDomain: "robust-quill-7rwfn.firebaseapp.com",
  projectId: "robust-quill-7rwfn",
  storageBucket: "robust-quill-7rwfn.firebasestorage.app",
  messagingSenderId: "636233197396",
  appId: "1:636233197396:web:cbdd2fc1b13830a7bb4ac1"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use the specific firestore database ID provided in config
// The db instance will connect to our provisioned database
export const db = getFirestore(app, "ai-studio-cadriskpredictor-39da857b-839d-42cb-ac43-03937d9c2abd");

export { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc, updateDoc };
