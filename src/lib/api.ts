import type { Memory, PatientProfile, Tr } from "./types";

const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:8080";

interface TrDto { en: string; as: string; bn: string }
interface MemoryDto {
  id: string; type: string; title: TrDto; text: TrDto;
  tags: string[]; sensitive: boolean; createdAt: number;
}
interface PatientDto { name: string; age: number; preferredLanguage: string; interests: string[] }

function toTr(t: TrDto | undefined): Tr {
  return { en: t?.en ?? "", as: t?.as ?? "", bn: t?.bn ?? "" };
}

function memoryToDto(m: Memory): MemoryDto {
  const title = m.title as Tr;
  const text = m.text as Tr;
  return {
    id: m.id,
    type: m.type,
    title: { en: title.en, as: title.as ?? "", bn: title.bn ?? "" },
    text: { en: text.en, as: text.as ?? "", bn: text.bn ?? "" },
    tags: m.tags,
    sensitive: m.sensitive,
    createdAt: m.createdAt,
  };
}

function dtoToMemory(d: MemoryDto): Memory {
  return {
    id: d.id,
    type: d.type as Memory["type"],
    title: toTr(d.title),
    text: toTr(d.text),
    tags: d.tags ?? [],
    sensitive: d.sensitive,
    createdAt: d.createdAt,
  };
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export async function apiGetPatient(): Promise<PatientProfile> {
  const dto = await req<PatientDto>("/api/patient");
  return {
    name: dto.name,
    age: dto.age,
    preferredLanguage: dto.preferredLanguage as PatientProfile["preferredLanguage"],
    interests: dto.interests,
  };
}

export async function apiSavePatient(profile: PatientProfile): Promise<void> {
  await req<PatientDto>("/api/patient", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

export async function apiGetMemories(): Promise<Memory[]> {
  const list = await req<MemoryDto[]>("/api/memories");
  return list.map(dtoToMemory);
}

export async function apiGetEligibleMemories(): Promise<Memory[]> {
  const list = await req<MemoryDto[]>("/api/memories/eligible");
  return list.map(dtoToMemory);
}

export async function apiCreateMemory(m: Memory): Promise<Memory> {
  const dto = await req<MemoryDto>("/api/memories", {
    method: "POST",
    body: JSON.stringify(memoryToDto(m)),
  });
  return dtoToMemory(dto);
}

export async function apiUpdateMemory(m: Memory): Promise<Memory> {
  const dto = await req<MemoryDto>(`/api/memories/${m.id}`, {
    method: "PUT",
    body: JSON.stringify(memoryToDto(m)),
  });
  return dtoToMemory(dto);
}

export async function apiDeleteMemory(id: string): Promise<void> {
  await req<void>(`/api/memories/${id}`, { method: "DELETE" });
}
