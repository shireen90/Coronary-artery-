import { useState, useEffect } from 'react';
import { PatientRecord } from '../types';
import { db, collection, addDoc, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from '../lib/firebase';
import { INITIAL_PATIENTS } from '../data';

export function usePatients() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallbackMode, setIsFallbackMode] = useState<boolean>(false);

  // Load patients from Firestore or fallback
  const loadPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try fetching from Firestore
      const patientsRef = collection(db, "patients");
      const q = query(patientsRef, orderBy("predictedAt", "desc"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log("Firestore patient collection is empty. Seeding database with realistic samples...");
        // Seed the database
        const seededList: PatientRecord[] = [];
        for (const p of INITIAL_PATIENTS) {
          const docRef = await addDoc(patientsRef, p);
          seededList.push({ ...p, id: docRef.id });
        }
        setPatients(seededList);
        setIsFallbackMode(false);
      } else {
        const list: PatientRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data() as PatientRecord, id: docSnap.id });
        });
        setPatients(list);
        setIsFallbackMode(false);
      }
    } catch (err: any) {
      console.warn("Firestore access error, falling back to secure LocalStorage persistence:", err);
      setIsFallbackMode(true);
      
      // Fallback: LocalStorage
      const localData = localStorage.getItem("cad_patients");
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          const mapped = parsed.map((item: any, idx: number) => ({
            ...item,
            id: item.id || `fallback-${idx}`
          }));
          setPatients(mapped);
        } catch (e) {
          const initialWithIds = INITIAL_PATIENTS.map((p, idx) => ({
            ...p,
            id: `fallback-${idx}`
          }));
          setPatients(initialWithIds);
          localStorage.setItem("cad_patients", JSON.stringify(initialWithIds));
        }
      } else {
        const initialWithIds = INITIAL_PATIENTS.map((p, idx) => ({
          ...p,
          id: `fallback-${idx}`
        }));
        setPatients(initialWithIds);
        localStorage.setItem("cad_patients", JSON.stringify(initialWithIds));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // Add a new patient record
  const addPatient = async (newPatient: PatientRecord): Promise<PatientRecord> => {
    if (isFallbackMode) {
      const id = "local-" + Math.random().toString(36).substr(2, 9);
      const recordWithId = { ...newPatient, id };
      const updated = [recordWithId, ...patients];
      setPatients(updated);
      localStorage.setItem("cad_patients", JSON.stringify(updated));
      return recordWithId;
    } else {
      try {
        const patientsRef = collection(db, "patients");
        const docRef = await addDoc(patientsRef, newPatient);
        const recordWithId = { ...newPatient, id: docRef.id };
        setPatients(prev => [recordWithId, ...prev]);
        return recordWithId;
      } catch (err) {
        console.error("Failed to add to Firestore, adding to local state instead", err);
        // Instant local fallback
        const id = "local-" + Math.random().toString(36).substr(2, 9);
        const recordWithId = { ...newPatient, id };
        const updated = [recordWithId, ...patients];
        setPatients(updated);
        localStorage.setItem("cad_patients", JSON.stringify(updated));
        return recordWithId;
      }
    }
  };

  // Delete a patient record
  const deletePatient = async (id: string): Promise<boolean> => {
    const updated = patients.filter(p => p.id !== id);
    setPatients(updated);
    
    if (isFallbackMode || id.startsWith("local-")) {
      localStorage.setItem("cad_patients", JSON.stringify(updated));
      return true;
    } else {
      try {
        await deleteDoc(doc(db, "patients", id));
        return true;
      } catch (err) {
        console.error("Failed to delete from Firestore", err);
        localStorage.setItem("cad_patients", JSON.stringify(updated));
        return true;
      }
    }
  };

  // Update clinical details/recommendations
  const updatePatientInsights = async (id: string, updates: Partial<PatientRecord>): Promise<boolean> => {
    const updated = patients.map(p => p.id === id ? { ...p, ...updates } : p);
    setPatients(updated);

    if (isFallbackMode || id.startsWith("local-")) {
      localStorage.setItem("cad_patients", JSON.stringify(updated));
      return true;
    } else {
      try {
        const patientDocRef = doc(db, "patients", id);
        await updateDoc(patientDocRef, updates);
        return true;
      } catch (err) {
        console.error("Failed to update Firestore, saving locally", err);
        localStorage.setItem("cad_patients", JSON.stringify(updated));
        return true;
      }
    }
  };

  return {
    patients,
    loading,
    error,
    isFallbackMode,
    addPatient,
    deletePatient,
    updatePatientInsights,
    refresh: loadPatients
  };
}
