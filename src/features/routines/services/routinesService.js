// services/routinesService.js

import { db } from "../../../services/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  getDoc
} from "firebase/firestore";
import { deleteDoc } from "firebase/firestore";

// CREATE ROUTINE
export const createRoutine = async (uid, name) => {
  const routinesRef = collection(db, "routines");
  const q = query(
    routinesRef,
    where("uid", "==", uid)
  );
  const snapshot = await getDocs(q);
  const maxOrder = snapshot.docs.length > 0 ? Math.max(...snapshot.docs.map(doc => doc.data().order ?? 0)) : -1;
  const docRef = await addDoc(routinesRef, {
    uid,
    name,
    order: maxOrder + 1,
    isRunning: false,
    currentBlockIndex: null,
    blockStartedAt: null,
    blockDurationSeconds: null,
    remainingSeconds: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return docRef.id;
};

// LISTEN TO ROUTINES IN REAL TIME
export const listenUserRoutines = (uid, callback) => {
  const q = query(
    collection(db, "routines"),
    where("uid", "==", uid),
    orderBy("order", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const routines = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(routines);
  });
};

// CREATE BLOCK
export const createBlock = async (routineId, blockData) => {
  const blocksRef = collection(db, "routines", routineId, "blocks");
  const docRef = await addDoc(blocksRef, { ...blockData, completed: false });
  return docRef.id;
};

// GET BLOCKS
export const getRoutineBlocks = async (routineId) => {
  const q = query(
    collection(db, "routines", routineId, "blocks"),
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// PAUSE ALL OTHER ACTIVE USER ROUTINES
export const pauseOtherUserRoutines = async (uid, currentRoutineId) => {
  const q = query(
    collection(db, "routines"),
    where("uid", "==", uid),
    where("isRunning", "==", true)
  );
  const snapshot = await getDocs(q);
  const updates = snapshot.docs
    .filter(docSnap => docSnap.id !== currentRoutineId)
    .map(docSnap =>
      updateDoc(docSnap.ref, {
        isRunning: false
      })
    );
  await Promise.all(updates);
};

// START ROUTINE
export const startRoutine = async (routineId, uid) => {
  if (!routineId || !uid) return;

  const routineRef = doc(db, "routines", routineId);
  const routineSnap = await getDoc(routineRef);
  if (!routineSnap.exists()) return;
  const routineData = routineSnap.data();

  if (!routineData.isRunning) {
    await pauseOtherUserRoutines(uid, routineId);
  }

  if (routineData.isRunning) return;

  const blocksSnapshot = await getDocs(
    query(collection(db, "routines", routineId, "blocks"), orderBy("order", "asc"))
  );
  if (blocksSnapshot.empty) return;

  let firstIndex = 0;
  const blocks = blocksSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  while (firstIndex < blocks.length && blocks[firstIndex].completed) firstIndex++;
  if (firstIndex >= blocks.length) return;

  const firstBlock = blocks[firstIndex];

  const remaining = routineData.remainingSeconds > 0 ? routineData.remainingSeconds : firstBlock.duration;
  const blockStartedAt = routineData.blockStartedAt || serverTimestamp();

  await updateDoc(routineRef, {
    isRunning: true,
    currentBlockIndex: firstIndex,
    blockStartedAt,
    blockDurationSeconds: firstBlock.duration,
    remainingSeconds: remaining
  });
};

// UPDATE ROUTINE
export async function updateRoutineTimestamp(routineId) {
  const routineRef = doc(db, "routines", routineId);
  await updateDoc(routineRef, {
    updatedAt: serverTimestamp(),
  });
}

// PAUSE ROUTINE
export const pauseRoutine = async (routineId, remainingSeconds) => {
  const routineRef = doc(db, "routines", routineId);
  await updateDoc(routineRef, {
  isRunning: false,
  remainingSeconds
});
};

// ADVANCE BLOCK
export const advanceBlock = async (routineId) => {
  const routineRef = doc(db, "routines", routineId);
  const routineSnap = await getDoc(routineRef);
  if (!routineSnap.exists()) return;

  const routineData = routineSnap.data();
  let currentIndex = routineData.currentBlockIndex ?? 0;

  const blocksSnapshot = await getDocs(
    query(collection(db, "routines", routineId, "blocks"), orderBy("order", "asc"))
  );
  const blocks = blocksSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  let nextIndex = currentIndex + 1;
  while (nextIndex < blocks.length && blocks[nextIndex].completed) nextIndex++;

  if (nextIndex >= blocks.length) {
    await updateDoc(routineRef, {
      isRunning: false,
      currentBlockIndex: null,
      remainingSeconds: null,
      blockDurationSeconds: null
    });
    return;
  }

  const nextBlock = blocks[nextIndex];
  const durationSeconds = nextBlock.duration;

  await updateDoc(routineRef, {
    currentBlockIndex: nextIndex,
    blockStartedAt: serverTimestamp(),
    blockDurationSeconds: durationSeconds,
    remainingSeconds: durationSeconds
  });
};

// RESET
export const resetRoutine = async (routineId) => {
  const routineRef = doc(db, "routines", routineId);

  await updateDoc(routineRef, {
    isRunning: false,
    currentBlockIndex: null,
    blockStartedAt: null,
    blockDurationSeconds: null,
    remainingSeconds: null
  });
};

// TOGGLE COMPLETED
export const toggleBlockCompleted = async (routineId, blockId, completed) => {
  const blockRef = doc(db, "routines", routineId, "blocks", blockId);
  await updateDoc(blockRef, {
    completed,
    updatedAt: serverTimestamp()
  });
};


// UPDATE EXISTING BLOCK
export const updateBlock = async (routineId, blockId, updatedData) => {
  const blockRef = doc(db, "routines", routineId, "blocks", blockId);
  await updateDoc(blockRef, {
    ...updatedData,
    updatedAt: serverTimestamp()
  });
};

// DELETE BLOCK
export const deleteBlock = async (routineId, blockId) => {
  const blockRef = doc(db, "routines", routineId, "blocks", blockId);
  await deleteDoc(blockRef);

  await updateRoutineTimestamp(routineId);
};

// DELETE ROUTINE
export const deleteRoutine = async (routineId) => {
  const routineRef = doc(db, "routines", routineId);

  const blocksSnapshot = await getDocs(
    collection(db, "routines", routineId, "blocks")
  );
  const deletes = blocksSnapshot.docs.map(d => deleteDoc(d.ref));
  await Promise.all(deletes);

  await deleteDoc(routineRef);
};

// FUNCTION TO UPDATE ORDER IN FIREBASE
export const updateRoutineOrder = async (routineId, newOrder) => {
  const routineRef = doc(db, "routines", routineId);
  await updateDoc(routineRef, { order: newOrder });
};