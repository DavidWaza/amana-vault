import type { TradeStepData } from "../types";

type TradeStepProps = {
  data: TradeStepData;
  onChange: (field: keyof TradeStepData, value: string) => void;
  onCategoryChange: (value: string) => void;
  showOtherTradeError: boolean;
  onOtherTradeBlur: () => void;
};

export default function TradeStep({
  data,
  onChange,
  onCategoryChange,
  showOtherTradeError,
  onOtherTradeBlur,
}: TradeStepProps) {
  return (
    <>
      <div className="join-field">
        <label className="join-label" htmlFor="category">
          Service Category
        </label>
        <select
          id="category"
          className="join-input join-select"
          value={data.category}
          onChange={(e) => onCategoryChange(e.target.value)}
          required
        >
          <option value="" disabled>
            Select your trade...
          </option>
          <option value="borehole">Borehole Drilling</option>
          <option value="solar">Solar & Electrical</option>
          <option value="plumbing">Plumbing</option>
          <option value="carpentry">Carpentry & Furniture</option>
          <option value="painting">Painting</option>
          <option value="pop">POP Ceiling</option>
          <option value="tiling">Tiling & Flooring</option>
          <option value="other">Other</option>
        </select>
      </div>

      {data.category === "other" && (
        <div className="join-field">
          <label className="join-label" htmlFor="otherTrade">
            Specify your trade
          </label>
          <input
            id="otherTrade"
            type="text"
            className={`join-input${showOtherTradeError ? " join-input--error" : ""}`}
            placeholder="e.g. AC Installation, Welding, Landscaping"
            value={data.otherTrade}
            onChange={(e) => onChange("otherTrade", e.target.value)}
            onBlur={onOtherTradeBlur}
            required
          />
          {showOtherTradeError ? (
            <p className="join-field-error" role="alert">
              Please describe the trade you offer
            </p>
          ) : (
            <p className="join-field-hint">
              Tell us the service you specialize in
            </p>
          )}
        </div>
      )}

      <div className="join-field">
        <label className="join-label" htmlFor="experience">
          Years of Experience
        </label>
        <select
          id="experience"
          className="join-input join-select"
          value={data.experience}
          onChange={(e) => onChange("experience", e.target.value)}
          required
        >
          <option value="" disabled>
            Select experience...
          </option>
          <option value="1-2">1–2 years</option>
          <option value="3-5">3–5 years</option>
          <option value="6-10">6–10 years</option>
          <option value="10+">10+ years</option>
        </select>
      </div>

      <div className="join-field">
        <label className="join-label" htmlFor="bio">
          Short Bio
        </label>
        <textarea
          id="bio"
          className="join-input join-textarea"
          placeholder="Tell clients what makes your work stand out..."
          rows={3}
          value={data.bio}
          onChange={(e) => onChange("bio", e.target.value)}
        />
      </div>
    </>
  );
}
