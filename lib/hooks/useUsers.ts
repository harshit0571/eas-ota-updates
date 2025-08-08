import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  role: string;
  verification_status: "pending" | "verified" | "rejected";
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function fetchUsers(): Promise<User[]> {
  try {
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        role: data.role,
        verification_status: data.verification_status,
        deviceId: data.deviceId || "",
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
}

export function useUpdateUserVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: string;
      status: "pending" | "verified" | "rejected";
    }) => {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        verification_status: status,
        updatedAt: new Date(),
      });
      return { userId, status };
    },
    onSuccess: () => {
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUserPassword() {
  return useMutation({
    mutationFn: async ({
      userId,
      password,
    }: {
      userId: string;
      password: string;
    }) => {
      const response = await fetch(`/api/users/${userId}/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update password");
      }

      return response.json();
    },
  });
}

export function useUpdateUserDeviceId() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      deviceId,
    }: {
      userId: string;
      deviceId: string;
    }) => {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        deviceId: deviceId,
        updatedAt: new Date(),
      });
      return { userId, deviceId };
    },
    onSuccess: () => {
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
