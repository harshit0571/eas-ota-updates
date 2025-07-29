import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { ListMetadata } from "../createList";

export async function fetchLists(): Promise<ListMetadata[]> {
  try {
    const listsCollection = collection(db, "lists");
    const q = query(listsCollection, orderBy("uploadDate", "desc"));
    const querySnapshot = await getDocs(q);

    const lists: ListMetadata[] = [];
    querySnapshot.forEach((doc) => {
      lists.push({ ...doc.data() } as ListMetadata);
    });

    return lists;
  } catch (error) {
    console.error("Error fetching lists:", error);
    throw error;
  }
}

export function useLists() {
  return useQuery({
    queryKey: ["lists"],
    queryFn: fetchLists,
    staleTime: 30 * 1000, // 30 seconds
  });
}
