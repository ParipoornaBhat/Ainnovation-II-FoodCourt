"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/admin-layout";
import { ComponentLoading } from "@/app/_components/component-loading2";
export default function QuickLinksDashboard() {
  const utils = api.useUtils();
  const { data: links, isLoading } = api.quickLink.getAll.useQuery();

  const addLink = api.quickLink.add.useMutation({
    onSuccess: () => utils.quickLink.getAll.invalidate(),
  });
  const deleteLink = api.quickLink.delete.useMutation({
    onSuccess: () => utils.quickLink.getAll.invalidate(),
  });
  const toggleLink = api.quickLink.toggleActive.useMutation({
    onSuccess: () => utils.quickLink.getAll.invalidate(),
  });

  const [form, setForm] = useState({ title: "", description: "", url: "" });

  

  return (
    <AdminLayout>
      {isLoading ? (
        <ComponentLoading message="Loading Quick Links..." />
      ) : (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Manage Quick Links</h1>

      {/* Add New Link */}
      <div className="mb-6 space-y-2">
        <Input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <Input
          placeholder="URL"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
        />
        <Button
          onClick={() => {
            addLink.mutate(form);
            setForm({ title: "", description: "", url: "" });
          }}
        >
          Add Link
        </Button>
      </div>

      {/* List of Links */}
      <ul className="space-y-3">
        {links?.map((link) => (
          <li
            key={link.id}
            className="p-4 border rounded flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{link.title}</p>
              <p className="text-sm text-gray-600">{link.description}</p>
              <a
                href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                target="_blank"
                className="text-blue-600 underline"
                >
                {link.url}
            </a>

            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() =>
                  toggleLink.mutate({ id: link.id, active: !link.active })
                }
              >
                {link.active ? "Deactivate" : "Activate"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteLink.mutate({ id: link.id })}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
        </div>
      )}
  </AdminLayout>
  );
}
