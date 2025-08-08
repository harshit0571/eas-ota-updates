import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ListMetadata, ColumnRow } from "../createList";

export async function fetchList(listId: string): Promise<ListMetadata | null> {
  try {
    const listDoc = doc(db, "lists", listId);
    const docSnapshot = await getDoc(listDoc);

    if (!docSnapshot.exists()) {
      return null;
    }

    return { ...docSnapshot.data() } as ListMetadata;
  } catch (error) {
    console.error("Error fetching list:", error);
    throw error;
  }
}

export async function updateListColumns(
  listId: string,
  updatedRows: ColumnRow[]
): Promise<void> {
  try {
    const listDoc = doc(db, "lists", listId);
    await updateDoc(listDoc, {
      rows: updatedRows,
    });
  } catch (error) {
    console.error("Error updating list columns:", error);
    throw error;
  }
}

export function useList(listId: string) {
  return useQuery({
    queryKey: ["list", listId],
    queryFn: () => fetchList(listId),
    enabled: !!listId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useUpdateListColumns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      listId,
      updatedRows,
    }: {
      listId: string;
      updatedRows: ColumnRow[];
    }) => updateListColumns(listId, updatedRows),
    onSuccess: (_, { listId }) => {
      // Invalidate and refetch the specific list
      queryClient.invalidateQueries({ queryKey: ["list", listId] });
      // Also invalidate the lists query to update the overview
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
}
