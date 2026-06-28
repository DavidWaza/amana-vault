"use client";

import { useRef } from "react";
import { CloudArrowUp, File, Trash, MapPin } from "phosphor-react";
import {
  getLandPriceOptions,
  LAND_OWNERSHIP_DOC_HINTS,
  NIGERIAN_STATES,
} from "../land-data";
import type { BuildJourneyForm, LandDocument } from "../types";

type LandPanelsProps = {
  form: BuildJourneyForm;
  patchForm: (patch: Partial<BuildJourneyForm>) => void;
};

export function LandOwnershipPanel({ form, patchForm }: LandPanelsProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const readers = Array.from(files)
      .slice(0, 6 - form.landDocuments.length)
      .map(
        (file) =>
          new Promise<LandDocument>((resolve) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                name: file.name,
                kind: inferDocKind(file.name),
                dataUrl: String(reader.result),
              });
            reader.readAsDataURL(file);
          }),
      );

    void Promise.all(readers).then((docs) => {
      patchForm({
        landDocuments: [...form.landDocuments, ...docs].slice(0, 6),
      });
    });
  };

  const removeDoc = (id: string) => {
    patchForm({
      landDocuments: form.landDocuments.filter((doc) => doc.id !== id),
    });
  };

  return (
    <section className="bj-land-panel" aria-labelledby="bj-land-docs-title">
      <header className="bj-land-panel-header">
        <h3 id="bj-land-docs-title">Land ownership documents</h3>
        <p>
          Upload proof of ownership so your architect can verify the plot before
          design begins.
        </p>
      </header>

      <ul className="bj-land-doc-hints">
        {LAND_OWNERSHIP_DOC_HINTS.map((hint) => (
          <li key={hint}>{hint}</li>
        ))}
      </ul>

      <button
        type="button"
        className="bj-dropzone bj-dropzone--compact"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <CloudArrowUp size={28} weight="bold" />
        <strong>Upload land documents</strong>
        <span>PDF, JPG, or PNG — up to 6 files</span>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </button>

      {form.landDocuments.length > 0 && (
        <ul className="bj-land-doc-list">
          {form.landDocuments.map((doc) => (
            <li key={doc.id} className="bj-land-doc-item">
              <span className="bj-land-doc-icon">
                <File size={18} weight="bold" />
              </span>
              <div className="bj-land-doc-meta">
                <strong>{doc.name}</strong>
                <span>{doc.kind}</span>
              </div>
              <button
                type="button"
                className="bj-land-doc-remove"
                onClick={() => removeDoc(doc.id)}
                aria-label={`Remove ${doc.name}`}
              >
                <Trash size={16} weight="bold" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="bj-land-panel-note">
        At least one document is required to continue. Files are kept secure and
        shared only with verified professionals on your project.
      </p>
    </section>
  );
}

export function LandSearchPanel({ form, patchForm }: LandPanelsProps) {
  const priceOptions = getLandPriceOptions(form.preferredLandState);

  return (
    <section className="bj-land-panel" aria-labelledby="bj-land-search-title">
      <header className="bj-land-panel-header">
        <h3 id="bj-land-search-title">Where are you looking for land?</h3>
        <p>
          Choose a state and indicative plot price range. Amana can connect you
          with verified land partners in your preferred area.
        </p>
      </header>

      <label className="bj-field bj-field--full">
        <span className="bj-field-label">
          <MapPin size={16} weight="bold" />
          State in Nigeria
        </span>
        <select
          className="bj-select"
          value={form.preferredLandState}
          onChange={(e) =>
            patchForm({
              preferredLandState: e.target.value,
              landPriceRange: "",
            })
          }
        >
          <option value="">Select a state</option>
          {NIGERIAN_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </label>

      {form.preferredLandState && (
        <div className="bj-land-prices">
          <p className="bj-land-prices-title">
            Available plot prices in {form.preferredLandState}
          </p>
          <p className="bj-hint">Indicative market ranges for residential plots</p>
          <div className="bj-grid bj-grid--2">
            {priceOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`bj-land-price-card${form.landPriceRange === option.id ? " bj-land-price-card--selected" : ""}`}
                onClick={() => patchForm({ landPriceRange: option.id })}
              >
                <strong>{option.label}</strong>
                <span>{option.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function inferDocKind(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes("survey") || lower.includes("beacon")) return "Survey plan";
  if (lower.includes("deed") || lower.includes("conveyance")) return "Deed of assignment";
  if (lower.includes("c_of_o") || lower.includes("coo") || lower.includes("occupancy")) {
    return "Certificate of Occupancy";
  }
  if (lower.includes("receipt") || lower.includes("allocation")) {
    return "Purchase / allocation";
  }
  return "Ownership document";
}
