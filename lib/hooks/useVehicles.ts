import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { VehicleRecord } from "../createList";

export async function fetchVehiclesByList(
  listParentId: string
): Promise<VehicleRecord[]> {
  try {
    const vehiclenoCollection = collection(db, "vehicleno");
    const q = query(
      vehiclenoCollection,
      where("listParentId", "==", listParentId),
      orderBy("rowIndex", "asc")
    );
    const querySnapshot = await getDocs(q);

    const vehicles: VehicleRecord[] = [];
    querySnapshot.forEach((doc) => {
      vehicles.push({ ...doc.data() } as VehicleRecord);
    });

    return vehicles;
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw error;
  }
}

export function useVehicles(listParentId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["vehicles", listParentId],
    queryFn: () => fetchVehiclesByList(listParentId),
    enabled: enabled && !!listParentId,
    staleTime: 60 * 1000, // 1 minute
  });
}
