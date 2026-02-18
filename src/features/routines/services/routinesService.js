// routinesService.js
// routinesService.js

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

// 🔹 Crear rutina
export const createRoutine = async (uid, name) => {
  const docRef = await addDoc(collection(db, "routines"), {
    uid,
    name,
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

// 🔹 Escuchar rutinas en tiempo real
export const listenUserRoutines = (uid, callback) => {
  const q = query(collection(db, "routines"), where("uid", "==", uid));
  return onSnapshot(q, (snapshot) => {
    const routines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(routines);
  });
};

// 🔹 Crear bloque
export const createBlock = async (routineId, blockData) => {
  const blocksRef = collection(db, "routines", routineId, "blocks");
  const docRef = await addDoc(blocksRef, { ...blockData, completed: false });
  return docRef.id;
};

// 🔹 Obtener bloques
export const getRoutineBlocks = async (routineId) => {
  const q = query(
    collection(db, "routines", routineId, "blocks"),
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 🔹 DESACTIVAR TODAS LAS RUTINAS DEL USUARIO
export const stopAllUserRoutines = async (uid) => {
  const q = query(
    collection(db, "routines"),
    where("uid", "==", uid),
    where("isRunning", "==", true)
  );
  const snapshot = await getDocs(q);
  const updates = snapshot.docs.map(docSnap =>
    updateDoc(docSnap.ref, {
      isRunning: false,
      updatedAt: serverTimestamp()
    })
  );
  await Promise.all(updates);
};

// 🔥 INICIAR RUTINA (100% server based)
export const startRoutine = async (routineId, uid) => {
  const routineRef = doc(db, "routines", routineId);
  await stopAllUserRoutines(uid);

  const blocksSnapshot = await getDocs(
    query(collection(db, "routines", routineId, "blocks"), orderBy("order", "asc"))
  );
  if (blocksSnapshot.empty) return;

  let firstIndex = 0;
  const blocks = blocksSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  while (firstIndex < blocks.length && blocks[firstIndex].completed) firstIndex++;

  if (firstIndex >= blocks.length) return;

  const firstBlock = blocks[firstIndex];
  const durationSeconds = firstBlock.duration * 60;

  await updateDoc(routineRef, {
    isRunning: true,
    currentBlockIndex: firstIndex,
    blockStartedAt: serverTimestamp(),
    blockDurationSeconds: durationSeconds,
    remainingSeconds: durationSeconds,
    updatedAt: serverTimestamp()
  });
};

// 🔥 PAUSAR RUTINA
export const pauseRoutine = async (routineId, remainingSeconds) => {
  const routineRef = doc(db, "routines", routineId);
  await updateDoc(routineRef, {
    isRunning: false,
    remainingSeconds,
    updatedAt: serverTimestamp()
  });
};

// 🔥 AVANZAR BLOQUE
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
      blockDurationSeconds: null,
      updatedAt: serverTimestamp()
    });
    return;
  }

  const nextBlock = blocks[nextIndex];
  const durationSeconds = nextBlock.duration * 60;

  await updateDoc(routineRef, {
    currentBlockIndex: nextIndex,
    blockStartedAt: serverTimestamp(),
    blockDurationSeconds: durationSeconds,
    remainingSeconds: durationSeconds,
    updatedAt: serverTimestamp()
  });
};

// 🔥 RESET
export const resetRoutine = async (routineId) => {
  const routineRef = doc(db, "routines", routineId);

  await updateDoc(routineRef, {
    isRunning: false,
    currentBlockIndex: null,
    blockStartedAt: null,
    blockDurationSeconds: null,
    remainingSeconds: null,
    updatedAt: serverTimestamp()
  });
};

// 🔹 TOGGLE COMPLETED
export const toggleBlockCompleted = async (routineId, blockId, completed) => {
  const blockRef = doc(db, "routines", routineId, "blocks", blockId);
  await updateDoc(blockRef, {
    completed,
    updatedAt: serverTimestamp()
  });
};


// 🔹 Actualizar bloque existente
export const updateBlock = async (routineId, blockId, updatedData) => {
  const blockRef = doc(db, "routines", routineId, "blocks", blockId);
  await updateDoc(blockRef, {
    ...updatedData,
    updatedAt: serverTimestamp()
  });
};

// 🔹 Eliminar bloque
 // <- asegúrate de importarlo arriba

export const deleteBlock = async (routineId, blockId) => {
  const blockRef = doc(db, "routines", routineId, "blocks", blockId);
  await deleteDoc(blockRef); // 🔹 ahora sí elimina correctamente
};

export const deleteRoutine = async (routineId) => {
  const routineRef = doc(db, "routines", routineId);

  // 🔹 Primero eliminamos todos los bloques de la rutina
  const blocksSnapshot = await getDocs(
    collection(db, "routines", routineId, "blocks")
  );
  const deletes = blocksSnapshot.docs.map(d => deleteDoc(d.ref));
  await Promise.all(deletes);

  // 🔹 Luego eliminamos la rutina
  await deleteDoc(routineRef);
};


// Función para actualizar el orden en Firebase
export const updateRoutineOrder = async (routineId, newOrder) => {
  const routineRef = doc(db, "routines", routineId);
  await updateDoc(routineRef, { order: newOrder });
};