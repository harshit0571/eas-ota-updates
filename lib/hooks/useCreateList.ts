import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createList, CreateListData, CreateListResult } from "../createList";

export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation<CreateListResult, Error, CreateListData>({
    mutationFn: createList,
    onSuccess: (data, variables) => {
      console.log("List created successfully:", variables.fileName);
      console.log(
        `Created: ${data.newVehicles} new vehicles, Updated: ${data.updatedVehicles} existing vehicles`
      );
      // Invalidate and refetch lists to show the new list immediately
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
    onError: (error) => {
      console.error("Error creating list:", error);
    },
  });
}
