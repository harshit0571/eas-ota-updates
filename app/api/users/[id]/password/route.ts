import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY
    ) {
      throw new Error("Missing Firebase Admin SDK environment variables");
    }

    // Clean up the private key - handle various formatting issues
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Remove surrounding quotes if present
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }

    // Replace literal \n with actual newlines
    privateKey = privateKey.replace(/\\n/g, "\n");

    // Ensure the private key starts and ends correctly
    if (!privateKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
      privateKey = "-----BEGIN PRIVATE KEY-----\n" + privateKey;
    }
    if (!privateKey.endsWith("-----END PRIVATE KEY-----")) {
      privateKey = privateKey + "\n-----END PRIVATE KEY-----";
    }

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  } catch (error) {
    console.error("Firebase Admin SDK initialization error:", error);
    console.error(
      "Private key length:",
      process.env.FIREBASE_PRIVATE_KEY?.length
    );
    console.error(
      "Private key starts with:",
      process.env.FIREBASE_PRIVATE_KEY?.substring(0, 50)
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Test endpoint to check if the route is working
  return NextResponse.json({
    message: "Password API route is working",
    userId: id,
    envCheck: {
      projectId: process.env.FIREBASE_PROJECT_ID ? "Set" : "Missing",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? "Set" : "Missing",
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? "Set" : "Missing",
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Debug: Check if environment variables are set
    console.log("Environment check:", {
      projectId: process.env.FIREBASE_PROJECT_ID ? "Set" : "Missing",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? "Set" : "Missing",
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? "Set" : "Missing",
    });

    const { password } = await request.json();
    const { id: userId } = await params;

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if Firebase Admin is properly initialized
    const apps = getApps();
    if (apps.length === 0) {
      throw new Error("Firebase Admin SDK not initialized");
    }

    const auth = getAuth();

    // Update the user's password
    await auth.updateUser(userId, {
      password: password,
    });

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating password:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    if (error.code === "auth/user-not-found") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (error.code === "auth/weak-password") {
      return NextResponse.json(
        { error: "Password is too weak" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Failed to update password: ${error.message}` },
      { status: 500 }
    );
  }
}
