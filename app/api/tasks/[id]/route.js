import connectToDB from "@/lib/mongodb";
import Task from "@/models/task";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  try {
    const { id } = params || {};
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const owner = request.headers.get("x-user-id");
    if (!owner) {
      return NextResponse.json({ error: "Missing owner header" }, { status: 400 });
    }

    await connectToDB();
    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    if (task.owner && task.owner !== owner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // soft-delete for this owner: add owner to deletedFor array
    if (!task.deletedFor || !task.deletedFor.includes(owner)) {
      task.deletedFor = task.deletedFor || [];
      task.deletedFor.push(owner);
      await task.save();
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/tasks/[id] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
