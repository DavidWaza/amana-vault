import type { LocationStepData } from "../types";

type LocationStepProps = {
  data: LocationStepData;
  onChange: (field: keyof LocationStepData, value: string) => void;
};

export default function LocationStep({ data, onChange }: LocationStepProps) {
  return (
    <>
      <div className="join-field">
        <label className="join-label" htmlFor="area">
          Primary Area
        </label>
        <select
          id="area"
          className="join-input join-select"
          value={data.area}
          onChange={(e) => onChange("area", e.target.value)}
          required
        >
          <option value="" disabled>
            Select your area...
          </option>
          <option value="gwarinpa">Gwarinpa</option>
          <option value="wuse">Wuse / Wuse 2</option>
          <option value="maitama">Maitama</option>
          <option value="garki">Garki</option>
          <option value="lugbe">Lugbe</option>
          <option value="kubwa">Kubwa</option>
          <option value="other">Other Abuja area</option>
        </select>
      </div>

      <div className="join-field">
        <label className="join-label" htmlFor="travelRadius">
          How far can you travel for jobs?
        </label>
        <select
          id="travelRadius"
          className="join-input join-select"
          value={data.travelRadius}
          onChange={(e) => onChange("travelRadius", e.target.value)}
        >
          <option value="">Select range...</option>
          <option value="5km">Within 5 km</option>
          <option value="10km">Within 10 km</option>
          <option value="abuja">Anywhere in Abuja</option>
          <option value="fct">Anywhere in FCT</option>
        </select>
      </div>
    </>
  );
}
