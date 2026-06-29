"use client";

import { useRef } from "react";
import {
  ArrowRight,
  Buildings,
  ChatsCircle,
  CheckCircle,
  CloudArrowUp,
  House,
  LockSimple,
  Microphone,
  PencilSimple,
  Question,
  Sparkle,
  Storefront,
  Tree,
  UsersThree,
  Wrench,
} from "phosphor-react";
import AmanaLogo from "../../join-amana/AmanaLogo";
import {
  ARCHITECT_FEE_PERCENTS,
  BUILD_JOURNEY_HERO,
  FEEL_OPTIONS,
  HOME_TYPE_OPTIONS,
  JOURNEY_STAGE_OPTIONS,
  PRIORITY_OPTIONS,
  PROJECT_RANGE_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  STYLE_OPTIONS,
  WELCOME_TRUST_ITEMS,
  labelForOption,
  labelForStyle,
} from "./constants";
import { labelForLandPrice } from "./land-data";
import {
  FeeToggleCard,
  FeelChipCard,
  IconOptionCard,
  ImageOptionCard,
  PercentPill,
  PriorityCheckbox,
  RangeCard,
} from "./components/JourneyCards";
import { LandOwnershipPanel, LandSearchPanel } from "./components/LandJourneyPanels";
import type { BuildJourneyForm } from "./types";
import { formatNaira } from "../utils";

const PROJECT_TYPE_ICONS: Record<string, React.ReactNode> = {
  family_home: <House size={22} weight="bold" />,
  apartments: <Buildings size={22} weight="bold" />,
  commercial: <Storefront size={22} weight="bold" />,
  hospitality: <Sparkle size={22} weight="bold" />,
  renovation: <Wrench size={22} weight="bold" />,
  community: <UsersThree size={22} weight="bold" />,
  something_else: <Question size={22} weight="bold" />,
};

const JOURNEY_ICONS: Record<string, React.ReactNode> = {
  own_land: <House size={22} weight="bold" />,
  looking_for_land: <Tree size={22} weight="bold" />,
  only_design: <PencilSimple size={22} weight="bold" />,
  have_drawings: <CheckCircle size={22} weight="bold" />,
  have_contractor: <UsersThree size={22} weight="bold" />,
};

type StepProps = {
  form: BuildJourneyForm;
  patchForm: (patch: Partial<BuildJourneyForm>) => void;
  onBegin?: () => void;
  onEditStep?: (index: number) => void;
  onSubmit?: () => void;
};

export function WelcomeStep({ onBegin }: Pick<StepProps, "onBegin">) {
  return (
    <div className="bj-welcome">
      <div className="bj-welcome-copy">
        <div className="bj-welcome-brand">
          <AmanaLogo size={48} variant="green" />
          <div>
            <strong>Amana</strong>
            <span>Vault</span>
          </div>
        </div>
        <h1>Start Your Build Journey</h1>
        <p>
          Tell us about your vision and we&apos;ll connect you with verified
          architects who understand your style, budget, and goals.
        </p>
        <ul className="bj-trust-list">
          {WELCOME_TRUST_ITEMS.map((item) => (
            <li key={item}>
              <CheckCircle size={18} weight="fill" />
              {item}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="bj-btn-primary bj-btn-primary--lg"
          onClick={onBegin}
        >
          Begin Your Build Journey
          <ArrowRight size={18} weight="bold" />
        </button>
        <p className="bj-welcome-note">Takes about 5–7 minutes</p>
      </div>
      <div
        className="bj-welcome-image"
        style={{ backgroundImage: `url(${BUILD_JOURNEY_HERO})` }}
        role="img"
        aria-label="Modern luxury home"
      />
    </div>
  );
}

export function ProjectTypeStep({ form, patchForm }: StepProps) {
  return (
    <div className="bj-grid bj-grid--2">
      {PROJECT_TYPE_OPTIONS.map((option) => (
        <IconOptionCard
          key={option.id}
          selected={form.projectType === option.id}
          onClick={() => patchForm({ projectType: option.id })}
          icon={PROJECT_TYPE_ICONS[option.id]}
          label={option.label}
          description={option.description}
        />
      ))}
    </div>
  );
}

export function HomeTypeStep({ form, patchForm }: StepProps) {
  return (
    <>
      <div className="bj-grid bj-grid--3">
        {HOME_TYPE_OPTIONS.map((option) => (
          <ImageOptionCard
            key={option.id}
            selected={form.homeType === option.id}
            onClick={() => patchForm({ homeType: option.id })}
            image={option.image ?? BUILD_JOURNEY_HERO}
            label={option.label}
            description={option.description}
          />
        ))}
      </div>
      <button
        type="button"
        className={`bj-card bj-card--wide${form.homeType === "not_sure" ? " bj-card--selected" : ""}`}
        onClick={() => patchForm({ homeType: "not_sure" })}
      >
        <span className="bj-card-icon">
          <Question size={22} weight="bold" />
        </span>
        <span className="bj-card-copy">
          <strong>Not Sure Yet</strong>
          <span>
            We&apos;ll help you decide during your architect consultation.
          </span>
        </span>
      </button>
    </>
  );
}

export function StyleStep({ form, patchForm }: StepProps) {
  return (
    <>
      <div className="bj-grid bj-grid--3">
        {STYLE_OPTIONS.map((option) => (
          <ImageOptionCard
            key={option.id}
            selected={form.style === option.id}
            onClick={() => patchForm({ style: option.id, customStyle: "" })}
            image={option.image ?? BUILD_JOURNEY_HERO}
            label={option.label}
            description={option.description}
          />
        ))}
        <button
          type="button"
          className={`bj-card bj-card--image${form.style === "custom" ? " bj-card--selected" : ""}`}
          onClick={() => patchForm({ style: "custom" })}
        >
          <span className="bj-card-image bj-card-image--custom">
            <PencilSimple size={28} weight="bold" />
          </span>
          <span className="bj-card-copy">
            <strong>Custom Style</strong>
            <span>I have something unique in mind.</span>
          </span>
        </button>
      </div>
      {form.style === "custom" && (
        <label className="bj-field bj-field--full">
          Describe your custom style
          <textarea
            className="bj-textarea"
            rows={3}
            maxLength={200}
            value={form.customStyle}
            onChange={(e) => patchForm({ customStyle: e.target.value })}
            placeholder="Tell us what makes your vision unique…"
          />
        </label>
      )}
    </>
  );
}

export function FeelStep({ form, patchForm }: StepProps) {
  const toggleFeel = (id: string) => {
    const exists = form.feels.includes(id);
    if (exists) {
      patchForm({ feels: form.feels.filter((item) => item !== id) });
      return;
    }
    if (form.feels.length >= 3) return;
    patchForm({ feels: [...form.feels, id] });
  };

  return (
    <>
      <p className="bj-hint">Select up to 3</p>
      <div className="bj-grid bj-grid--3">
        {FEEL_OPTIONS.map((option) => (
          <FeelChipCard
            key={option.id}
            selected={form.feels.includes(option.id)}
            onClick={() => toggleFeel(option.id)}
            label={option.label}
          />
        ))}
      </div>
      <label className="bj-field bj-field--full">
        Anything else we should know? (optional)
        <textarea
          className="bj-textarea"
          rows={3}
          maxLength={300}
          value={form.feelNotes}
          onChange={(e) => patchForm({ feelNotes: e.target.value })}
          placeholder="Share details about how you want the home to feel day to day…"
        />
        <span className="bj-char-count">{form.feelNotes.length}/300</span>
      </label>
    </>
  );
}

export function JourneyStageStep({ form, patchForm }: StepProps) {
  const selectStage = (id: string) => {
    patchForm({
      journeyStage: id,
      ...(id !== "own_land" ? { landDocuments: [] } : {}),
      ...(id !== "looking_for_land"
        ? { preferredLandState: "", landPriceRange: "" }
        : {}),
    });
  };

  return (
    <div className="bj-stack">
      {JOURNEY_STAGE_OPTIONS.map((option) => (
        <IconOptionCard
          key={option.id}
          selected={form.journeyStage === option.id}
          onClick={() => selectStage(option.id)}
          icon={JOURNEY_ICONS[option.id]}
          label={option.label}
          description={option.description}
        />
      ))}

      {form.journeyStage === "own_land" && (
        <LandOwnershipPanel form={form} patchForm={patchForm} />
      )}

      {form.journeyStage === "looking_for_land" && (
        <LandSearchPanel form={form} patchForm={patchForm} />
      )}
    </div>
  );
}

export function RangePrioritiesStep({ form, patchForm }: StepProps) {
  const togglePriority = (id: string) => {
    const exists = form.priorities.includes(id);
    if (exists) {
      patchForm({ priorities: form.priorities.filter((item) => item !== id) });
      return;
    }
    if (form.priorities.length >= 5) return;
    patchForm({ priorities: [...form.priorities, id] });
  };

  return (
    <>
      <section className="bj-section-block">
        <h2>What&apos;s your project range?</h2>
        <div className="bj-grid bj-grid--4">
          {PROJECT_RANGE_OPTIONS.map((option) => (
            <RangeCard
              key={option.id}
              selected={form.projectRange === option.id}
              onClick={() => patchForm({ projectRange: option.id })}
              label={option.label}
              description={option.description}
            />
          ))}
        </div>
      </section>
      <section className="bj-section-block">
        <h2>What matters most to you?</h2>
        <p className="bj-hint">Select up to 5</p>
        <div className="bj-grid bj-grid--2">
          {PRIORITY_OPTIONS.map((option) => (
            <PriorityCheckbox
              key={option.id}
              checked={form.priorities.includes(option.id)}
              onChange={() => togglePriority(option.id)}
              label={option.label}
            />
          ))}
        </div>
      </section>
    </>
  );
}

export function ArchitectFeeStep({ form, patchForm }: StepProps) {
  return (
    <>
      <div className="bj-grid bj-grid--2">
        <FeeToggleCard
          selected={form.architectFeeType === "flat"}
          onClick={() =>
            patchForm({
              architectFeeType: "flat",
              architectFeePercent: null,
              architectFeeAmount: form.architectFeeAmount,
            })
          }
          title="Flat Fee"
          description="A fixed architect fee agreed upfront for the full design scope."
        />
        <FeeToggleCard
          selected={form.architectFeeType === "percentage"}
          onClick={() =>
            patchForm({
              architectFeeType: "percentage",
              architectFeePercent: form.architectFeePercent ?? 7.5,
              architectFeeAmount: null,
            })
          }
          title="Percentage of Overall Build Cost"
          description="Architect fee scales with your total construction budget."
        />
      </div>
      {form.architectFeeType === "percentage" && (
        <div className="bj-percent-row">
          {ARCHITECT_FEE_PERCENTS.map((value) => (
            <PercentPill
              key={value}
              value={value}
              selected={form.architectFeePercent === value}
              onClick={() => patchForm({ architectFeePercent: value })}
            />
          ))}
        </div>
      )}
      {form.architectFeeType === "flat" && (
        <label className="bj-field bj-field--full">
          Flat fee amount
          <div className="bj-currency-input">
            <span>₦</span>
            <input
              type="number"
              min={0}
              step={100000}
              inputMode="numeric"
              placeholder="e.g. 2500000"
              value={form.architectFeeAmount ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                patchForm({
                  architectFeeAmount: raw === "" ? null : Math.max(0, Number(raw) || 0),
                });
              }}
            />
          </div>
          {form.architectFeeAmount !== null && form.architectFeeAmount > 0 && (
            <span className="bj-currency-preview">
              {formatNaira(form.architectFeeAmount)}
            </span>
          )}
        </label>
      )}
      <p className="bj-footnote">
        Architect fees typically cover concept design, working drawings, and
        milestone reviews. Final terms are agreed with your chosen architect.
      </p>
    </>
  );
}

export function InspirationStep({ form, patchForm }: StepProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const readers = Array.from(files)
      .slice(0, 6)
      .map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(file);
          }),
      );
    void Promise.all(readers).then((images) => {
      patchForm({
        inspirationImages: [...form.inspirationImages, ...images].slice(0, 8),
      });
    });
  };

  return (
    <>
      <div className="bj-inspo-tabs">
        <button type="button" className="bj-inspo-tab bj-inspo-tab--active">
          Upload Photos
        </button>
        <button type="button" className="bj-inspo-tab" disabled>
          Pinterest
        </button>
        <button type="button" className="bj-inspo-tab" disabled>
          Ideas Board
        </button>
      </div>

      <button
        type="button"
        className="bj-dropzone"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <CloudArrowUp size={32} weight="bold" />
        <strong>Drag & drop inspiration photos</strong>
        <span>or click to browse from your device</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </button>

      {form.inspirationImages.length > 0 && (
        <div className="bj-thumb-grid">
          {form.inspirationImages.map((src, index) => (
            <div
              key={`${src.slice(0, 24)}-${index}`}
              className="bj-thumb"
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>
      )}

      <div className="bj-inspo-actions">
        <button
          type="button"
          className="bj-btn-outline"
          onClick={() => patchForm({ voiceNoteAdded: !form.voiceNoteAdded })}
        >
          <Microphone size={18} weight="bold" />
          {form.voiceNoteAdded ? "Voice note added" : "Add Voice Note"}
        </button>
        <button
          type="button"
          className="bj-btn-outline"
          onClick={() => {
            const note = window.prompt("Write a short note to your architect:");
            if (note !== null) patchForm({ inspirationNote: note });
          }}
        >
          <ChatsCircle size={18} weight="bold" />
          Write to Architect
        </button>
      </div>

      <label className="bj-field bj-field--full">
        Message to architect (optional)
        <textarea
          className="bj-textarea"
          rows={3}
          maxLength={500}
          value={form.inspirationNote}
          onChange={(e) => patchForm({ inspirationNote: e.target.value })}
          placeholder="Share links, references, or anything else that helps explain your vision…"
        />
      </label>
    </>
  );
}

const REVIEW_ITEMS = [
  {
    key: "projectType",
    label: "Project Type",
    step: 1,
    options: PROJECT_TYPE_OPTIONS,
  },
  { key: "homeType", label: "Home Type", step: 2, options: HOME_TYPE_OPTIONS },
  { key: "style", label: "Style", step: 3, options: STYLE_OPTIONS },
  { key: "feels", label: "Home Feel", step: 4, options: FEEL_OPTIONS },
  {
    key: "journeyStage",
    label: "Journey Stage",
    step: 5,
    options: JOURNEY_STAGE_OPTIONS,
  },
  {
    key: "projectRange",
    label: "Project Range",
    step: 6,
    options: PROJECT_RANGE_OPTIONS,
  },
] as const;

export function ReviewStep({ form, onEditStep, onSubmit }: StepProps) {
  const valueFor = (key: (typeof REVIEW_ITEMS)[number]["key"]) => {
    switch (key) {
      case "style":
        return labelForStyle(form);
      case "feels":
        return (
          form.feels.map((id) => labelForOption(FEEL_OPTIONS, id)).join(", ") ||
          "—"
        );
      default:
        return labelForOption(
          REVIEW_ITEMS.find((item) => item.key === key)!.options,
          form[key],
        );
    }
  };

  return (
    <div className="bj-review">
      <div className="bj-review-summary">
        <h2>Your build brief</h2>
        <ul>
          {REVIEW_ITEMS.map((item) => (
            <li key={item.key}>
              <div>
                <span>{item.label}</span>
                <strong>{valueFor(item.key)}</strong>
              </div>
              <button
                type="button"
                className="bj-btn-text"
                onClick={() => onEditStep?.(item.step)}
              >
                Edit
              </button>
            </li>
          ))}
          {form.journeyStage === "own_land" && (
            <li>
              <div>
                <span>Land documents</span>
                <strong>
                  {form.landDocuments.length
                    ? form.landDocuments.map((doc) => doc.name).join(", ")
                    : "—"}
                </strong>
              </div>
              <button
                type="button"
                className="bj-btn-text"
                onClick={() => onEditStep?.(5)}
              >
                Edit
              </button>
            </li>
          )}
          {form.journeyStage === "looking_for_land" && (
            <>
              <li>
                <div>
                  <span>Land search state</span>
                  <strong>{form.preferredLandState || "—"}</strong>
                </div>
                <button
                  type="button"
                  className="bj-btn-text"
                  onClick={() => onEditStep?.(5)}
                >
                  Edit
                </button>
              </li>
              <li>
                <div>
                  <span>Land price range</span>
                  <strong>
                    {form.landPriceRange
                      ? labelForLandPrice(
                          form.preferredLandState,
                          form.landPriceRange,
                        )
                      : "—"}
                  </strong>
                </div>
                <button
                  type="button"
                  className="bj-btn-text"
                  onClick={() => onEditStep?.(5)}
                >
                  Edit
                </button>
              </li>
            </>
          )}
          <li>
            <div>
              <span>Priorities</span>
              <strong>
                {form.priorities
                  .map((id) => labelForOption(PRIORITY_OPTIONS, id))
                  .join(", ") || "—"}
              </strong>
            </div>
            <button
              type="button"
              className="bj-btn-text"
              onClick={() => onEditStep?.(6)}
            >
              Edit
            </button>
          </li>
          <li>
            <div>
              <span>Architect Fee</span>
              <strong>
                {form.architectFeeType === "flat"
                  ? form.architectFeeAmount
                    ? formatNaira(form.architectFeeAmount)
                    : "Flat fee"
                  : `${form.architectFeePercent ?? 7.5}% of build cost`}
              </strong>
            </div>
            <button
              type="button"
              className="bj-btn-text"
              onClick={() => onEditStep?.(7)}
            >
              Edit
            </button>
          </li>
          <li>
            <div>
              <span>Inspiration</span>
              <strong>
                {form.inspirationImages.length
                  ? `${form.inspirationImages.length} photo(s)`
                  : "None uploaded"}
              </strong>
            </div>
            <button
              type="button"
              className="bj-btn-text"
              onClick={() => onEditStep?.(8)}
            >
              Edit
            </button>
          </li>
        </ul>
      </div>

      <aside className="bj-review-aside">
        <div className="bj-next-box">
          <h3>What happens next?</h3>
          <ol>
            <li>
              Your brief is shared with architects on the marketplace.
            </li>
            <li>
              Verified professionals review your vision and submit proposals.
            </li>
            <li>
              You compare options, choose your architect, and protect funds in
              the Vault.
            </li>
          </ol>
        </div>
        <div className="bj-secure-note">
          <LockSimple size={18} weight="bold" />
          <span>
            Your information is secure and only shared with verified
            professionals.
          </span>
        </div>
        <button
          type="button"
          className="bj-btn-primary bj-btn-primary--lg bj-btn-primary--full"
          onClick={onSubmit}
        >
          Send Idea to Architect Marketplace
          <ArrowRight size={18} weight="bold" />
        </button>
      </aside>
    </div>
  );
}
