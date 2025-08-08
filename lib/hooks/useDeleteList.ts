import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  doc,
  deleteDoc,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listId: string) => {
      try {
        // First, get all vehicles associated with this list
        const vehiclenoCollection = collection(db, "vehicleno");
        const vehiclesQuery = query(
          vehiclenoCollection,
          where("listParentId", "==", listId)
        );
        const vehiclesSnapshot = await getDocs(vehiclesQuery);

        // Create a batch for all deletions
        const batch = writeBatch(db);

        // Delete all vehicles associated with this list
        vehiclesSnapshot.forEach((vehicleDoc) => {
          batch.delete(vehicleDoc.ref);
        });

        // Delete the list document
        const listRef = doc(db, "lists", listId);
        batch.delete(listRef);

        // Commit all deletions
        await batch.commit();

        return {
          listId,
          deletedVehiclesCount: vehiclesSnapshot.size,
        };
      } catch (error) {
        console.error("Error in deleteList mutation:", error);
        throw new Error(
          `Failed to delete list: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
    onSuccess: (data) => {
      console.log(
        `Successfully deleted list ${data.listId} and ${data.deletedVehiclesCount} vehicles`
      );
      // Invalidate and refetch lists to update the UI
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
    onError: (error) => {
      console.error("Error deleting list:", error);
    },
  });
}
