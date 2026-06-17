"use client";

import { useMemo, useState } from "react";
import { Folder, File, DownloadSimple } from "phosphor-react";
import type { ProjectDocument, DocumentFolder } from "./types";
import { DOCUMENT_FOLDER_LABELS } from "./mock-data";

type DocumentCenterProps = {
  documents: ProjectDocument[];
};

const FOLDERS: DocumentFolder[] = [
  "architect_documents",
  "contracts",
  "receipts",
  "inspection_reports",
  "payment_records",
];

export default function DocumentCenter({ documents }: DocumentCenterProps) {
  const [activeFolder, setActiveFolder] = useState<DocumentFolder | "all">("all");

  const filtered = useMemo(() => {
    if (activeFolder === "all") return documents;
    return documents.filter((doc) => doc.folder === activeFolder);
  }, [documents, activeFolder]);

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: documents.length };
    for (const folder of FOLDERS) {
      counts[folder] = documents.filter((d) => d.folder === folder).length;
    }
    return counts;
  }, [documents]);

  return (
    <section className="cdash-section" id="documents">
      <header className="cdash-section-header">
        <div>
          <p className="adash-eyebrow">Document Center</p>
          <h2>All project files in one place</h2>
          <p>
            Architect documents, contracts, receipts, inspection reports, and payment
            records — organized by project.
          </p>
        </div>
      </header>

      <div className="cdash-doc-layout">
        <nav className="cdash-doc-folders" aria-label="Document folders">
          <button
            type="button"
            className={`cdash-doc-folder${activeFolder === "all" ? " cdash-doc-folder--active" : ""}`}
            onClick={() => setActiveFolder("all")}
          >
            <Folder size={18} weight="bold" />
            All Documents
            <span>{folderCounts.all}</span>
          </button>
          {FOLDERS.map((folder) => (
            <button
              key={folder}
              type="button"
              className={`cdash-doc-folder${activeFolder === folder ? " cdash-doc-folder--active" : ""}`}
              onClick={() => setActiveFolder(folder)}
            >
              <Folder size={18} weight="bold" />
              {DOCUMENT_FOLDER_LABELS[folder]}
              <span>{folderCounts[folder]}</span>
            </button>
          ))}
        </nav>

        <div className="cdash-doc-list-wrap">
          {filtered.length === 0 ? (
            <div className="adash-empty cdash-doc-empty">
              <h3>No documents in this folder</h3>
              <p>Files uploaded by your team will appear here.</p>
            </div>
          ) : (
            <ul className="cdash-doc-list">
              {filtered.map((doc) => (
                <li key={doc.id} className="cdash-doc-item">
                  <File size={20} weight="bold" />
                  <div>
                    <strong>{doc.name}</strong>
                    <span>
                      {doc.projectName} · {DOCUMENT_FOLDER_LABELS[doc.folder]} ·{" "}
                      {new Date(doc.uploadedAt).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      · {doc.sizeLabel}
                    </span>
                  </div>
                  <button type="button" className="adash-btn adash-btn--ghost" aria-label="Download">
                    <DownloadSimple size={18} weight="bold" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
