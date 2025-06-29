import { useMutation } from "@tanstack/react-query";
import { createList, CreateListData } from "../createList";

export function useCreateList() {
  return useMutation({
    mutationFn: createList,
    onSuccess: (data, variables) => {
      console.log("List created successfully:", variables.fileName);
    },
    onError: (error) => {
      console.error("Error creating list:", error);
    },
  });
}
