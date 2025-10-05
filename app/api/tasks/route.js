import connectToDB from "@/lib/mongodb";
import Task from "@/models/task";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectToDB();
    const owner = request.headers.get("x-user-id");
    // filter by owner and exclude tasks soft-deleted for this owner
    const filter = owner
      ? { owner, deletedFor: { $ne: owner } }
      : { deletedFor: { $size: 0 } };
    const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json(tasks);
  } catch (err) {
    console.error("GET /api/tasks error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, desc } = body || {};
    if (!title || !desc) {
      return NextResponse.json({ error: "Missing title or desc" }, { status: 400 });
    }
    const owner = request.headers.get("x-user-id");
    await connectToDB();
    const task = await Task.create({ title, desc, owner });
    const obj = task.toObject();
    obj._id = obj._id.toString();
    return NextResponse.json(obj, { status: 201 });
  } catch (err) {
    console.error("POST /api/tasks error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
