import { Form } from "react-bootstrap";
import { unitStats } from "../../model/Constants";
import { statNames } from "../../model/Constants";
import { forwardRef } from "react";

const CustomStats = forwardRef(({ id, customStats, onChange, lc }, ref) => {
  return (
    <div id={id} className="CustomStats" popover="auto" ref={ref}>
      {unitStats.map((statKey) => (
        <Form.Group className="mb-3" key={statKey} controlId={statKey}>
          <Form.Label>{lc(statNames[statKey])}</Form.Label>
          <Form.Control
            type="number"
            min="0"
            required
            value={customStats[statKey] ?? 0}
            onChange={(e) => onChange?.(e, statKey)}
          />
        </Form.Group>
      ))}
    </div>
  );
});

export default CustomStats;
