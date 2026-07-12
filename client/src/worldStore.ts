import { decodeSave } from "@logica/shared";

/**
 * Mundos do SINGLEPLAYER, guardados no navegador (IndexedDB) — decisão de
 * 2026-07-11: no LAN só o host salva; sozinho, cada jogador salva no próprio
 * navegador. `data` são os bytes .ljw (MESMO formato do host Node), então
 * exportar = download do arquivo e importar = upload — distribuição via Drive.
 */

export interface WorldRecord {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  /** Bytes .ljw (LJS1). */
  data: ArrayBuffer;
}

const DB_NAME = "logica-em-jogo";
const STORE = "worlds";

function req<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error ?? new Error("IndexedDB falhou"));
  });
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, 1);
    open.onupgradeneeded = () => {
      open.result.createObjectStore(STORE, { keyPath: "id" });
    };
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error ?? new Error("IndexedDB indisponível"));
  });
  return dbPromise;
}

export async function listWorlds(): Promise<WorldRecord[]> {
  const db = await openDb();
  const all = await req(db.transaction(STORE).objectStore(STORE).getAll() as IDBRequest<WorldRecord[]>);
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function putWorld(rec: WorldRecord): Promise<void> {
  const db = await openDb();
  await req(db.transaction(STORE, "readwrite").objectStore(STORE).put(rec));
}

export async function deleteWorld(id: string): Promise<void> {
  const db = await openDb();
  await req(db.transaction(STORE, "readwrite").objectStore(STORE).delete(id));
}

/** Exporta como download .ljw (pra pasta do Drive, pen drive etc.). */
export function downloadWorld(rec: WorldRecord): void {
  const safe = rec.name.replace(/[^\p{L}\p{N} _-]/gu, "").trim() || "mundo";
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([rec.data], { type: "application/octet-stream" }));
  a.download = `${safe}.ljw`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Lê e VALIDA um .ljw importado (arquivo vem de fora). Lança se inválido. */
export async function importWorldFile(file: File): Promise<WorldRecord> {
  const data = await file.arrayBuffer();
  decodeSave(data); // valida magic/meta/snapshot — lança com mensagem clara
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name: file.name.replace(/\.ljw$/i, "") || "mundo importado",
    createdAt: now,
    updatedAt: now,
    data,
  };
}
