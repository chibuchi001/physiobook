import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env");
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  // Get body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const eventType = evt.type;

  // Handle user.created
  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const primaryEmail = email_addresses.find(
      (e) => e.id === evt.data.primary_email_address_id
    );

    if (!primaryEmail) {
      return NextResponse.json(
        { error: "No primary email found" },
        { status: 400 }
      );
    }

    // Check if this is an admin
    const isAdmin = primaryEmail.email_address === process.env.ADMIN_EMAIL;

    // Create user
    const user = await prisma.user.create({
      data: {
        clerkId: id,
        email: primaryEmail.email_address,
        firstName: first_name || null,
        lastName: last_name || null,
        imageUrl: image_url || null,
        role: isAdmin ? "ADMIN" : "PATIENT",
      },
    });

    // Create patient profile for non-admin users
    if (!isAdmin) {
      await prisma.patient.create({
        data: {
          userId: user.id,
        },
      });

      // Create free subscription
      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: "FREE",
          status: "ACTIVE",
          appointmentsPerMonth: 2,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_CREATED",
        entityType: "User",
        entityId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  }

  // Handle user.updated
  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const primaryEmail = email_addresses.find(
      (e) => e.id === evt.data.primary_email_address_id
    );

    if (primaryEmail) {
      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: primaryEmail.email_address,
          firstName: first_name || null,
          lastName: last_name || null,
          imageUrl: image_url || null,
        },
      });
    }

    return NextResponse.json({ success: true });
  }

  // Handle user.deleted
  if (eventType === "user.deleted") {
    const { id } = evt.data;

    // Soft delete - just update the record
    // In production, you might want to anonymize data instead
    const user = await prisma.user.findUnique({
      where: { clerkId: id },
    });

    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "USER_DELETED",
          entityType: "User",
          entityId: user.id,
        },
      });

      // Delete user and cascade
      await prisma.user.delete({
        where: { clerkId: id },
      });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ received: true });
}
