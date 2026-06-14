import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MoneyDisplay from '../MoneyDisplay';

describe('MoneyDisplay', () => {
  it('应正确渲染金额', () => {
    render(<MoneyDisplay value={1000} />);
    const display = screen.getByTestId('money-display');
    expect(display).toBeInTheDocument();
    expect(display.textContent).toContain('¥1,000');
  });

  it('应正确渲染带标签的金额', () => {
    render(<MoneyDisplay value={2500} label="合同金额" />);
    expect(screen.getByText('合同金额')).toBeInTheDocument();
    expect(screen.getByText('¥2,500')).toBeInTheDocument();
  });

  it('值为0时应正确显示', () => {
    render(<MoneyDisplay value={0} />);
    expect(screen.getByText('¥0')).toBeInTheDocument();
  });

  it('值为负数时应正确显示', () => {
    render(<MoneyDisplay value={-500} />);
    expect(screen.getByText(/-¥500/)).toBeInTheDocument();
  });

  it('值为空或undefined时应显示¥0', () => {
    render(<MoneyDisplay value={null} />);
    expect(screen.getByText('¥0')).toBeInTheDocument();
  });

  it('大金额应正确格式化千分位', () => {
    render(<MoneyDisplay value={1234567} />);
    expect(screen.getByText('¥1,234,567')).toBeInTheDocument();
  });
});
