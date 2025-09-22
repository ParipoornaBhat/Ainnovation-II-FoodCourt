"use client";

import { api } from "@/trpc/react";
import { ComponentLoading } from "@/app/_components/component-loading3";
export default function QuickLinksPage() {
  const { data: links, isLoading } = api.quickLink.getActive.useQuery();

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-white dark:bg-gray-900">
      {isLoading ? (
        <ComponentLoading message="Loading quick links..." />
        
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            Quick Links
          </h1>

          {links?.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              No active quick links available.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(links ?? []).map((link) => (
                <li
                  key={link.id}
                  className="p-4 border rounded-lg shadow-sm
                             bg-gray-50 dark:bg-gray-800 
                             border-gray-200 dark:border-gray-700
                             hover:shadow-md transition"
                >
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {link.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {link.description}
                  </p>
                  <a
                    href={
                      link.url.startsWith("http") ? link.url : `https://${link.url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-blue-600 dark:text-blue-400 hover:underline break-words"
                  >
                    {link.url.replace(/^https?:\/\//, "")}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
