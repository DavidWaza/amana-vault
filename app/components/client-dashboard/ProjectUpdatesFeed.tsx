"use client";

import {
  Camera,
  File,
  VideoCamera,
  Wrench,
  SquaresFour,
  ShieldCheck,
} from "phosphor-react";
import type { ProjectUpdate } from "./types";
import { formatRelativeDate } from "./utils";

type ProjectUpdatesFeedProps = {
  updates: ProjectUpdate[];
};

const ROLE_ICONS = {
  architect: SquaresFour,
  contractor: Wrench,
  inspector: ShieldCheck,
  amana: ShieldCheck,
};

const ROLE_LABELS = {
  architect: "Architect",
  contractor: "Contractor",
  inspector: "Inspector",
  amana: "Amana",
};

export default function ProjectUpdatesFeed({ updates }: ProjectUpdatesFeedProps) {
  return (
    <section className="cdash-section" id="updates">
      <header className="cdash-section-header">
        <div>
          <p className="adash-eyebrow">Project Updates</p>
          <h2>Construction timeline</h2>
          <p>
            Follow every milestone, inspection, and design decision across your builds.
          </p>
        </div>
      </header>

      {updates.length === 0 ? (
        <div className="adash-empty">
          <h3>No updates yet</h3>
          <p>Project activity will appear here as your team posts progress.</p>
        </div>
      ) : (
        <ol className="cdash-updates-timeline">
          {updates.map((update) => {
            const Icon = ROLE_ICONS[update.professionalRole];
            return (
              <li key={update.id} className="cdash-update-item">
                <div className="cdash-update-marker">
                  <Icon size={18} weight="bold" />
                </div>
                <div className="cdash-update-body">
                  <div className="cdash-update-meta">
                    <time dateTime={update.date}>
                      {new Date(update.date).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                    <span>·</span>
                    <strong>{update.professional}</strong>
                    <span className="cdash-update-role">
                      {ROLE_LABELS[update.professionalRole]}
                    </span>
                    <span className="cdash-update-project">{update.projectName}</span>
                    <span className="cdash-update-relative">
                      {formatRelativeDate(update.date)}
                    </span>
                  </div>
                  <p>{update.update}</p>
                  <div className="cdash-update-attachments">
                    {(update.photos ?? 0) > 0 && (
                      <span>
                        <Camera size={14} weight="bold" />
                        {update.photos} photos
                      </span>
                    )}
                    {(update.videos ?? 0) > 0 && (
                      <span>
                        <VideoCamera size={14} weight="bold" />
                        {update.videos} videos
                      </span>
                    )}
                    {(update.documents ?? 0) > 0 && (
                      <span>
                        <File size={14} weight="bold" />
                        {update.documents} documents
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
