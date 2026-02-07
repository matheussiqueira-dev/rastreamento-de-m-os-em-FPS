import React from 'react';
import { TrackerCalibration } from '../types';

interface CalibrationPanelProps {
  calibration: TrackerCalibration;
  onChange: (calibration: TrackerCalibration) => void;
  onReset: () => void;
  onClose: () => void;
}

interface SliderFieldProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}

const SliderField: React.FC<SliderFieldProps> = ({ label, min, max, step, value, onChange }) => (
  <label className="slider-field">
    <span>
      {label}
      <strong>{value.toFixed(3)}</strong>
    </span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  </label>
);

const CalibrationPanel: React.FC<CalibrationPanelProps> = ({ calibration, onChange, onReset, onClose }) => {
  const update = (patch: Partial<TrackerCalibration>) => onChange({ ...calibration, ...patch });

  return (
    <aside className="calibration-panel" aria-label="Calibração de gestos">
      <header>
        <p>Calibração</p>
        <button type="button" className="ghost-btn" onClick={onClose}>
          Fechar
        </button>
      </header>

      <SliderField
        label="Centro X do movimento"
        min={0.1}
        max={0.45}
        step={0.005}
        value={calibration.movementCenterX}
        onChange={(value) => update({ movementCenterX: value })}
      />

      <SliderField
        label="Centro Y do movimento"
        min={0.3}
        max={0.7}
        step={0.005}
        value={calibration.movementCenterY}
        onChange={(value) => update({ movementCenterY: value })}
      />

      <SliderField
        label="Deadzone movimento"
        min={0.04}
        max={0.18}
        step={0.002}
        value={calibration.movementDeadzone}
        onChange={(value) => update({ movementDeadzone: value })}
      />

      <SliderField
        label="Limite punho fechado"
        min={0.09}
        max={0.2}
        step={0.002}
        value={calibration.fistStopThreshold}
        onChange={(value) => update({ fistStopThreshold: value })}
      />

      <SliderField
        label="Extensão indicador"
        min={0.2}
        max={0.42}
        step={0.002}
        value={calibration.indexExtendedThreshold}
        onChange={(value) => update({ indexExtendedThreshold: value })}
      />

      <SliderField
        label="Curvatura de tiro"
        min={0.07}
        max={0.24}
        step={0.002}
        value={calibration.fireCurlThreshold}
        onChange={(value) => update({ fireCurlThreshold: value })}
      />

      <SliderField
        label="Abertura para recarga"
        min={0.2}
        max={0.42}
        step={0.002}
        value={calibration.openHandThreshold}
        onChange={(value) => update({ openHandThreshold: value })}
      />

      <label className="slider-field">
        <span>
          Suavização (frames)
          <strong>{calibration.smoothingFrames}</strong>
        </span>
        <input
          type="range"
          min={1}
          max={6}
          step={1}
          value={calibration.smoothingFrames}
          onChange={(event) => update({ smoothingFrames: Number(event.target.value) })}
        />
      </label>

      <button type="button" className="secondary-btn" onClick={onReset}>
        Restaurar padrão
      </button>
    </aside>
  );
};

export default CalibrationPanel;
