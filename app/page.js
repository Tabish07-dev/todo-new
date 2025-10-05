"use client";

import React, { useState, useEffect } from "react";

const Home = () => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [mainTask, setMainTask] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndSync = async () => {
      // ensure a per-device user id so tasks are scoped per user
      let userId = localStorage.getItem("todo_user_id");
      if (!userId) {
        userId = Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem("todo_user_id", userId);
      }
      try {
        const res = await fetch("/api/tasks", { headers: { "x-user-id": userId } });
        if (!res.ok) throw new Error("Failed to fetch server tasks");
        const serverTasks = await res.json();
        const localTasks = JSON.parse(localStorage.getItem("tasks") || "[]");

        if (serverTasks.length === 0 && localTasks.length > 0) {
          for (const t of localTasks) {
            await fetch("/api/tasks", {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-user-id": userId },
              body: JSON.stringify({ title: t.title, desc: t.desc }),
            });
          }
          const res2 = await fetch("/api/tasks");
          const newServerTasks = await res2.json();
          setMainTask(newServerTasks);
          localStorage.setItem("tasks", JSON.stringify(newServerTasks));
        } else {
          setMainTask(serverTasks);
          localStorage.setItem("tasks", JSON.stringify(serverTasks));
        }
      } catch (err) {
        console.error("Fetch error, falling back to localStorage", err);
        const local = JSON.parse(localStorage.getItem("tasks") || "[]");
        setMainTask(local);
      } finally {
        setLoading(false);
      }
    };
    fetchAndSync();
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(mainTask));
  }, [mainTask]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!title || !desc) {
      alert("Please add task");
      return;
    }

    try {
      const userId = localStorage.getItem("todo_user_id");
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ title, desc }),
      });
      if (!res.ok) throw new Error("Server error while adding");
      const created = await res.json();
      setMainTask((prev) => [created, ...prev]);
      setTitle("");
      setDesc("");
    } catch (err) {
      console.error(err);
      alert("Could not add task. Check console.");
    }
  };

  const deleteHandler = async (id) => {
    if (!confirm("Are you sure to delete this task?")) return;
    try {
      const userId = localStorage.getItem("todo_user_id");
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE", headers: { "x-user-id": userId } });
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { message: text };
      }
      if (!res.ok) {
        const errMsg = data.error || data.message || "Delete failed";
        throw new Error(errMsg);
      }
      setMainTask((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
      alert("Could not delete. Check console.");
    }
  };

  let renderTask = (
    <p className="text-center text-gray-500 text-xl font-semibold">
      No tasks available 💤
    </p>
  );

  if (mainTask.length > 0) {
    renderTask = mainTask.map((t) => (
      <li
        key={t._id}
        className="bg-white shadow-md rounded-2xl p-5 flex justify-between items-center hover:shadow-xl transition-all duration-300 mb-4"
      >
        <div className="w-3/4">
          <h5 className="text-2xl font-semibold text-gray-800 mb-1">
            {t.title}
          </h5>
          <p className="text-gray-600 text-lg">{t.desc}</p>
        </div>

        <button
          onClick={() => deleteHandler(t._id)}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-semibold transition-all duration-300"
        >
          Delete
        </button>
      </li>
    ));
  }

  return (
    <>
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-6 text-center shadow-lg">
        <h1 className="text-5xl font-extrabold tracking-wide">
          Tabi's <span className="text-yellow-300">ToDo</span> List
        </h1>
        <p className="text-sm mt-2 text-gray-100">
          Manage your daily tasks like a pro 🚀
        </p>
      </header>

      <form
        onSubmit={submitHandler}
        className="flex flex-col md:flex-row justify-center items-center gap-4 mt-8 px-6"
      >
        <input
          type="text"
          placeholder="Enter title..."
          className="w-full md:w-1/3 border border-gray-400 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter description..."
          className="w-full md:w-1/3 border border-gray-400 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-md transition-all duration-300"
        >
          Add Task
        </button>
      </form>

      <section className="p-8 mt-10 bg-gradient-to-b from-slate-100 to-slate-200 min-h-[60vh]">
        {loading ? (
          <p className="text-center text-gray-600 text-xl font-medium">
            Loading your tasks…
          </p>
        ) : (
          <ul className="max-w-3xl mx-auto">{renderTask}</ul>
        )}
      </section>
    </>
  );
};

export default Home;
