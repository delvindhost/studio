"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp, doc, deleteDoc, writeBatch } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import type { TemperatureRecord } from "@/types";
import { lookupProductDetails } from "@/ai/flows/product-details-lookup";

const formSchema = z.object({
  turno: z.string(),
  local: z.string(),
  codigo: z.string().optional(),
  produto: z.string(),
  tipo: z.string(),
  estado: z.string(),
  dataManual: z.string(),
  horarioManual: z.string(),
  tempInicio: z.number(),
  tempMeio: z.number(),
  tempFim: z.number(),
});

export async function addTemperatureRecord(data: z.infer<typeof formSchema>) {
  const validatedData = formSchema.safeParse(data);

  if (!validatedData.success) {
    return { success: false, message: "Dados inválidos." };
  }
  
  try {
    const { dataManual, horarioManual, ...rest } = validatedData.data;
    const dateTimeString = `${dataManual}T${horarioManual}:00`;
    const recordTimestamp = Timestamp.fromDate(new Date(dateTimeString));

    await addDoc(collection(db, "registros"), {
      ...rest,
      data: recordTimestamp,
      dataManual,
      horarioManual,
      temperaturas: {
        inicio: validatedData.data.tempInicio,
        meio: validatedData.data.tempMeio,
        fim: validatedData.data.tempFim,
      }
    });

    revalidatePath("/");
    revalidatePath("/visualize");
    revalidatePath("/charts");

    return { success: true, message: "Temperatura registrada com sucesso!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao registrar temperatura." };
  }
}

export async function getTemperatureRecords(filters: {
  startDate: string;
  endDate: string;
  local: string;
  turno: string;
  tipo: string;
}) {
  const { startDate, endDate, local, turno, tipo } = filters;

  const start = Timestamp.fromDate(new Date(startDate + "T00:00:00"));
  const end = Timestamp.fromDate(new Date(endDate + "T23:59:59"));

  let q = query(
    collection(db, "registros"),
    where("data", ">=", start),
    where("data", "<=", end),
    orderBy("data", "desc")
  );

  if (local) q = query(q, where("local", "==", local));
  if (turno) q = query(q, where("turno", "==", turno));
  if (tipo) q = query(q, where("tipo", "==", tipo));

  const querySnapshot = await getDocs(q);
  const records = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as TemperatureRecord[];

  return JSON.parse(JSON.stringify(records));
}

export async function deleteTemperatureRecord(id: string) {
    try {
        await deleteDoc(doc(db, "registros", id));
        revalidatePath("/visualize");
        return { success: true, message: "Registro excluído com sucesso." };
    } catch (error) {
        return { success: false, message: "Erro ao excluir registro." };
    }
}

export async function performDataCleanup(daysToKeep: number) {
    try {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - daysToKeep);
        const timestampLimit = Timestamp.fromDate(dateLimit);

        const q = query(collection(db, "registros"), where("data", "<", timestampLimit));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: true, message: "Nenhum registro antigo para limpar.", count: 0 };
        }

        const batch = writeBatch(db);
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        revalidatePath("/visualize");
        revalidatePath("/charts");

        return { success: true, message: `Limpeza concluída. ${snapshot.size} registros foram removidos.`, count: snapshot.size };
    } catch (error) {
        return { success: false, message: "Erro ao executar a limpeza de dados." };
    }
}

export async function performFullReset() {
    try {
        const q = query(collection(db, "registros"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: true, message: "Nenhum registro para apagar.", count: 0 };
        }

        const batch = writeBatch(db);
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        revalidatePath("/visualize");
        revalidatePath("/charts");

        return { success: true, message: `Reset completo! ${snapshot.size} registros foram removidos.`, count: snapshot.size };
    } catch (error) {
        return { success: false, message: "Erro ao resetar os dados." };
    }
}


export async function lookupProduct(productCode: string) {
    if (!productCode) return null;
    try {
        const result = await lookupProductDetails({ productCode });
        return result;
    } catch (error) {
        console.error("AI lookup failed:", error);
        return null;
    }
}
