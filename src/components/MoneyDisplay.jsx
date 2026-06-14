import { money } from '../utils/dateMoneyUtils';

function MoneyDisplay({ value, label }) {
  return (
    <div className="money-display" data-testid="money-display">
      {label && <span className="money-label">{label}</span>}
      <span className="money-value">{money(value)}</span>
    </div>
  );
}

export default MoneyDisplay;
