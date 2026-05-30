// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkCompanionLimit } from "@/lib/permissions";
import type { CompanionRelationship, CompanionGender, CompanionStyle } from "@/types/database";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to create a companion." } },
      { status: 401 },
    );
  }

  const body = await request.json();
  const { name, relationship, gender, style, avatarUrl } = body as {
    name: string;
    relationship: CompanionRelationship;
    gender: CompanionGender;
    style: CompanionStyle;
    avatarUrl?: string;
  };

  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Name is required." } },
      { status: 400 },
    );
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 20) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Name must be 2-20 characters." } },
      { status: 400 },
    );
  }

  const validRelationships: CompanionRelationship[] = [
    "romantic_partner", "close_friend", "life_mentor", "fictional_character",
  ];
  if (!validRelationships.includes(relationship)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid relationship type." } },
      { status: 400 },
    );
  }

  const validGenders: CompanionGender[] = ["male", "female", "non_binary", "any"];
  if (!validGenders.includes(gender)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid gender." } },
      { status: 400 },
    );
  }

  const validStyles: CompanionStyle[] = ["realistic", "anime", "fantasy"];
  if (!validStyles.includes(style)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid style." } },
      { status: 400 },
    );
  }

  // Centralized companion limit check
  const limitCheck = await checkCompanionLimit(user.id, supabase);
  if (!limitCheck.allowed) {
    return NextResponse.json(
      { error: { code: "LIMIT_REACHED", message: limitCheck.reason } },
      { status: 429 },
    );
  }

  const { data: companion, error } = await supabase
    .from("companions")
    .insert({
      user_id: user.id,
      name: trimmedName,
      relationship,
      gender,
      style,
      avatar_url: avatarUrl ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Companion creation error:", error);
    return NextResponse.json(
      { error: { code: "CREATE_FAILED", message: error.message } },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: companion }, { status: 201 });
}
